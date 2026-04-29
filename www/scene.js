import * as THREE from 'three';
import { HOLD_TYPES } from './data.js';

// ============================================================
// SCENE.JS — Three.js renderer, lighting, wall, hold meshes
// ============================================================

function makeLimestoneTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b5a493';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 7000; i++) {
    const s = 150 + Math.random() * 60;
    ctx.fillStyle = `rgba(${s},${s - 10},${s - 22},0.5)`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512,
                 Math.random() * 4 + 1, Math.random() * 3 + 1);
  }
  ctx.strokeStyle = 'rgba(80,65,55,0.18)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    let x = Math.random() * 512, y = Math.random() * 512;
    ctx.moveTo(x, y);
    for (let j = 0; j < 7; j++) {
      x += (Math.random() - 0.5) * 70;
      y += Math.random() * 55;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 400);
  return t;
}

// ── Hold mesh factory ─────────────────────────────────────────
export function createHoldMesh(hold) {
  const ht  = HOLD_TYPES[hold.type];
  let geo, mat, mesh;

  switch (hold.type) {
    case 'VOLUME': {
      // Large architectural polyhedron flush with the wall
      const size = 0.18 + Math.random() * 0.14;
      const shapes = [
        new THREE.TetrahedronGeometry(size, 0),
        new THREE.OctahedronGeometry(size * 0.8, 0),
        new THREE.BoxGeometry(size * 1.4, size, size * 0.5),
      ];
      geo = shapes[Math.floor(Math.random() * shapes.length)];
      mat = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        roughness: 0.92,
        metalness: 0.02,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.z = (Math.random() - 0.5) * 0.6;
      mesh.rotation.y = (Math.random() - 0.5) * 0.4;
      mesh.position.set(hold.x, hold.y, 0.05);
      mesh.castShadow = true;
      mesh.userData = { holdId: hold.id, holdType: hold.type };
      return mesh;
    }

    case 'TROU': {
      // Torus = mono-doigt / prise trou
      geo = new THREE.TorusGeometry(0.022, 0.009, 10, 20);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.55, metalness: 0.15 });
      break;
    }

    case 'RELAIS': {
      // Glowing star-like checkpoint
      geo = new THREE.OctahedronGeometry(0.045, 0);
      mat = new THREE.MeshStandardMaterial({
        color: 0xfcd34d,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.6,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 4;
      mesh.position.set(hold.x, hold.y, hold.z + 0.04);
      mesh.castShadow = true;
      mesh.userData = { holdId: hold.id, holdType: hold.type };
      // Halo ring
      const haloGeo = new THREE.TorusGeometry(0.10, 0.005, 6, 30);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.5 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      mesh.add(halo);
      return mesh;
    }

    case 'BAC': {
      geo = new THREE.BoxGeometry(0.13, 0.06, 0.075);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.55, metalness: 0.05 });
      break;
    }
    case 'REGLETTE': {
      // Flat slab with slight rounded feel
      geo = new THREE.BoxGeometry(0.10, 0.014, 0.028);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.65, metalness: 0.08 });
      break;
    }
    case 'PINCETTE': {
      // Two-fingered pinch shape: use CylinderGeometry tapering
      geo = new THREE.CylinderGeometry(0.008, 0.015, 0.080, 8);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.5, metalness: 0.1 });
      break;
    }
    case 'PLAT': {
      // Shallow hemisphere (sloper)
      geo = new THREE.SphereGeometry(0.058, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.80, metalness: 0.0 });
      break;
    }
    case 'PETITE': {
      geo = new THREE.SphereGeometry(0.014, 8, 6);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.45, metalness: 0.2 });
      break;
    }
    default: {
      geo = new THREE.SphereGeometry(0.018, 8, 6);
      mat = new THREE.MeshStandardMaterial({ color: ht.color, roughness: 0.60, metalness: 0.05 });
    }
  }

  mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(hold.x, hold.y, hold.z + 0.01);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  mesh.userData = { holdId: hold.id, holdType: hold.type };

  // Tape markers: green for start, double red for top, yellow band for checkpoint
  if (hold.isStart || hold.isTop || hold.isCheckpoint) {
    const tapeColor = hold.isTop ? 0xff2222 : hold.isCheckpoint ? 0xfbbf24 : 0x22ff44;
    const tapeGeo   = new THREE.PlaneGeometry(0.12, 0.018);
    const tapeMat   = new THREE.MeshBasicMaterial({ color: tapeColor, transparent: true, opacity: 0.9 });
    const count = hold.isTop ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      tape.position.set(0, hold.isTop ? 0.09 + i * 0.025 : -0.085, -0.008);
      mesh.add(tape);
    }
  }

  return mesh;
}


// ── Build scene ───────────────────────────────────────────────
export function buildScene(container) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Sky gradient background
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2; skyCanvas.height = 256;
  const sCtx = skyCanvas.getContext('2d');
  const grad  = sCtx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0,   '#05070a');
  grad.addColorStop(0.5, '#0a0f1d');
  grad.addColorStop(1,   '#1e1b4b');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 2, 256);
  scene.background = new THREE.CanvasTexture(skyCanvas);

  // Camera — FOV 52, positioned 2.8 m in front of wall
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.05, 200);
  camera.position.set(0, 1.5, 2.8);
  camera.lookAt(0, 1.5, 0);

  // Ambient & Environment
  scene.add(new THREE.AmbientLight(0x445577, 0.2));
  const hemi = new THREE.HemisphereLight(0x00f2ff, 0x7000ff, 0.4);
  scene.add(hemi);

  // Sun (directional with high-quality shadow)
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 15, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.left   = -5;
  sun.shadow.camera.right  =  5;
  sun.shadow.camera.top    =  30;
  sun.shadow.camera.bottom = -5;
  sun.shadow.camera.near   =  0.5;
  sun.shadow.camera.far    =  60;
  sun.shadow.bias = -0.0005; // Reduce shadow acne
  scene.add(sun);
  scene.add(sun.target);

  // Fill light for character volume
  const fill = new THREE.PointLight(0x7000ff, 1.2, 10);
  fill.position.set(-3, 2, 4);
  scene.add(fill);

  // Wall (faces +Z)
  const wallTex = makeLimestoneTexture();
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2000),
    new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.93, metalness: 0.01 })
  );
  wall.position.set(0, 990, 0); // covers y 0..2000
  wall.receiveShadow = true;
  scene.add(wall);

  // Side rock borders
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.96 });
  [-1, 1].forEach(s => {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2000, 0.9), edgeMat);
    edge.position.set(s * 4.3, 990, -0.15);
    edge.receiveShadow = true;
    scene.add(edge);
  });

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a6b5a, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 1.5);
  ground.receiveShadow = true;
  scene.add(ground);

  // Hold group (separate for easy raycasting)
  const holdGroup = new THREE.Group();
  scene.add(holdGroup);

  // Resize handler
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { renderer, scene, camera, holdGroup, sun };
}
