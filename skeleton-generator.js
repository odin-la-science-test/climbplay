// THREE fourni par le CDN
const THREE = window.THREE;

// ============================================================
// SKELETON GENERATOR — Create procedural skeleton with N bones
// ============================================================

export class SkeletonGenerator {
  constructor(boneCount = 50) {
    this.boneCount = boneCount;
    this.group = new THREE.Group();
    this.bones = [];
    this.boneMap = {};
    this.lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 2 
    });
  }

  /**
   * Generate a humanoid skeleton with N bones
   * Bones are distributed across body structure:
   * - Root (1)
   * - Spine (4)
   * - Head (3)
   * - Left Arm (5)
   * - Right Arm (5)
   * - Left Leg (5)
   * - Right Leg (5)
   * - Fingers/Toes (remainder)
   */
  generateHumanoid() {
    console.log(`🦴 Generating humanoid skeleton with ${this.boneCount} bones...`);

    // Define bone structure
    const structure = this._createBoneStructure();
    
    // Create root bone
    const root = this._createBone('Armature', null, { x: 0, y: 0, z: 0 });
    this.group.add(root);

    // Build hierarchy recursively
    this._buildBones(structure, root, 'Armature');

    // Draw skeleton lines for visualization
    this._drawSkeleton();

    console.log(`✅ Skeleton created: ${this.bones.length} bones`);
    console.log('📋 Bone names:', this.bones.map(b => b.name).join(', '));

    return {
      group: this.group,
      bones: this.bones,
      boneMap: this.boneMap,
      structure: structure,
    };
  }

  /**
   * Create a procedural bone structure matching humanoid anatomy
   */
  _createBoneStructure() {
    const totalBones = this.boneCount;
    const mainBones = 28; // Core body structure
    const extraFingers = Math.max(0, totalBones - mainBones);

    return {
      'Armature': {
        position: { x: 0, y: 0, z: 0 },
        children: {
          'Hips': {
            position: { x: 0, y: 0, z: 0 },
            children: {
              'Spine': {
                position: { x: 0, y: 0.1, z: 0 },
                children: {
                  'Spine.001': {
                    position: { x: 0, y: 0.1, z: 0 },
                    children: {
                      'Spine.002': {
                        position: { x: 0, y: 0.1, z: 0 },
                        children: {
                          'Chest': {
                            position: { x: 0, y: 0.08, z: 0 },
                            children: {
                              'Neck': {
                                position: { x: 0, y: 0.12, z: 0 },
                                children: {
                                  'Head': {
                                    position: { x: 0, y: 0.09, z: 0 },
                                    children: {
                                      'Head.001': {
                                        position: { x: 0, y: 0.08, z: 0 },
                                        children: {}
                                      }
                                    }
                                  }
                                }
                              },
                              'Shoulder.L': {
                                position: { x: 0.12, y: 0.05, z: 0 },
                                children: {
                                  'Arm.L': {
                                    position: { x: 0.18, y: 0, z: 0 },
                                    children: {
                                      'Forearm.L': {
                                        position: { x: 0.16, y: 0, z: 0 },
                                        children: {
                                          'Hand.L': {
                                            position: { x: 0.15, y: 0, z: 0 },
                                            children: this._generateFingers('L', Math.min(5, extraFingers / 2))
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              'Shoulder.R': {
                                position: { x: -0.12, y: 0.05, z: 0 },
                                children: {
                                  'Arm.R': {
                                    position: { x: -0.18, y: 0, z: 0 },
                                    children: {
                                      'Forearm.R': {
                                        position: { x: -0.16, y: 0, z: 0 },
                                        children: {
                                          'Hand.R': {
                                            position: { x: -0.15, y: 0, z: 0 },
                                            children: this._generateFingers('R', Math.min(5, extraFingers / 2))
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              'UpLeg.L': {
                position: { x: 0.08, y: -0.08, z: 0 },
                children: {
                  'Leg.L': {
                    position: { x: 0, y: -0.35, z: 0 },
                    children: {
                      'Foot.L': {
                        position: { x: 0, y: -0.35, z: 0 },
                        children: {
                          'Toe.L': {
                            position: { x: 0, y: -0.1, z: 0.08 },
                            children: {}
                          }
                        }
                      }
                    }
                  }
                }
              },
              'UpLeg.R': {
                position: { x: -0.08, y: -0.08, z: 0 },
                children: {
                  'Leg.R': {
                    position: { x: 0, y: -0.35, z: 0 },
                    children: {
                      'Foot.R': {
                        position: { x: 0, y: -0.35, z: 0 },
                        children: {
                          'Toe.R': {
                            position: { x: 0, y: -0.1, z: 0.08 },
                            children: {}
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate finger/toe bones
   */
  _generateFingers(side, count) {
    const fingers = {};
    for (let i = 0; i < Math.min(count, 5); i++) {
      const fingerName = `Finger_${i}.${side}`;
      fingers[fingerName] = {
        position: { 
          x: (i - 2) * 0.03, 
          y: -0.02, 
          z: (Math.random() - 0.5) * 0.02 
        },
        children: {}
      };
    }
    return fingers;
  }

  /**
   * Recursively build bones from structure
   */
  _buildBones(structure, parent, parentName) {
    if (!structure || !structure.children) return;

    Object.entries(structure.children).forEach(([boneName, boneData]) => {
      const bone = this._createBone(boneName, parent, boneData.position);
      this._buildBones(boneData, bone, boneName);
    });
  }

  /**
   * Create a single bone (THREE.Bone)
   */
  _createBone(name, parent, position) {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(position.x || 0, position.y || 0, position.z || 0);

    // Helper geometry for visualization
    const sphereGeo = new THREE.SphereGeometry(0.01, 4, 4);
    const boneMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const boneMesh = new THREE.Mesh(sphereGeo, boneMat);
    boneMesh.position.copy(bone.position);
    bone.userData.visualMesh = boneMesh;

    if (parent) {
      parent.add(bone);
    }

    this.bones.push(bone);
    this.boneMap[name] = bone;

    return bone;
  }

  /**
   * Draw lines between connected bones for visualization
   */
  _drawSkeleton() {
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00,
      linewidth: 2,
      fog: false
    });

    const visualGroup = new THREE.Group();

    const drawLines = (bone) => {
      if (!bone.children) return;

      bone.children.forEach((child) => {
        if (child instanceof THREE.Bone) {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array([
            bone.position.x, bone.position.y, bone.position.z,
            bone.position.x + child.position.x, 
            bone.position.y + child.position.y, 
            bone.position.z + child.position.z
          ]);
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

          const line = new THREE.Line(geometry, material);
          visualGroup.add(line);

          drawLines(child);
        }
      });
    };

    drawLines(this.group.children[0]);
    this.group.add(visualGroup);
  }

  /**
   * Export skeleton for animation
   */
  exportForAnimation() {
    return {
      format: 'THREE.js Bones',
      totalBones: this.bones.length,
      bones: this.bones.map(bone => ({
        name: bone.name,
        type: 'Bone',
        position: bone.position.toArray(),
        rotation: bone.quaternion.toArray(),
        scale: bone.scale.toArray(),
        uuid: bone.uuid,
      })),
      boneNames: this.bones.map(b => b.name),
    };
  }

  /**
   * Get bone by name
   */
  getBone(name) {
    return this.boneMap[name];
  }

  /**
   * Get all bones in a limb (e.g., 'LeftArm', 'RightLeg')
   */
  getLimbBones(limbName) {
    return this.bones.filter(b => b.name.includes(limbName));
  }
}

// Example usage
export function createTestSkeleton() {
  const skeleton = new SkeletonGenerator(50);
  return skeleton.generateHumanoid();
}
