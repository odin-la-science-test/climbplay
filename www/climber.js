import * as THREE from 'three';
import { SKINS, ARM_UPPER, ARM_LOWER, LEG_UPPER, LEG_LOWER } from './data.js';

// ============================================================
// CLIMBER.JS — Compact Athlete Build
// ============================================================

export class Climber {
  constructor(skinId = 0) {
    this.group    = new THREE.Group();
    this.parts    = {};
    this.skinData = SKINS.find(s => s.id === skinId) || SKINS[0];
    this.isLoaded = false;
    
    // Proportions synced with data.js for perfect gameplay-visual match
    this.ARM1 = ARM_UPPER;
    this.ARM2 = ARM_LOWER;
    this.LEG1 = LEG_UPPER;
    this.LEG2 = LEG_LOWER;
    
    this._build();
    this._tagLimbs();
    this.isLoaded = true;
  }

  _mat(hex, rough = 0.5) {
    return new THREE.MeshStandardMaterial({ 
      color: hex, 
      roughness: rough, 
      metalness: 0.1,
      flatShading: false
    });
  }

  _build() {
    const S = this.skinData;
    const sk = this._mat(S.skin, 0.45);
    const to = this._mat(S.top, 0.6);
    const bt = this._mat(S.bottom, 0.6);
    const sh = this._mat(0x111111, 0.3);

    const cap = (r, h, mat) => {
      // Use h as the segment length. Total capsule height will be h + 2r.
      // This ensures the capsule ends overlap the joint spheres for a seamless look.
      const g = new THREE.CapsuleGeometry(r, h, 8, 16);
      const m = new THREE.Mesh(g, mat);
      m.castShadow = m.receiveShadow = true;
      return m;
    };

    /* TORSO — Slender Profile */
    this.parts.torso = new THREE.Group();
    this.group.add(this.parts.torso);

    const points = [];
    points.push(new THREE.Vector2(0.00,  0.00)); // Crotch
    points.push(new THREE.Vector2(0.08,  0.06)); // Hips
    points.push(new THREE.Vector2(0.06,  0.13)); // Waist
    points.push(new THREE.Vector2(0.08,  0.25)); // Lower Back
    points.push(new THREE.Vector2(0.11,  0.35)); // Shoulders (Narrower)
    points.push(new THREE.Vector2(0.09,  0.42)); // Traps
    points.push(new THREE.Vector2(0.04,  0.45)); // Neck

    const latheGeo = new THREE.LatheGeometry(points, 32);
    const torsoMesh = new THREE.Mesh(latheGeo, to);
    torsoMesh.scale.set(1.0, 1, 0.65); 
    this.parts.torso.add(torsoMesh);

    // Glutes (Smaller)
    [-1, 1].forEach(s => {
      const glute = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), bt);
      glute.scale.set(1, 1, 0.8);
      glute.position.set(s * 0.05, 0.04, -0.04);
      this.parts.torso.add(glute);
    });

    /* HEAD & NECK */
    this.parts.head = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20), sk);
    head.scale.set(1, 1.15, 1.0);
    this.parts.head.add(head);
    this.group.add(this.parts.head);

    /* LIMBS (Floating Minimalist Detail) */
    ['left', 'right'].forEach(side => {
      const s = side === 'left' ? -1 : 1;
      
      // Arms (Capsules only, no spheres)
      this.parts[side + 'UpperArm'] = cap(0.035, this.ARM1, sk);
      this.parts[side + 'Forearm']  = cap(0.028, this.ARM2, sk);
      this.parts[side + 'Hand']     = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.015), sk);
      
      this.group.add(this.parts[side + 'UpperArm'], this.parts[side + 'Forearm'], this.parts[side + 'Hand']);

      // Legs (Capsules only, no spheres)
      this.parts[side + 'Thigh']  = cap(0.05, this.LEG1, bt);
      
      const calfG = new THREE.Group();
      const calfMain = cap(0.04, this.LEG2, sk);
      calfG.add(calfMain);
      const muscle = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), sk);
      muscle.scale.set(0.8, 1.2, 0.6);
      muscle.position.y = 0.06;
      calfMain.add(muscle);
      this.parts[side + 'Calf'] = calfG;

      this.parts[side + 'Foot']   = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.12), sh);
      // Compatibility alias for game.js handle synchronization
      this.parts[side + 'Ankle']  = this.parts[side + 'Foot'];
      
      this.group.add(this.parts[side + 'Thigh'], this.parts[side + 'Calf'], this.parts[side + 'Foot']);
    });
  }

  _seg(mesh, p1, p2) {
    mesh.position.copy(p1).lerp(p2, 0.5);
    mesh.lookAt(p2);
    mesh.rotateX(Math.PI/2);
  }

  _solveIK(start, end, l1, l2, pole) {
    // Remove clamping to allow dislocation when distance exceeds reach
    const d = start.distanceTo(end);
    const a = (l1*l1 - l2*l2 + d*d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1*l1 - a*a));
    const axis = new THREE.Vector3().subVectors(end, start).normalize();
    const side = new THREE.Vector3().crossVectors(axis, pole).normalize();
    const bend = new THREE.Vector3().crossVectors(side, axis).normalize();
    return start.clone().add(axis.multiplyScalar(a)).add(bend.multiplyScalar(h));
  }

  updatePose(lhPos, rhPos, lfPos, rfPos, bodyOffset = new THREE.Vector3(0,0,0)) {
    const mfX = (lhPos.x + rhPos.x + lfPos.x + rfPos.x) / 4;
    const mfY = (lhPos.y + rhPos.y + lfPos.y + rfPos.y) / 4;
    
    // 1. Position and Rotate Torso (with offset for swinging/jumping)
    const hipC = new THREE.Vector3(mfX + bodyOffset.x, mfY + 0.10 + bodyOffset.y, 0.20 + bodyOffset.z);
    const shC  = new THREE.Vector3(mfX + bodyOffset.x, mfY + 0.45 + bodyOffset.y, 0.28 + bodyOffset.z);

    this.parts.torso.position.copy(hipC);
    const td = new THREE.Vector3().subVectors(shC, hipC).normalize();
    this.parts.torso.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), td);

    // 2. Calculate Shoulder/Hip joints based on Torso Orientation
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.parts.torso.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.parts.torso.quaternion);
    
    const lSh = hipC.clone().add(up.clone().multiplyScalar(0.35)).add(right.clone().multiplyScalar(-0.11));
    const rSh = hipC.clone().add(up.clone().multiplyScalar(0.35)).add(right.clone().multiplyScalar(0.11));
    const lHp = hipC.clone().add(up.clone().multiplyScalar(0.06)).add(right.clone().multiplyScalar(-0.08));
    const rHp = hipC.clone().add(up.clone().multiplyScalar(0.06)).add(right.clone().multiplyScalar(0.08));

    // 3. Head Position (Synchronized with Neck)
    const headPos = hipC.clone().add(up.clone().multiplyScalar(0.48));
    this.parts.head.position.copy(headPos);
    this.parts.head.lookAt(lhPos.x, lhPos.y, -1);

    // 4. Update Arms
    [['left', lSh, lhPos, -1], ['right', rSh, rhPos, 1]].forEach(([side, sh, hand, sx]) => {
      const elbow = this._solveIK(sh, hand, this.ARM1, this.ARM2, new THREE.Vector3(sx, -0.2, 0.5));
      this._seg(this.parts[side + 'UpperArm'], sh, elbow);
      this._seg(this.parts[side + 'Forearm'], elbow, hand);
      this.parts[side + 'Hand'].position.copy(hand);
      this.parts[side + 'Hand'].lookAt(hand.x, hand.y, -1);
    });

    // 5. Update Legs
    [['left', lHp, lfPos, -1], ['right', rHp, rfPos, 1]].forEach(([side, hp, foot, sx]) => {
      const knee = this._solveIK(hp, foot, this.LEG1, this.LEG2, new THREE.Vector3(sx, 0.4, 0.2));
      this._seg(this.parts[side + 'Thigh'], hp, knee);
      this._seg(this.parts[side + 'Calf'], knee, foot);
      this.parts[side + 'Foot'].position.copy(foot);
      this.parts[side + 'Foot'].lookAt(foot.x, foot.y, -1);
    });
  }

  _tagLimbs() {
    ['leftHand', 'rightHand', 'leftFoot', 'rightFoot'].forEach(limb => {
      const name = limb.includes('Hand') ? limb : limb.replace('Foot', 'Ankle');
      const p = this.parts[name] || this.parts[limb];
      if (p) p.userData.limb = limb;
    });
  }
}
