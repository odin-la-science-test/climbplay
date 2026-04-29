// THREE fourni par le CDN
const THREE = window.THREE;

// ============================================================
// ANIMATION TESTER — Simple animation controls for skeleton
// ============================================================

export class AnimationTester {
  constructor(skeleton) {
    if (!skeleton || !skeleton.group) {
      throw new Error('Invalid skeleton provided');
    }

    this.skeleton = skeleton;
    this.bones = skeleton.boneMap;
    this.animations = {};
    this.currentAnimation = null;
    this.isPlaying = false;
    this.speed = 1.0;
    this.startTime = 0;
  }

  /**
   * Create a simple keyframe animation
   */
  createAnimation(name, keyframes) {
    this.animations[name] = {
      name,
      keyframes,
      duration: keyframes[keyframes.length - 1].time,
      tracks: [],
    };
    console.log(`✅ Animation created: "${name}" (${this.animations[name].duration}s)`);
    return this.animations[name];
  }

  /**
   * Play an animation
   */
  play(name) {
    if (!this.animations[name]) {
      console.error(`Animation not found: ${name}`);
      return false;
    }

    this.currentAnimation = this.animations[name];
    this.isPlaying = true;
    this.startTime = Date.now() * 0.001;

    console.log(`▶️  Playing: "${name}"`);
    return true;
  }

  /**
   * Pause current animation
   */
  pause() {
    this.isPlaying = false;
    console.log('⏸️  Paused');
  }

  /**
   * Stop and reset
   */
  stop() {
    this.isPlaying = false;
    this.currentAnimation = null;
    this.resetPose();
    console.log('⏹️  Stopped');
  }

  /**
   * Reset to default pose
   */
  resetPose() {
    Object.values(this.bones).forEach(bone => {
      if (bone instanceof THREE.Bone) {
        bone.rotation.set(0, 0, 0);
        bone.position.copy(bone.userData.defaultPosition || new THREE.Vector3());
      }
    });
  }

  /**
   * Update animation frame
   * Call this in your animation loop
   */
  update() {
    if (!this.isPlaying || !this.currentAnimation) return;

    const elapsed = (Date.now() * 0.001 - this.startTime) * this.speed;
    const duration = this.currentAnimation.duration;

    if (elapsed > duration) {
      this.stop();
      return;
    }

    // Apply keyframes
    const keyframes = this.currentAnimation.keyframes;
    for (const kf of keyframes) {
      if (!kf.boneName || !this.bones[kf.boneName]) continue;

      const bone = this.bones[kf.boneName];
      const nextKf = keyframes.find(k => k.time > kf.time && k.boneName === kf.boneName);

      if (!nextKf) {
        // Last keyframe - apply as is
        if (kf.rotation) bone.rotation.copy(kf.rotation);
        if (kf.position) bone.position.copy(kf.position);
      } else if (elapsed >= kf.time && elapsed < nextKf.time) {
        // Interpolate between keyframes
        const progress = (elapsed - kf.time) / (nextKf.time - kf.time);

        if (kf.rotation && nextKf.rotation) {
          const q1 = new THREE.Quaternion().setFromEuler(kf.rotation);
          const q2 = new THREE.Quaternion().setFromEuler(nextKf.rotation);
          q1.slerp(q2, progress);
          bone.quaternion.copy(q1);
        }

        if (kf.position && nextKf.position) {
          bone.position.lerpVectors(kf.position, nextKf.position, progress);
        }
      }
    }
  }

  /**
   * Create pre-built animations
   */
  static createPresets(skeleton) {
    const tester = new AnimationTester(skeleton);

    // Wave animation
    tester.createAnimation('wave', [
      {
        time: 0,
        boneName: 'Arm.R',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 0.5,
        boneName: 'Arm.R',
        rotation: new THREE.Euler(Math.PI / 2, 0, 0),
      },
      {
        time: 1,
        boneName: 'Arm.R',
        rotation: new THREE.Euler(0, 0, 0),
      },
    ]);

    // Walking animation
    tester.createAnimation('walk', [
      // Frame 0 - Neutral
      {
        time: 0,
        boneName: 'Arm.L',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 0,
        boneName: 'Arm.R',
        rotation: new THREE.Euler(0, 0, 0),
      },
      // Frame 0.5 - Mid stride
      {
        time: 0.5,
        boneName: 'Arm.L',
        rotation: new THREE.Euler(-Math.PI / 3, 0, 0),
      },
      {
        time: 0.5,
        boneName: 'Arm.R',
        rotation: new THREE.Euler(Math.PI / 3, 0, 0),
      },
      // Frame 1 - Back to neutral
      {
        time: 1,
        boneName: 'Arm.L',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 1,
        boneName: 'Arm.R',
        rotation: new THREE.Euler(0, 0, 0),
      },
    ]);

    // Stretch animation
    tester.createAnimation('stretch', [
      {
        time: 0,
        boneName: 'Spine',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 0.5,
        boneName: 'Spine',
        rotation: new THREE.Euler(-0.3, 0, 0),
      },
      {
        time: 1,
        boneName: 'Spine',
        rotation: new THREE.Euler(0, 0, 0),
      },
    ]);

    // Idle look around
    tester.createAnimation('look-around', [
      {
        time: 0,
        boneName: 'Head',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 0.5,
        boneName: 'Head',
        rotation: new THREE.Euler(0, Math.PI / 6, 0),
      },
      {
        time: 1,
        boneName: 'Head',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 1.5,
        boneName: 'Head',
        rotation: new THREE.Euler(0, -Math.PI / 6, 0),
      },
      {
        time: 2,
        boneName: 'Head',
        rotation: new THREE.Euler(0, 0, 0),
      },
    ]);

    // Climb reaching animation
    tester.createAnimation('climb-reach', [
      {
        time: 0,
        boneName: 'Arm.L',
        rotation: new THREE.Euler(0, 0, 0),
      },
      {
        time: 0.5,
        boneName: 'Arm.L',
        rotation: new THREE.Euler(Math.PI / 2.5, 0, 0),
      },
      {
        time: 1,
        boneName: 'Arm.L',
        rotation: new THREE.Euler(Math.PI / 3, 0, 0),
      },
    ]);

    return tester;
  }

  /**
   * Get list of available animations
   */
  listAnimations() {
    return Object.keys(this.animations);
  }

  /**
   * Export animation to JSON
   */
  exportAnimation(name) {
    const anim = this.animations[name];
    if (!anim) return null;

    return {
      name: anim.name,
      duration: anim.duration,
      keyframes: anim.keyframes.map(kf => ({
        time: kf.time,
        boneName: kf.boneName,
        rotation: kf.rotation ? [kf.rotation.x, kf.rotation.y, kf.rotation.z] : null,
        position: kf.position ? [kf.position.x, kf.position.y, kf.position.z] : null,
      })),
    };
  }

  /**
   * Import animation from JSON
   */
  importAnimation(data) {
    const keyframes = data.keyframes.map(kf => ({
      time: kf.time,
      boneName: kf.boneName,
      rotation: kf.rotation ? new THREE.Euler(...kf.rotation) : null,
      position: kf.position ? new THREE.Vector3(...kf.position) : null,
    }));

    return this.createAnimation(data.name, keyframes);
  }

  /**
   * Get animation statistics
   */
  getStats() {
    const animNames = Object.keys(this.animations);
    const stats = {
      totalAnimations: animNames.length,
      animations: {},
    };

    animNames.forEach(name => {
      const anim = this.animations[name];
      stats.animations[name] = {
        duration: anim.duration,
        keyframeCount: anim.keyframes.length,
        bones: [...new Set(anim.keyframes.map(kf => kf.boneName))],
      };
    });

    return stats;
  }
}

// Example usage in your code
export function setupAnimationTester(skeleton) {
  const tester = AnimationTester.createPresets(skeleton);
  
  console.log('🎬 Animation Tester initialized');
  console.log('📋 Available animations:', tester.listAnimations());
  
  // Store in global scope for console access
  window.animationTester = tester;
  
  return tester;
}

// Usage example:
// const tester = setupAnimationTester(window.skeletonTester.testSkeleton);
// tester.play('wave');
// In your animation loop: tester.update();
