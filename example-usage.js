/**
 * EXAMPLE — Intégration complète du Skeleton Kit
 * 
 * Ce fichier montre comment utiliser les 5 modules ensemble
 * dans votre jeu.
 */

import * as THREE from 'three';
import { SkeletonGenerator } from './skeleton-generator.js';
import { AnimationTester } from './animation-tester.js';
import { BoneCounter } from './bone-counter.js';

// ============================================================
// INTÉGRATION DANS VOTRE GAME/CLIMBER
// ============================================================

// Exemple 1: Mode Développement - Utiliser le squelette test
// ============================================================

class GameWithTestSkeleton {
  constructor() {
    this.scene = null;
    this.testSkeleton = null;
    this.animationTester = null;
    this.DEBUG_MODE = true; // Activer pour développement
  }

  async init(scene) {
    this.scene = scene;

    if (this.DEBUG_MODE) {
      console.log('🦴 Debug Mode: Charger squelette test');
      
      // Compter os du modèle original
      const boneAnalysis = await BoneCounter.analyzeGLB('disagne-1-perso.glb');
      console.log(`Original bones: ${boneAnalysis.totalCount}`);
      
      // Créer squelette test avec le même nombre
      const generator = new SkeletonGenerator(boneAnalysis.totalCount);
      const skeleton = generator.generateHumanoid();
      
      this.testSkeleton = skeleton;
      this.scene.add(skeleton.group);
      
      // Initialiser contrôles d'animation
      this.animationTester = AnimationTester.createPresets(skeleton);
      
      console.log('✅ Test skeleton ready!');
    }
  }

  update() {
    // Mettre à jour animations
    if (this.animationTester && this.DEBUG_MODE) {
      this.animationTester.update();
    }
  }

  // Pour tester rapidement une animation
  testAnimation(name) {
    if (this.animationTester) {
      this.animationTester.play(name);
      console.log(`▶️  Testing: ${name}`);
    }
  }
}

// ============================================================
// Exemple 2: Animation réaliste - Créer une animation personnalisée
// ============================================================

function createClimbReachAnimation() {
  return [
    {
      time: 0,
      boneName: 'Arm.L',
      rotation: new THREE.Euler(0, 0, 0),
    },
    {
      time: 0.2,
      boneName: 'Arm.L',
      rotation: new THREE.Euler(Math.PI / 2.5, 0, 0),
    },
    {
      time: 0.5,
      boneName: 'Arm.L',
      rotation: new THREE.Euler(Math.PI / 1.8, 0.2, 0),
    },
    {
      time: 1,
      boneName: 'Arm.L',
      rotation: new THREE.Euler(Math.PI / 3, 0, 0),
    },
  ];
}

function createWalkAnimation() {
  const keyframes = [];
  const steps = 20;
  
  for (let i = 0; i <= steps; i++) {
    const time = i / steps;
    const angle = Math.sin(time * Math.PI * 2) * 0.4;
    
    keyframes.push({
      time,
      boneName: 'Arm.L',
      rotation: new THREE.Euler(angle, 0, 0),
    });
    
    keyframes.push({
      time,
      boneName: 'Arm.R',
      rotation: new THREE.Euler(-angle, 0, 0),
    });
  }
  
  return keyframes;
}

// ============================================================
// Exemple 3: Intégration dans votre Climber existant
// ============================================================

class ClimberWithAnimations {
  constructor(skinId = 0) {
    this.group = new THREE.Group();
    this.parts = {};
    this.skinData = {};
    this.testSkeleton = null;
    this.animationTester = null;
    
    this._buildProcedural();
    this._loadGLB();
  }

  _buildProcedural() {
    // Votre code existant pour construire le grimpeur
    console.log('Building procedural climber...');
  }

  async _loadGLB() {
    try {
      // Analyser os
      const boneAnalysis = await BoneCounter.analyzeGLB('disagne-1-perso.glb');
      
      // Créer test skeleton
      const generator = new SkeletonGenerator(boneAnalysis.totalCount);
      this.testSkeleton = generator.generateHumanoid();
      
      // Initialiser animations
      this.animationTester = AnimationTester.createPresets(this.testSkeleton);
      
      // Ajouter vos animations personnalisées
      this.animationTester.createAnimation(
        'climb-reach',
        createClimbReachAnimation()
      );
      
      this.animationTester.createAnimation(
        'walk',
        createWalkAnimation()
      );
      
      console.log('✅ Climber animations loaded!');
    } catch (error) {
      console.error('Error loading climber animations:', error);
    }
  }

  updatePose(limbPositions) {
    // Votre code existant pour mettre à jour la pose
    
    // Mettre à jour animations si en test mode
    if (this.animationTester) {
      this.animationTester.update();
    }
  }

  playAnimation(name) {
    if (this.animationTester) {
      this.animationTester.play(name);
    }
  }

  stopAnimation() {
    if (this.animationTester) {
      this.animationTester.stop();
    }
  }
}

// ============================================================
// Exemple 4: Utilisation dans le Game loop
// ============================================================

class GameLoop {
  constructor() {
    this.climber = new ClimberWithAnimations();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    
    this.scene.add(this.climber.group);
    if (this.climber.testSkeleton) {
      this.scene.add(this.climber.testSkeleton.group);
    }
  }

  start() {
    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    
    // Mettre à jour climber
    this.climber.updatePose({});
    
    // Render
    this.renderer.render(this.scene, this.camera);
  };

  // Pour tester une animation
  testWalk() {
    console.log('Testing walk animation...');
    this.climber.playAnimation('walk');
  }

  testClimbing() {
    console.log('Testing climbing animation...');
    this.climber.playAnimation('climb-reach');
  }
}

// ============================================================
// Exemple 5: Console interactif (Debug)
// ============================================================

/**
 * Activez ceci en développement pour tester dans la console:
 * 
 * window.game = new GameLoop();
 * window.game.testWalk();
 * window.game.testClimbing();
 * window.game.climber.animationTester.stop();
 * 
 * // Inspecter
 * console.log(window.game.climber.testSkeleton.bones);
 * window.game.climber.testSkeleton.bones.forEach(b => console.log(b.name));
 * 
 * // Créer animation custom
 * const anim = [...];
 * window.game.climber.animationTester.createAnimation('custom', anim);
 * window.game.climber.playAnimation('custom');
 */

// ============================================================
// Exemple 6: Export et sauvegarde
// ============================================================

function exportAllAnimations(animationTester, climberName = 'climber') {
  const allAnims = {};
  
  animationTester.listAnimations().forEach(name => {
    allAnims[name] = animationTester.exportAnimation(name);
  });
  
  const json = JSON.stringify(allAnims, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${climberName}-animations.json`;
  a.click();
  
  console.log('✅ Animations exported!');
}

// Utilisation:
// exportAllAnimations(window.game.climber.animationTester, 'mon-grimpeur');

// ============================================================
// Exemple 7: Tests unitaires
// ============================================================

async function runTests() {
  console.log('🧪 Running tests...');
  
  // Test 1: BoneCounter
  try {
    const analysis = await BoneCounter.analyzeGLB('disagne-1-perso.glb');
    console.assert(analysis.totalCount > 0, 'BoneCounter should find bones');
    console.log('✅ BoneCounter test passed');
  } catch (e) {
    console.error('❌ BoneCounter test failed:', e);
  }
  
  // Test 2: SkeletonGenerator
  try {
    const generator = new SkeletonGenerator(50);
    const skeleton = generator.generateHumanoid();
    console.assert(skeleton.bones.length === 50, 'Should have 50 bones');
    console.assert(skeleton.boneMap['Armature'], 'Should have Armature bone');
    console.log('✅ SkeletonGenerator test passed');
  } catch (e) {
    console.error('❌ SkeletonGenerator test failed:', e);
  }
  
  // Test 3: AnimationTester
  try {
    const generator = new SkeletonGenerator(50);
    const skeleton = generator.generateHumanoid();
    const tester = AnimationTester.createPresets(skeleton);
    
    console.assert(tester.listAnimations().length > 0, 'Should have animations');
    tester.play('wave');
    console.assert(tester.isPlaying, 'Should be playing');
    console.log('✅ AnimationTester test passed');
  } catch (e) {
    console.error('❌ AnimationTester test failed:', e);
  }
  
  console.log('🧪 All tests completed!');
}

// Utilisation:
// runTests();

// ============================================================
// Exports pour utilisation dans d'autres modules
// ============================================================

export {
  GameWithTestSkeleton,
  ClimberWithAnimations,
  GameLoop,
  createClimbReachAnimation,
  createWalkAnimation,
  exportAllAnimations,
  runTests,
};

// ============================================================
// INSTRUCTIONS D'UTILISATION
// ============================================================

/*

1. DANS VOTRE JUSTE AVANT DE LANCER:

  import { ClimberWithAnimations, GameLoop } from './example.js';
  
  const game = new GameLoop();
  game.start();

2. POUR TESTER UNE ANIMATION:

  game.testWalk();
  game.testClimbing();
  game.climber.stopAnimation();

3. POUR CRÉER UNE ANIMATION:

  const myAnim = [
    { time: 0, boneName: 'Head', rotation: new THREE.Euler(0,0,0) },
    { time: 1, boneName: 'Head', rotation: new THREE.Euler(0.5,0,0) },
  ];
  game.climber.animationTester.createAnimation('myAnim', myAnim);
  game.climber.playAnimation('myAnim');

4. POUR EXPORTER LES ANIMATIONS:

  importAllAnimations(game.climber.animationTester);

5. POUR DÉBOGUER:

  window.game = game;
  window.game.climber.testSkeleton.bones  // Tous les os
  window.game.climber.animationTester     // Testeur

*/
