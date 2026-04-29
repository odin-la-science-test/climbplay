// THREE et GLTFLoader fournis par le CDN
const THREE = window.THREE;
const GLTFLoader = window.GLTFLoader;
import { SkeletonGenerator } from './skeleton-generator.js';

// ============================================================
// SKELETON TESTER — Load disagne-1-perso, count bones,
// and create a test skeleton for animation development
// ============================================================

export class SkeletonTester {
  constructor(containerSelector = '#skeleton-test-container') {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'skeleton-test-container';
      document.body.appendChild(this.container);
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.originalModel = null;
    this.testSkeleton = null;
    this.boneCount = 0;
    this.controls = null;
  }

  /**
   * Initialize Three.js scene
   */
  initScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);
    this.scene.fog = new THREE.Fog(0x222222, 50, 100);

    // Camera
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.set(0, 1.0, 2.5);
    this.camera.lookAt(0, 1.0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.far = 20;
    this.scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    // Start animation loop
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Load disagne-1-perso.glb and count its bones
   */
  async loadOriginalModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        'disagne-1-perso.glb',
        (gltf) => {
          const model = gltf.scene;
          
          // Count bones
          let boneCount = 0;
          const boneNames = [];
          model.traverse((child) => {
            if (child.isBone) {
              boneCount++;
              boneNames.push(child.name);
            }
          });

          this.originalModel = model;
          this.boneCount = boneCount;

          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('✅ disagne-1-perso.glb loaded');
          console.log(`🦴 Bones found: ${boneCount}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Bone names:');
          boneNames.forEach((name, i) => {
            console.log(`  [${String(i + 1).padStart(3)}] ${name}`);
          });
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          resolve({
            model,
            boneCount,
            boneNames,
          });
        },
        undefined,
        (error) => {
          console.error('❌ Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Create a test skeleton matching the bone count
   */
  createTestSkeleton() {
    console.log(`Creating test skeleton with ${this.boneCount} bones...`);
    
    const generator = new SkeletonGenerator(this.boneCount);
    const result = generator.generateHumanoid();

    this.testSkeleton = result;

    // Position skeleton
    result.group.position.set(0.5, 0, 0);
    this.scene.add(result.group);

    console.log(`✅ Test skeleton created with ${result.bones.length} bones`);
    console.log('📋 Structure:', result.structure);

    return result;
  }

  /**
   * Display both models side by side
   */
  displayComparison() {
    if (this.originalModel) {
      // Scale and position original model
      const box = new THREE.Box3().setFromObject(this.originalModel);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scale = 1.0 / size.y;
      this.originalModel.scale.setScalar(scale);
      this.originalModel.position.set(-0.5, 0, 0);
      this.scene.add(this.originalModel);

      console.log('✅ Original model displayed (left)');
    }

    if (this.testSkeleton) {
      console.log('✅ Test skeleton displayed (right)');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Comparison: Original (left) vs Test Skeleton (right)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Create UI controls
   */
  createControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #0f0;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
      z-index: 1000;
    `;

    controlsDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">🦴 Skeleton Tester</h3>
      <div id="info" style="line-height: 1.6;">
        <p>Status: Loading...</p>
      </div>
      <button id="toggle-original" style="display: block; width: 100%; padding: 8px; margin: 5px 0; background: #0f0; color: #000; border: none; cursor: pointer; border-radius: 3px;">
        Toggle Original Model
      </button>
      <button id="toggle-skeleton" style="display: block; width: 100%; padding: 8px; margin: 5px 0; background: #0f0; color: #000; border: none; cursor: pointer; border-radius: 3px;">
        Toggle Test Skeleton
      </button>
      <button id="export-skeleton" style="display: block; width: 100%; padding: 8px; margin: 5px 0; background: #0f0; color: #000; border: none; cursor: pointer; border-radius: 3px;">
        Export Skeleton Data
      </button>
      <button id="show-controller" style="display: block; width: 100%; padding: 8px; margin: 5px 0; background: #ff0; color: #000; border: none; cursor: pointer; border-radius: 3px; font-weight: bold;">
        🎮 Skeleton Controller
      </button>
    `;

    this.container.appendChild(controlsDiv);
    this.controlsDiv = controlsDiv;

    // Event listeners
    document.getElementById('toggle-original').addEventListener('click', () => {
      if (this.originalModel) {
        this.originalModel.visible = !this.originalModel.visible;
      }
    });

    document.getElementById('toggle-skeleton').addEventListener('click', () => {
      if (this.testSkeleton) {
        this.testSkeleton.group.visible = !this.testSkeleton.group.visible;
      }
    });

    document.getElementById('export-skeleton').addEventListener('click', () => {
      this.exportSkeleton();
    });

    document.getElementById('show-controller').addEventListener('click', () => {
      this.showController();
    });

    this.updateInfo();
  }

  /**
   * Update info display
   */
  updateInfo() {
    const infoDiv = document.getElementById('info');
    if (infoDiv) {
      infoDiv.innerHTML = `
        <p><strong>Original Model:</strong> ${this.boneCount} bones</p>
        <p><strong>Test Skeleton:</strong> ${this.testSkeleton?.bones.length || 0} bones</p>
        <p><strong>Match:</strong> ${this.boneCount === this.testSkeleton?.bones.length ? '✅ YES' : '❌ NO'}</p>
      `;
    }
  }

  /**
   * Export skeleton to JSON
   */
  exportSkeleton() {
    if (!this.testSkeleton) {
      console.warn('No skeleton to export');
      return;
    }

    const data = this.testSkeleton;
    const json = JSON.stringify(data.structure, null, 2);
    
    // Download file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skeleton-${this.boneCount}-bones.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Skeleton exported as JSON');
  }

  /**
   * Show skeleton controller
   */
  async showController() {
    if (!this.testSkeleton) {
      alert('Test skeleton not loaded yet');
      return;
    }

    const { default: SkeletonController } = await import('./skeleton-controller.js');
    const controller = new SkeletonController(this.testSkeleton, this.container);
    console.log('✅ Skeleton Controller activated!');
    console.log('📋 Instructions:');
    console.log('  - Click bone buttons to select');
    console.log('  - Use sliders to rotate');
    console.log('  - Or use arrow keys: ↑↓← → + Q/E');
    console.log('  - R to reset pose');
    console.log('  - Export Pose to save');
  }

  /**
   * Animation loop
   */
  animate = () => {
    requestAnimationFrame(this.animate);

    // Rotate skeleton for inspection
    if (this.testSkeleton) {
      this.testSkeleton.group.rotation.y += 0.002;
    }
    if (this.originalModel && this.originalModel.visible) {
      this.originalModel.rotation.y += 0.002;
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Handle window resize
   */
  onWindowResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Main setup flow
   */
  async setup() {
    try {
      console.log('Starting Skeleton Tester setup...');
      
      // Initialize scene
      this.initScene();
      
      // Load original model
      const modelData = await this.loadOriginalModel();
      
      // Create test skeleton
      this.createTestSkeleton();
      
      // Display comparison
      this.displayComparison();
      
      // Create UI
      this.createControls();
      
      console.log('✅ Skeleton Tester ready!');
      console.log('Use the controls to toggle between original and test skeleton.');
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      if (this.controlsDiv) {
        this.controlsDiv.innerHTML += `<p style="color: #f00;">Error: ${error.message}</p>`;
      }
    }
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const tester = new SkeletonTester();
    tester.setup().catch(console.error);
    window.skeletonTester = tester;
  });
} else {
  const tester = new SkeletonTester();
  tester.setup().catch(console.error);
  window.skeletonTester = tester;
}

export default SkeletonTester;
