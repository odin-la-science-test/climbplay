// THREE et GLTFLoader fournis par le CDN
const THREE = window.THREE;
const GLTFLoader = window.GLTFLoader;

// ============================================================
// BONE COUNTER — Analyze disagne-1-perso.glb skeleton
// ============================================================

export class BoneCounter {
  static async analyzeGLB(filePath) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        filePath,
        (gltf) => {
          const bones = [];
          const boneMap = {};
          
          gltf.scene.traverse((child) => {
            if (child.isBone) {
              bones.push({
                name: child.name,
                index: bones.length,
                parent: child.parent?.name || null,
                position: child.position.clone(),
                rotation: child.quaternion.clone(),
                scale: child.scale.clone(),
              });
              boneMap[child.name] = child;
            }
          });
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🦴 BONE ANALYSIS: disagne-1-perso.glb');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`Total bones: ${bones.length}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          bones.forEach((bone, i) => {
            console.log(`[${String(i).padStart(3)}] ${bone.name}`);
          });
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`Export: ${bones.length} bones total`);
          
          resolve({
            bones,
            boneMap,
            totalCount: bones.length,
            hierarchy: BoneCounter._buildHierarchy(bones, boneMap),
          });
        },
        undefined,
        (error) => {
          console.error('Error loading GLB:', error);
          reject(error);
        }
      );
    });
  }

  static _buildHierarchy(bones, boneMap) {
    const hierarchy = {};
    bones.forEach(bone => {
      const parentName = bone.parent;
      if (!hierarchy[parentName]) {
        hierarchy[parentName] = [];
      }
      hierarchy[parentName].push(bone.name);
    });
    return hierarchy;
  }

  // Create a debug skeleton visualization
  static createDebugSkeleton(bones, boneMap) {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Draw connections between parent and child bones
    const positions = [];
    boneMap.forEach((bone) => {
      if (bone.parent && boneMap[bone.parent.name]) {
        const parentPos = new THREE.Vector3();
        const childPos = new THREE.Vector3();
        
        bone.parent.getWorldPosition(parentPos);
        bone.getWorldPosition(childPos);
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(
          new Float32Array([
            parentPos.x, parentPos.y, parentPos.z,
            childPos.x, childPos.y, childPos.z
          ]), 3
        ));
        
        const line = new THREE.Line(geometry, material);
        group.add(line);
      }
    });

    return group;
  }
}

// Auto-run analysis
console.log('Starting bone analysis...');
BoneCounter.analyzeGLB('disagne-1-perso.glb')
  .then(result => {
    console.log('✅ Analysis complete:', result);
    window.boneAnalysisResult = result;
  })
  .catch(err => {
    console.error('❌ Analysis failed:', err);
  });
