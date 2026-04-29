# 🎮 Skeleton Controller — Guide d'utilisation

## 🚀 Activez le contrôleur

Dans `skeleton-test.html`, cliquez sur le bouton **🎮 Skeleton Controller** (jaune).

Un panneau cyan s'affichera en bas à droite avec:
- ✅ Liste de TOUS les os du squelette
- ✅ Sliders pour contrôler la rotation
- ✅ Boutons d'action (Reset, Export)

---

## 🎯 Comment animer

### 1️⃣ Sélectionner un os

Cliquez sur un nom d'os dans la liste (ex: `Arm.L`, `Head`, `Leg.R`).

Le bouton devient **vert** = sélectionné.

### 2️⃣ Animer avec les sliders

Trois sliders apparaissent:
- **X**: Rotation avant/arrière (↕)
- **Y**: Rotation gauche/droite (↔)
- **Z**: Rotation torsion (⟲)

Glissez pour faire bouger l'os en direct!

### 3️⃣ Ou utiliser le clavier

Avec un os sélectionné, utilisez:

```
↑ = Rotation X +
↓ = Rotation X -
→ = Rotation Y +
← = Rotation Y -
E = Rotation Z +
Q = Rotation Z -
R = Reset pose
```

---

## 💾 Sauvegarder votre animation

### Exporter la pose

Cliquez sur **"Export Pose"** pour télécharger:
```
pose-1234567890.json
```

Contient la rotation de TOUS les os à ce moment.

### Format JSON

```json
{
  "timestamp": "2026-04-29T...",
  "bones": [
    {
      "name": "Arm.L",
      "rotation": {
        "x": 0.7854,
        "y": 0.0,
        "z": 0.0
      },
      "position": {
        "x": 0.18,
        "y": 0,
        "z": 0
      }
    },
    // ... tous les autres os
  ]
}
```

---

## 🎬 Créer une animation complète

### Étape 1: Poser l'os initial (T=0)

```
Frame 1 (0 secondes)
├─ Sélectionnez: Arm.L
├─ Mettez en position initiale
└─ Cliquez: Export Pose
```

### Étape 2: Poser l'os final (T=1)

```
Frame 2 (1 seconde)
├─ Gardez: Arm.L sélectionné
├─ Changez la rotation
└─ Cliquez: Export Pose
```

### Étape 3: Créer keyframes

Utilisez les deux poses JSON pour créer une animation:

```javascript
const tester = window.skeletonTester;
const animTester = AnimationTester.createPresets(tester.testSkeleton);

const myAnim = [
  {
    time: 0,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(0, 0, 0),  // De pose 1
  },
  {
    time: 1,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(0.7854, 0, 0),  // De pose 2
  },
];

animTester.createAnimation('myAnimation', myAnim);
animTester.play('myAnimation');
```

---

## 👥 Animer plusieurs os

### Technique: Keyframes simultanées

```javascript
const multiAnim = [
  // Frame 0
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
  
  // Frame 0.5 (mi-chemin)
  {
    time: 0.5,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(Math.PI / 2, 0, 0),
  },
  {
    time: 0.5,
    boneName: 'Arm.R',
    rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
  },
  
  // Frame 1
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
];

tester.createAnimation('walkArms', multiAnim);
```

---

## 📊 Workflow complet

```
1. Ouvrir skeleton-test.html
   ↓
2. Cliquer "🎮 Skeleton Controller"
   ↓
3. Sélectionner un os (ex: Arm.L)
   ↓
4. Poser l'os (slider ou clavier)
   ↓
5. Export Pose → pose-1.json
   ↓
6. Changer pose (même os ou autre)
   ↓
7. Export Pose → pose-2.json
   ↓
8. Créer animation keyframes (voir exemple)
   ↓
9. Tester avec animation-tester.js
   ↓
10. Appliquer au modèle final
```

---

## 🎨 Exemples d'animation rapides

### Saluer (Wave)

```javascript
const wave = [
  { time: 0, boneName: 'Arm.R', rotation: new THREE.Euler(0, 0, 0) },
  { time: 0.3, boneName: 'Arm.R', rotation: new THREE.Euler(Math.PI / 2.5, 0, 0) },
  { time: 0.6, boneName: 'Arm.R', rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
  { time: 1, boneName: 'Arm.R', rotation: new THREE.Euler(0, 0, 0) },
];
tester.createAnimation('wave', wave);
tester.play('wave');
```

### S'étirer (Stretch)

```javascript
const stretch = [
  { time: 0, boneName: 'Spine', rotation: new THREE.Euler(0, 0, 0) },
  { time: 0.5, boneName: 'Spine', rotation: new THREE.Euler(-0.3, 0, 0) },
  { time: 1, boneName: 'Spine', rotation: new THREE.Euler(0, 0, 0) },
];
tester.createAnimation('stretch', stretch);
tester.play('stretch');
```

### Marcher (Walk - bras)

```javascript
const walk = [];
for (let i = 0; i <= 10; i++) {
  const t = i / 10;
  const angle = Math.sin(t * Math.PI * 2) * 0.4;
  
  walk.push({
    time: t,
    boneName: 'Arm.L',
    rotation: new THREE.Euler(angle, 0, 0),
  });
  walk.push({
    time: t,
    boneName: 'Arm.R',
    rotation: new THREE.Euler(-angle, 0, 0),
  });
}
tester.createAnimation('walk', walk);
tester.play('walk');
```

---

## 🔍 Debugging

### Voir les os disponibles

```javascript
window.skeletonTester.testSkeleton.bones.map(b => b.name)
```

### Inspecter un os

```javascript
const bone = window.skeletonTester.testSkeleton.boneMap['Arm.L'];
console.log('Position:', bone.position);
console.log('Rotation:', bone.rotation);
console.log('Children:', bone.children.length);
```

### Voir la rotation en degrés

```javascript
const bone = window.skeletonTester.testSkeleton.boneMap['Arm.L'];
const degX = bone.rotation.x * 180 / Math.PI;
const degY = bone.rotation.y * 180 / Math.PI;
const degZ = bone.rotation.z * 180 / Math.PI;
console.log(`${degX}°, ${degY}°, ${degZ}°`);
```

---

## ⚡ Tips & Tricks

### Animations fluides

Utilisez plusieurs keyframes intermédiaires (pas juste début/fin):
```javascript
[
  { time: 0, boneName: 'Arm.L', rotation: ... },
  { time: 0.25, boneName: 'Arm.L', rotation: ... },  // Intermédiaire
  { time: 0.5, boneName: 'Arm.L', rotation: ... },   // Intermédiaire
  { time: 0.75, boneName: 'Arm.L', rotation: ... },  // Intermédiaire
  { time: 1, boneName: 'Arm.L', rotation: ... },
]
```

### Synchroniser plusieurs os

Tous les os avec `time: 0.5` bougent ensemble:
```javascript
[
  { time: 0.5, boneName: 'Arm.L', ... },
  { time: 0.5, boneName: 'Arm.R', ... },  // Au même moment
  { time: 0.5, boneName: 'Head', ... },   // Au même moment
]
```

### Reprendre une pose

Sauvegardez le JSON et chargez-le plus tard:
```javascript
const savedPose = JSON.parse(localStorage.getItem('myPose'));
savedPose.bones.forEach(bone => {
  const b = window.skeletonTester.testSkeleton.boneMap[bone.name];
  if (b) {
    b.rotation.set(bone.rotation.x, bone.rotation.y, bone.rotation.z);
  }
});
```

---

## 📞 Ressources

- **skeleton-controller.js** - Le module du contrôleur
- **skeleton-tester.js** - Intégration dans le testeur
- **animation-tester.js** - Classe d'animation
- **example-usage.js** - Exemples complets

---

## ✅ Checklist de démarrage

- [ ] Ouvrir `skeleton-test.html`
- [ ] Attendre le chargement (2-3 sec)
- [ ] Cliquer "🎮 Skeleton Controller" (jaune)
- [ ] Voir le panneau cyan en bas à droite
- [ ] Cliquer sur un os (ex: Head)
- [ ] Vérifier que le bouton devient vert
- [ ] Bouger un slider
- [ ] Voir l'os bouger en direct! ✨
- [ ] Essayer les touches clavier (↑↓←→QER)
- [ ] Export Pose pour sauvegarder

**Vous êtes prêt à créer vos animations ! 🚀**
