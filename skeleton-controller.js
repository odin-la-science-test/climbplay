// THREE fourni par le CDN
const THREE = window.THREE;

// ============================================================
// SKELETON CONTROLLER — Contrôles interactifs pour animer
// ============================================================

export class SkeletonController {
  constructor(skeleton, container) {
    this.skeleton = skeleton;
    this.container = container;
    this.selectedBone = null;
    this.controls = {};
    this.isRotating = false;
    
    this._createControlPanel();
    this._setupKeyboardControls();
  }

  _createControlPanel() {
    // Panel principal
    const panel = document.createElement('div');
    panel.id = 'skeleton-controller-panel';
    panel.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #0ff;
      border-radius: 8px;
      padding: 15px;
      color: #0ff;
      font-family: monospace;
      font-size: 11px;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 101;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `;

    // Titre
    const title = document.createElement('h3');
    title.textContent = '🎮 Skeleton Controller';
    title.style.cssText = 'margin: 0 0 10px 0; border-bottom: 1px solid #0ff; padding-bottom: 5px;';
    panel.appendChild(title);

    // Liste des os
    const boneList = document.createElement('div');
    boneList.id = 'bone-list';
    boneList.style.cssText = 'margin-bottom: 10px;';

    this.skeleton.bones.forEach(bone => {
      const boneButton = document.createElement('button');
      boneButton.textContent = bone.name;
      boneButton.style.cssText = `
        display: block;
        width: 100%;
        padding: 6px;
        margin: 3px 0;
        background: #0ff;
        color: #000;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-family: monospace;
        font-size: 10px;
        transition: all 0.2s ease;
      `;

      boneButton.addEventListener('click', () => {
        this.selectBone(bone);
        document.querySelectorAll('#bone-list button').forEach(b => {
          b.style.background = '#0ff';
          b.style.color = '#000';
        });
        boneButton.style.background = '#0f0';
        boneButton.style.color = '#000';
      });

      boneButton.addEventListener('mouseover', () => {
        if (boneButton.style.background !== '#0f0') {
          boneButton.style.background = '#088';
        }
      });

      boneButton.addEventListener('mouseout', () => {
        if (boneButton.style.background !== '#0f0') {
          boneButton.style.background = '#0ff';
        }
      });

      boneList.appendChild(boneButton);
    });

    panel.appendChild(boneList);

    // Contrôles de rotation
    const rotationDiv = document.createElement('div');
    rotationDiv.id = 'rotation-controls';
    rotationDiv.style.cssText = `
      border-top: 1px solid #0ff;
      padding-top: 10px;
      margin-top: 10px;
    `;

    const rotLabel = document.createElement('p');
    rotLabel.textContent = 'Rotation (sélectionnez un os):';
    rotLabel.style.cssText = 'margin: 0 0 8px 0;';
    rotationDiv.appendChild(rotLabel);

    // Sliders X, Y, Z
    ['X', 'Y', 'Z'].forEach(axis => {
      const sliderContainer = document.createElement('div');
      sliderContainer.style.cssText = 'margin: 5px 0;';

      const label = document.createElement('label');
      label.textContent = `${axis}: `;
      label.style.cssText = 'display: inline-block; width: 30px;';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '-180';
      slider.max = '180';
      slider.value = '0';
      slider.style.cssText = 'width: 100px;';
      slider.id = `slider-${axis}`;

      const value = document.createElement('span');
      value.textContent = '0°';
      value.style.cssText = 'margin-left: 10px; width: 40px; display: inline-block;';
      value.id = `value-${axis}`;

      slider.addEventListener('input', () => {
        value.textContent = `${slider.value}°`;
        this.updateBoneRotation();
      });

      sliderContainer.appendChild(label);
      sliderContainer.appendChild(slider);
      sliderContainer.appendChild(value);
      rotationDiv.appendChild(sliderContainer);

      this.controls[axis] = { slider, value };
    });

    panel.appendChild(rotationDiv);

    // Boutons d'action
    const actionDiv = document.createElement('div');
    actionDiv.style.cssText = `
      border-top: 1px solid #0ff;
      padding-top: 10px;
      margin-top: 10px;
    `;

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Pose';
    resetBtn.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px;
      background: #0ff;
      color: #000;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-weight: bold;
      margin-bottom: 5px;
    `;
    resetBtn.addEventListener('click', () => this.resetPose());
    actionDiv.appendChild(resetBtn);

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Pose';
    exportBtn.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px;
      background: #0ff;
      color: #000;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-weight: bold;
    `;
    exportBtn.addEventListener('click', () => this.exportPose());
    actionDiv.appendChild(exportBtn);

    panel.appendChild(actionDiv);

    // Status
    const statusDiv = document.createElement('div');
    statusDiv.id = 'controller-status';
    statusDiv.style.cssText = `
      border-top: 1px solid #0ff;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 10px;
    `;
    statusDiv.innerHTML = '<p id="status-text">Cliquez sur un os pour le sélectionner</p>';
    panel.appendChild(statusDiv);

    this.container.appendChild(panel);
    this.panel = panel;
  }

  selectBone(bone) {
    this.selectedBone = bone;
    this._updateStatus(`Sélectionné: ${bone.name}`);
    
    // Réinitialiser sliders
    Object.keys(this.controls).forEach(axis => {
      this.controls[axis].slider.value = 0;
      this.controls[axis].value.textContent = '0°';
    });
  }

  updateBoneRotation() {
    if (!this.selectedBone) return;

    const x = parseFloat(this.controls.X.slider.value) * Math.PI / 180;
    const y = parseFloat(this.controls.Y.slider.value) * Math.PI / 180;
    const z = parseFloat(this.controls.Z.slider.value) * Math.PI / 180;

    this.selectedBone.rotation.set(x, y, z);
  }

  resetPose() {
    this.skeleton.bones.forEach(bone => {
      bone.rotation.set(0, 0, 0);
    });
    
    if (this.selectedBone) {
      Object.keys(this.controls).forEach(axis => {
        this.controls[axis].slider.value = 0;
        this.controls[axis].value.textContent = '0°';
      });
    }
    
    this._updateStatus('Pose réinitialisée');
  }

  exportPose() {
    const poseData = {
      timestamp: new Date().toISOString(),
      bones: this.skeleton.bones.map(bone => ({
        name: bone.name,
        rotation: {
          x: bone.rotation.x,
          y: bone.rotation.y,
          z: bone.rotation.z,
        },
        position: {
          x: bone.position.x,
          y: bone.position.y,
          z: bone.position.z,
        },
      })),
    };

    const json = JSON.stringify(poseData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pose-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this._updateStatus('Pose exportée!');
  }

  _setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.selectedBone) return;

      const amount = 0.05; // radians

      switch (e.key) {
        case 'ArrowUp':
          this.selectedBone.rotation.x += amount;
          break;
        case 'ArrowDown':
          this.selectedBone.rotation.x -= amount;
          break;
        case 'ArrowLeft':
          this.selectedBone.rotation.y -= amount;
          break;
        case 'ArrowRight':
          this.selectedBone.rotation.y += amount;
          break;
        case 'q':
        case 'Q':
          this.selectedBone.rotation.z -= amount;
          break;
        case 'e':
        case 'E':
          this.selectedBone.rotation.z += amount;
          break;
        case 'r':
        case 'R':
          this.resetPose();
          break;
        default:
          return;
      }

      e.preventDefault();
    });
  }

  _updateStatus(message) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = message;
    }
  }

  getBoneRotation(boneName) {
    const bone = this.skeleton.boneMap[boneName];
    if (bone) {
      return {
        x: bone.rotation.x,
        y: bone.rotation.y,
        z: bone.rotation.z,
      };
    }
    return null;
  }

  setBoneRotation(boneName, rotation) {
    const bone = this.skeleton.boneMap[boneName];
    if (bone) {
      bone.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
    }
  }
}

export default SkeletonController;
