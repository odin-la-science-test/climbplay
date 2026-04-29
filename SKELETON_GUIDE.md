# 🦴 Skeleton Development Kit — Guide Complet

## 📝 Vue d'ensemble

Vous avez maintenant 3 outils pour développer et tester les animations **avant** de les appliquer à votre modèle final `disagne-1-perso.glb`:

### 1. **bone-counter.js** — Analyseur d'os
Charge le modèle `disagne-1-perso.glb` et compte/liste tous ses os (bones).

**Usage:**
```javascript
import { BoneCounter } from './bone-counter.js';

BoneCounter.analyzeGLB('disagne-1-perso.glb')
  .then(result => {
    console.log(`Total bones: ${result.totalCount}`);
    console.log('Bones:', result.bones);
    console.log('Hierarchy:', result.hierarchy);
  });
```

**Output:**
```
✅ Total bones: 50
📋 Bone names: [Armature, Hips, Spine, Spine.001, ...]
```

---

### 2. **skeleton-generator.js** — Générateur de squelette procédural
Crée un squelette humanoid procédural avec un nombre configurable d'os.

**Caractéristiques:**
- ✅ Crée un squelette procédural avec N os
- ✅ Structure anatomique réaliste (bras, jambes, colonne vertébrale, doigts)
- ✅ Visualisation avec spheres et lignes de connexion
- ✅ Exportable pour l'animation

**Usage:**
```javascript
import { SkeletonGenerator } from './skeleton-generator.js';

// Créer un squelette avec 50 os (matching disagne-1-perso)
const generator = new SkeletonGenerator(50);
const skeleton = generator.generateHumanoid();

console.log(`Bones: ${skeleton.bones.length}`);
console.log('Names:', skeleton.bones.map(b => b.name));

// Ajouter à la scène
scene.add(skeleton.group);

// Exporter structure pour l'animation
const data = generator.exportForAnimation();
```

**Structure d'os (distribution):**
```
Armature
├── Hips
│   ├── Spine → Spine.001 → Spine.002 → Chest
│   │   ├── Neck → Head
│   │   ├── Shoulder.L → Arm.L → Forearm.L → Hand.L → Fingers
│   │   ├── Shoulder.R → Arm.R → Forearm.R → Hand.R → Fingers
│   ├── UpLeg.L → Leg.L → Foot.L → Toe.L
│   └── UpLeg.R → Leg.R → Foot.R → Toe.R
```

---

### 3. **skeleton-tester.js** + **skeleton-test.html** — Testeur visuel
Interface 3D complète pour:
- 📊 Charger et analyser `disagne-1-perso.glb`
- 🎯 Générer un squelette test avec le même nombre d'os
- 🔄 Afficher les deux côte à côte pour comparaison
- 💾 Exporter les données du squelette

**Features:**
- Affichage côte à côte (original vs test)
- Rotation automatique pour inspection
- Buttons de toggle pour afficher/masquer
- Export JSON de la structure
- Console visuelle intégrée

---

## 🚀 Getting Started

### Étape 1: Ouvrir le testeur visuel

```bash
# Servez le fichier HTML avec un serveur local
python -m http.server 8000
# ou
npx http-server
# ou utilisez VS Code Live Server extension
```

Ouvrez: `http://localhost:8000/skeleton-test.html`

### Étape 2: Analyse automatique

Au chargement, le système:
1. ✅ Charge `disagne-1-perso.glb`
2. ✅ Compte les os → affiche le total
3. ✅ Génère un squelette procédural avec le même nombre
4. ✅ Affiche les deux pour comparaison

**Console Output:**
```
✅ disagne-1-perso.glb loaded
🦴 Bones found: 50
📋 Bone names: [Armature, Hips, Spine, ...]
Creating test skeleton with 50 bones...
✅ Test skeleton created with 50 bones
Comparison: Original (left) vs Test Skeleton (right)
```

### Étape 3: Utiliser les controls

**Panel de contrôle (haut gauche):**
- Toggle Original Model → affiche/masque le modèle original
- Toggle Test Skeleton → affiche/masque le squelette test
- Export Skeleton → télécharge JSON de la structure
- Reset Camera → réinitialise la vue

### Étape 4: Développer les animations

Maintenant vous pouvez:

#### Tester sur le squelette procédural
```javascript
// Utiliser le squelette test pour développer les animations
const skeleton = window.skeletonTester.testSkeleton;

// Animer les os individuels
skeleton.boneMap['Arm.L'].rotation.x = Math.PI / 4;
skeleton.boneMap['Leg.L'].rotation.z = -0.3;

// Créer des keyframes
const mixer = new THREE.AnimationMixer(skeleton.group);
const animationClip = THREE.AnimationClip.parse({
  name: 'TestMotion',
  fps: 30,
  length: 2,
  hierarchy: [
    { keys: [...] },
    // ...
  ]
});
```

#### Valider sur le modèle original
Une fois les animations développées:
```javascript
// Appliquer les mêmes animations au modèle original
const originalMixer = new THREE.AnimationMixer(window.skeletonTester.originalModel);
originalMixer.clipAction(animationClip).play();
```

---

## 📊 Structure du squelette généré

### Paramètres configurables

```javascript
// Nombre d'os total
const count = 50; // matching disagne-1-perso

// Ou pour d'autres modèles
const customCount = 100;
const generator = new SkeletonGenerator(customCount);
```

### Distribution des os

Pour un squelette avec 50 os:
- **1** Armature (racine)
- **1** Hips (bassin)
- **4** Spine (colonne vertébrale)
- **3** Neck + Head (cou + tête)
- **5** Bras gauche (épaule, bras, avant-bras, main, doigts)
- **5** Bras droit (épaule, bras, avant-bras, main, doigts)
- **5** Jambe gauche (cuisse, jambe, pied, orteils)
- **5** Jambe droite (cuisse, jambe, pied, orteils)
- **Reste** → doigts/orteils supplémentaires

---

## 💾 Export et sauvegarde

### Exporter la structure

Cliquez sur "Export Skeleton (JSON)" pour télécharger:

```json
{
  "Armature": {
    "position": { "x": 0, "y": 0, "z": 0 },
    "children": {
      "Hips": { ... },
      "Spine": { ... },
      // ...
    }
  }
}
```

Utilisez ce JSON pour:
- ✅ Recréer le squelette ailleurs
- ✅ Documenter la structure
- ✅ Générer du code pour d'autres frameworks
- ✅ Partager la structure avec votre équipe

### Importer dans votre code

```javascript
// Charger depuis le JSON exporté
fetch('skeleton-50-bones.json')
  .then(r => r.json())
  .then(structure => {
    const generator = new SkeletonGenerator(50);
    // Utiliser la structure...
  });
```

---

## 🎬 Workflow d'animation complet

### 1. Développement
```
disagne-1-perso.glb
    ↓
[Bone Counter] → 50 bones found
    ↓
[Skeleton Generator] → Créer test skeleton avec 50 bones
    ↓
[Skeleton Tester] → Afficher les deux côte à côte
```

### 2. Animation de test
```
Test Skeleton
    ↓
Définir les keyframes d'animation
    ↓
Tester les mouvements
    ↓
Exporter animation data
```

### 3. Application au modèle final
```
Animation Data
    ↓
Appliquer à disagne-1-perso.glb
    ↓
Vérifier que ça marche
    ↓
Intégrer dans le game loop
```

---

## 🔧 Intégration avec votre code existant

### Dans climber.js

```javascript
import { SkeletonGenerator } from './skeleton-generator.js';

class Climber {
  constructor(skinId = 0) {
    // ... votre code existant ...
    
    // Ou pour tester avec le squelette procédural
    const generator = new SkeletonGenerator(50);
    const testSkeleton = generator.generateHumanoid();
    this.testSkeletonGroup = testSkeleton.group;
    this.testBones = testSkeleton.bones;
  }
}
```

### Dans game.js

```javascript
import { SkeletonGenerator } from './skeleton-generator.js';

class Game {
  init() {
    // ... votre code existant ...
    
    // Option: utiliser le squelette test pour le développement
    if (DEBUG_MODE) {
      const generator = new SkeletonGenerator(50);
      const skeleton = generator.generateHumanoid();
      this.scene.add(skeleton.group);
    }
  }
}
```

---

## 📝 Fichiers créés

```
jeux/
├── bone-counter.js         ✅ Analyseur d'os
├── skeleton-generator.js   ✅ Générateur procédural
├── skeleton-tester.js      ✅ Testeur visuel (JS)
├── skeleton-test.html      ✅ Testeur visuel (HTML)
└── SKELETON_GUIDE.md       ← Vous êtes ici
```

---

## ⚙️ Configuration avancée

### Modifier la structure d'os

```javascript
class CustomSkeletonGenerator extends SkeletonGenerator {
  _createBoneStructure() {
    // Personnaliser la hiérarchie ici
    return {
      'Armature': {
        'CustomHips': { ... },
        'CustomSpine': { ... },
        // ...
      }
    };
  }
}
```

### Ajouter de l'animation au squelette

```javascript
const skeleton = window.skeletonTester.testSkeleton;
const mixer = new THREE.AnimationMixer(skeleton.group);

// Créer une animation manuelle
function animateWalk() {
  const leftArm = skeleton.boneMap['Arm.L'];
  const rightArm = skeleton.boneMap['Arm.R'];
  
  const time = Date.now() * 0.001;
  leftArm.rotation.x = Math.sin(time) * 0.5;
  rightArm.rotation.x = Math.sin(time + Math.PI) * 0.5;
}

function frame() {
  animateWalk();
  requestAnimationFrame(frame);
}
frame();
```

---

## 🐛 Troubleshooting

### "Error loading GLB"
- ✅ Vérifiez que `disagne-1-perso.glb` existe dans le dossier racine
- ✅ Vérifiez le chemin dans les imports

### "Bones don't match"
- ✅ Le nombre peut varier légèrement
- ✅ Vérifiez que `boneCount` est correct dans `SkeletonGenerator`

### "Nothing visible"
- ✅ Assurez-vous que le serveur local tourne
- ✅ Ouvrez la console pour les erreurs
- ✅ Vérifiez les permissions CORS

---

## 📚 Ressources

- **Three.js Bones:** https://threejs.org/docs/index.html?q=bone
- **Animation System:** https://threejs.org/docs/index.html?q=animation
- **IK Solver:** Voir `ik-solver.js` dans votre projet

---

## 🎯 Prochaines étapes

1. ✅ Ouvrir `skeleton-test.html` dans le navigateur
2. ✅ Vérifier que les deux modèles ont le même nombre d'os
3. ✅ Exporter la structure JSON
4. ✅ Développer vos animations sur le squelette test
5. ✅ Appliquer au modèle final quand prêt

---

**Bonne chance avec vos animations ! 🚀**
