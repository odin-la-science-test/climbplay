import * as THREE from 'three';

// ============================================================
// IK-SOLVER.JS — Inverse Kinematics for GLB models
// ============================================================

export class IKSolver {
  constructor(model) {
    this.model = model;
    this.chains = {};
  }

  // Create an IK chain (e.g., shoulder -> elbow -> wrist -> hand)
  createChain(name, boneNames) {
    const bones = [];
    
    this.model.traverse((child) => {
      if (child.isBone) {
        const boneName = child.name.toLowerCase();
        for (const searchName of boneNames) {
          if (boneName.includes(searchName.toLowerCase())) {
            bones.push(child);
            break;
          }
        }
      }
    });
    
    if (bones.length > 0) {
      this.chains[name] = {
        bones: bones,
        lengths: this._calculateLengths(bones)
      };
      console.log(`✅ IK Chain "${name}" created with ${bones.length} bones`);
    } else {
      console.warn(`⚠️ IK Chain "${name}" not found`);
    }
  }

  _calculateLengths(bones) {
    const lengths = [];
    for (let i = 0; i < bones.length - 1; i++) {
      const pos1 = new THREE.Vector3();
      const pos2 = new THREE.Vector3();
      bones[i].getWorldPosition(pos1);
      bones[i + 1].getWorldPosition(pos2);
      const length = pos1.distanceTo(pos2);
      // Ensure minimum length to avoid division by zero
      lengths.push(Math.max(length, 0.01));
    }
    return lengths;
  }

  // Solve IK for a chain to reach a target position (in local space)
  solve(chainName, targetPos, iterations = 10) {
    const chain = this.chains[chainName];
    if (!chain || !chain.bones || chain.bones.length < 2) {
      return false;
    }

    const bones = chain.bones;

    // Update all bone matrices first
    bones.forEach(bone => bone.updateMatrixWorld(true));

    // FABRIK algorithm (Forward And Backward Reaching Inverse Kinematics)
    const positions = bones.map(bone => {
      const pos = new THREE.Vector3();
      bone.getWorldPosition(pos);
      return pos;
    });

    const lengths = chain.lengths;
    if (!lengths || lengths.length === 0) {
      return false;
    }
    
    const totalLength = lengths.reduce((sum, len) => sum + len, 0);

    // Target is already in world space
    const worldTarget = targetPos.clone();

    // Check if target is reachable
    const rootPos = positions[0].clone();
    const distToTarget = rootPos.distanceTo(worldTarget);
    
    if (distToTarget > totalLength * 0.99) {
      // Target too far, stretch towards it
      const direction = new THREE.Vector3().subVectors(worldTarget, rootPos).normalize();
      let currentPos = rootPos.clone();
      
      for (let i = 0; i < bones.length - 1; i++) {
        const nextPos = currentPos.clone().add(direction.clone().multiplyScalar(lengths[i]));
        this._setBoneRotation(bones[i], currentPos, nextPos);
        currentPos = nextPos;
      }
      return true;
    }

    // FABRIK iterations
    for (let iter = 0; iter < iterations; iter++) {
      // Forward reaching
      positions[positions.length - 1].copy(worldTarget);
      
      for (let i = positions.length - 2; i >= 0; i--) {
        const direction = new THREE.Vector3()
          .subVectors(positions[i], positions[i + 1])
          .normalize();
        positions[i].copy(positions[i + 1]).add(direction.multiplyScalar(lengths[i]));
      }

      // Backward reaching
      positions[0].copy(rootPos);
      
      for (let i = 0; i < positions.length - 1; i++) {
        const direction = new THREE.Vector3()
          .subVectors(positions[i + 1], positions[i])
          .normalize();
        positions[i + 1].copy(positions[i]).add(direction.multiplyScalar(lengths[i]));
      }

      // --- POLE CONSTRAINT (Articulations) ---
      if (positions.length >= 3) {
        const root = positions[0];
        const end = positions[positions.length - 1];
        const mid = positions[1];

        const rootToEnd = new THREE.Vector3().subVectors(end, root);
        if (rootToEnd.lengthSq() > 0.001) {
          const rootToEndDir = rootToEnd.clone().normalize();
          
          let poleDir = new THREE.Vector3();
          const modelForward = new THREE.Vector3(0, 0, 1).transformDirection(this.model.matrixWorld);
          const modelRight = new THREE.Vector3(1, 0, 0).transformDirection(this.model.matrixWorld);
          const modelUp = new THREE.Vector3(0, 1, 0).transformDirection(this.model.matrixWorld);

          if (chainName.toLowerCase().includes('leg')) {
            // Knees point forward
            poleDir.copy(modelForward);
          } else if (chainName.toLowerCase().includes('leftarm')) {
            // Left elbow points down and left
            poleDir.copy(modelRight).multiplyScalar(-1).add(modelUp.clone().multiplyScalar(-0.5));
          } else if (chainName.toLowerCase().includes('rightarm')) {
            // Right elbow points down and right
            poleDir.copy(modelRight).add(modelUp.clone().multiplyScalar(-0.5));
          }

          poleDir.normalize();

          // Project mid onto the axis
          const rootToMid = new THREE.Vector3().subVectors(mid, root);
          const dot = rootToMid.dot(rootToEndDir);
          const projMid = root.clone().add(rootToEndDir.clone().multiplyScalar(dot));
          
          const midRadius = mid.distanceTo(projMid);
          
          if (midRadius > 0.01) {
            // Project pole onto the plane normal to rootToEndDir
            const poleDot = poleDir.dot(rootToEndDir);
            const projPole = poleDir.clone().sub(rootToEndDir.clone().multiplyScalar(poleDot)).normalize();
            
            // Adjust mid position towards the pole plane
            const targetMid = projMid.clone().add(projPole.multiplyScalar(midRadius));
            mid.lerp(targetMid, 0.8); // 0.8 pull per iteration
          }
        }
      }
      // ---------------------------------------

      // Check convergence
      if (positions[positions.length - 1].distanceTo(worldTarget) < 0.01) {
        break;
      }
    }

    // Apply rotations to bones
    for (let i = 0; i < bones.length - 1; i++) {
      this._setBoneRotation(bones[i], positions[i], positions[i + 1]);
    }

    return true;
  }

  _setBoneRotation(bone, startPos, endPos) {
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    
    // Get bone's initial direction in world space
    bone.updateMatrixWorld(true);
    const boneWorldPos = new THREE.Vector3();
    bone.getWorldPosition(boneWorldPos);
    
    // Get bone's parent world matrix
    const parentMatrix = new THREE.Matrix4();
    if (bone.parent) {
      bone.parent.updateMatrixWorld(true);
      parentMatrix.copy(bone.parent.matrixWorld).invert();
    }
    
    // Transform direction to local space
    const localDir = direction.clone().transformDirection(parentMatrix);
    
    // Calculate rotation to align bone with direction
    // Mixamo bones typically point down Y axis in local space
    const boneDir = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(boneDir, localDir);
    
    // Apply rotation snappy
    bone.quaternion.slerp(quaternion, 0.9); // High responsiveness
  }

  // Auto-detect and create common limb chains
  autoDetectChains() {
    // Try to find arm chains
    this.createChain('leftArm', ['leftshoulder', 'l_shoulder', 'shoulder_l', 'leftarm', 'l_arm', 'leftforearm', 'l_forearm', 'forearm_l', 'lefthand', 'l_hand', 'hand_l']);
    this.createChain('rightArm', ['rightshoulder', 'r_shoulder', 'shoulder_r', 'rightarm', 'r_arm', 'rightforearm', 'r_forearm', 'forearm_r', 'righthand', 'r_hand', 'hand_r']);
    
    // Try to find leg chains
    this.createChain('leftLeg', ['leftupleg', 'l_upleg', 'upleg_l', 'leftleg', 'l_leg', 'leg_l', 'leftfoot', 'l_foot', 'foot_l']);
    this.createChain('rightLeg', ['rightupleg', 'r_upleg', 'upleg_r', 'rightleg', 'r_leg', 'leg_r', 'rightfoot', 'r_foot', 'foot_r']);
    
    console.log('✅ Auto-detected IK chains:', Object.keys(this.chains));
  }
}
