# 🎬 Skeleton Animation Development Kit

## 📦 Résumé : 5 nouveaux fichiers créés

Vous avez maintenant un **kit complet** pour développer des animations sur un squelette procédural **avant** de les appliquer à `disagne-1-perso.glb`.

### Fichiers créés :

```
jeux/
├── bone-counter.js              ✅ Analyseur d'os du modèle original
├── skeleton-generator.js        ✅ Générateur de squelette procédural (50 os)
├── skeleton-tester.js           ✅ Testeur visuel 3D (JS)
├── skeleton-test.html           ✅ Interface Web 3D complète
├── animation-tester.js          ✅ Contrôles d'animation simple
└── SKELETON_GUIDE.md            ✅ Documentation complète
```

---

## 🎯 3 étapes pour démarrer

### 1️⃣ Démarrer le serveur local

```bash
# Option A : Python (si Python est installé)
python -m http.server 8000

# Option B : Node.js
npx http-server

# Option C : VS Code Live Server extension
# Clic droit sur skeleton-test.html → "Open with Live Server"
```

### 2️⃣ Ouvrir dans le navigateur

```
http://localhost:8000/skeleton-test.html
```

### 3️⃣ Voir la magie ✨

Le système va automatiquement :
1. ✅ Charger `disagne-1-perso.glb`
2. ✅ Compter ses os
3. ✅ Générer un squelette procédural avec le même nombre
4. ✅ Afficher les deux côte à côte
5. ✅ Vous laisser tester les animations

---

## 💡 Comment ça fonctionne

### Architecture générale

```
┌─────────────────────────────────────────────────────┐
│         skeleton-test.html (Interface Web)          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐    ┌──────────────────┐     │
│  │ bone-counter.js  │    │  skeleton-gen.js │     │
│  ├──────────────────┤    ├──────────────────┤     │
│  │ Charge GLB       │    │ Crée 50 os       │     │
│  │ Compte os        │    │ Structure body   │     │
│  │ Affiche list     │    │ Visualisation    │     │
│  └──────────────────┘    └──────────────────┘     │
│                                                      │
│  ┌──────────────────────────────────────────┐     │
│  │    skeleton-tester.js (Testeur)          │     │
│  ├──────────────────────────────────────────┤     │
│  │ - Charge les deux modèles                │     │
│  │ - Affiche côte à côte                    │     │
│  │ - Panel de contrôle                      │     │
│  │ - Export JSON                            │     │
│  └──────────────────────────────────────────┘     │
│                                                      │
│  ┌──────────────────────────────────────────┐     │
│  │    animation-tester.js (Animations)      │     │
│  ├──────────────────────────────────────────┤     │
│  │ - Créer des animations                   │     │
│  │ - Tester sur le squelette procédural     │     │
│  │ - Exporter pour le modèle final          │     │
│  └──────────────────────────────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎮 Utilisation en détail

### Dans skeleton-test.html

**Panel de contrôle (haut gauche):**

```
🦴 Skeleton Tester
───────────────────

Model Info
├─ Original Model: 50 bones
├─ Test Skeleton: 50 bones
└─ Match: ✅ YES

Controls
├─ Toggle Original Model    (affiche/masque modèle)
├─ Toggle Test Skeleton     (affiche/masque squelette)
├─ Export Skeleton (JSON)   (télécharge structure)
└─ Reset Camera             (réinitialise vue)
```

**Console visuelle (haut droit):**
- Affiche les logs en direct
- Utile pour déboguer

**Instructions (bas gauche):**
- Guide rapide d'utilisation
- Les deux modèles côte à côte

### Interaction 3D

```
🖱️  Drag    → Rotate view
🔄  Scroll  → Zoom in/out
📍 Buttons  → Contrôler affichage
```

---

## 🎬 Créer vos propres animations

### Simple : Animation prédéfinie

```javascript
// Importer le testeur
import { AnimationTester } from './animation-tester.js';

// Obtenir le squelette
const skeleton = window.skeletonTester.testSkeleton;

// Créer un testeur
const tester = AnimationTester.createPresets(skeleton);

// Lancer une animation
tester.play('wave');

// Dans votre boucle d'animation
function loop() {
  tester.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
```

### Personnalisé : Créer une animation

```javascript
const tester = new AnimationTester(skeleton);

// Définir les keyframes
const myAnimation = [
  {
    time: 0,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(0, 0, 0),
  },
  {
    time: 0.5,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(Math.PI / 2, 0, 0),
  },
  {
    time: 1,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(0, 0, 0),
  },
];

// Créer l'animation
tester.createAnimation('myMotion', myAnimation);

// Tester
tester.play('myMotion');
```

### Intégrer dans votre code

```javascript
// Dans climber.js ou game.js
import { AnimationTester } from './animation-tester.js';

class Climber {
  constructor() {
    // ... code existant ...
    
    // Initialiser testeur d'animation
    this.animTester = new AnimationTester(this.testSkeleton);
    this.animTester.createAnimation('reach', [
      // Vos keyframes ici
    ]);
  }
  
  updatePose() {
    // ... code existant ...
    
    // Mettre à jour animations
    if (this.animTester) {
      this.animTester.update();
    }
  }
}
```

---

## 📊 Animations prédéfinies disponibles

Via `AnimationTester.createPresets(skeleton)`:

```javascript
const tester = AnimationTester.createPresets(skeleton);

// Animations disponibles:
tester.play('wave');          // Saluer avec la main
tester.play('walk');          // Marcher (bras)
tester.play('stretch');       // S'étirer (colonne)
tester.play('look-around');   // Regarder autour
tester.play('climb-reach');   // Atteindre en grimpant
```

---

## 💾 Exporter vos animations

### JSON export

```javascript
// Exporter une animation
const animData = tester.exportAnimation('myMotion');

// Format :
{
  "name": "myMotion",
  "duration": 1.0,
  "keyframes": [
    {
      "time": 0,
      "boneName": "Arm.L",
      "rotation": [0, 0, 0],
      "position": null
    },
    // ...
  ]
}
```

### Sauvegarder

```javascript
// Télécharger fichier
function downloadAnimation(tester, name) {
  const data = tester.exportAnimation(name);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.animation.json`;
  a.click();
}

downloadAnimation(tester, 'myMotion');
```

### Charger

```javascript
// Importer depuis JSON
async function loadAnimation(tester, file) {
  const data = await file.json();
  return tester.importAnimation(data);
}
```

---

## 🔍 Accéder aux os

### Par nom

```javascript
const skeleton = window.skeletonTester.testSkeleton;

// Accéder à un os spécifique
const armLeft = skeleton.boneMap['Arm.L'];
const legRight = skeleton.boneMap['Leg.R'];
const head = skeleton.boneMap['Head'];

// Modifier rotation
armLeft.rotation.x = Math.PI / 4;

// Ou quaternion
armLeft.quaternion.setFromEuler(new THREE.Euler(
  Math.PI / 4,  // x
  0,            // y
  0             // z
));
```

### Tous les os

```javascript
const allBones = skeleton.bones;
allBones.forEach(bone => {
  console.log(bone.name, bone.position, bone.rotation);
});
```

### Par groupe

```javascript
// Tous les os du bras gauche
const leftArmBones = skeleton.bones.filter(b => 
  b.name.includes('Arm.L') || b.name.includes('Shoulder.L')
);

// Animer groupe
leftArmBones.forEach(bone => {
  bone.rotation.x += 0.01;
});
```

---

## 🎨 Personnaliser le squelette

### Nombre d'os différent

```javascript
// Pour un modèle différent (ex: 100 os)
const generator = new SkeletonGenerator(100);
const skeleton = generator.generateHumanoid();
```

### Structure personnalisée

```javascript
class MyCustomSkeleton extends SkeletonGenerator {
  _createBoneStructure() {
    // Votre structure personnalisée
    return {
      'Armature': {
        'HQ_Head': { ... },
        'CustomArm': { ... },
        // ...
      }
    };
  }
}

const myGen = new MyCustomSkeleton(100);
const mySkeleton = myGen.generateHumanoid();
```

---

## 📈 Workflow recommandé

```
1. Ouvrir skeleton-test.html
   ↓
2. Vérifier que modèle original + squelette test ont même nombre d'os
   ↓
3. Créer des animations avec animation-tester.js
   ↓
4. Tester sur squelette procédural (développement rapide)
   ↓
5. Exporter animations en JSON
   ↓
6. Appliquer au modèle original (disagne-1-perso.glb)
   ↓
7. Intégrer dans game.js / climber.js
```

---

## 🛠️ Debugging

### Voir tous les os

```javascript
const skeleton = window.skeletonTester.testSkeleton;
console.table(skeleton.bones.map(b => ({ name: b.name, pos: b.position })));
```

### Lister animations

```javascript
const tester = window.animationTester;
console.log(tester.listAnimations());
console.log(tester.getStats());
```

### Inspecter un os

```javascript
const bone = skeleton.boneMap['Arm.L'];
console.log('Bone:', bone);
console.log('Position:', bone.position);
console.log('Rotation:', bone.rotation);
console.log('Scale:', bone.scale);
console.log('Children:', bone.children);
```

---

## ⚡ Performance Tips

```javascript
// ✅ BON: Mettre à jour une fois par frame
function update() {
  animationTester.update();  // Une fois
  renderer.render(scene, camera);
}

// ❌ MAUVAIS: Mettre à jour plusieurs fois
for (let i = 0; i < 100; i++) {
  animationTester.update();  // Slowww
}

// ✅ BON: Réutiliser Quaternions/Vectors
const q = new THREE.Quaternion();
const v = new THREE.Vector3();

bone.quaternion.copy(q);
bone.position.copy(v);

// ❌ MAUVAIS: Créer à chaque frame
function loop() {
  bone.rotation = new THREE.Euler(...);  // Allocate alloc alloc
}
```

---

## 📞 Ressources

**Fichiers clés:**
- `bone-counter.js` → Analyse modèle
- `skeleton-generator.js` → Création squelette
- `skeleton-tester.js` → Interface 3D
- `animation-tester.js` → Contrôle animations
- `skeleton-test.html` → Page Web

**Three.js Docs:**
- Bones: https://threejs.org/docs/#api/en/objects/Bone
- Animations: https://threejs.org/docs/#api/en/animation/AnimationMixer
- Quaternions: https://threejs.org/docs/#api/en/math/Quaternion

---

## ✅ Checklist de démarrage

- [ ] Ouvrir terminal dans `c:\Users\fcb1909-user\Desktop\jeux`
- [ ] Lancer serveur: `python -m http.server 8000`
- [ ] Ouvrir `http://localhost:8000/skeleton-test.html`
- [ ] Vérifier console pour les erreurs
- [ ] Voir les deux modèles s'afficher
- [ ] Cliquer "Toggle Original Model" / "Toggle Test Skeleton"
- [ ] Exporter structure JSON
- [ ] Ouvrir console navigateur (F12)
- [ ] Tester: `window.skeletonTester.testSkeleton.bones.length`
- [ ] Créer animation: `window.animationTester = AnimationTester.createPresets(...)`

---

**Vous êtes prêt ! Bon courage avec vos animations ! 🚀**

Des questions? Lancez un `console.log()` dans la console du navigateur (F12) pour inspecter les objets.
