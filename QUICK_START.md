# ⚡ Quick Start Checklist

## 🚀 5 minutes pour démarrer

### Étape 1: Terminal (30 secondes)

```bash
# Naviguez vers votre dossier jeux
cd c:\Users\fcb1909-user\Desktop\jeux

# Démarrez un serveur local
python -m http.server 8000
# Ou si vous avez Node.js:
npx http-server
```

**Vous devriez voir:**
```
Serving HTTP on 0.0.0.0 port 8000
```

### Étape 2: Navigateur (10 secondes)

Ouvrez votre navigateur et allez à:
```
http://localhost:8000/skeleton-test.html
```

### Étape 3: Vérifier (2 minutes)

1. ✅ Attendez que la page charge
2. ✅ Vous devriez voir une vue 3D
3. ✅ Panel vert en haut à gauche
4. ✅ Deux modèles: original (gauche) + squelette test (droite)
5. ✅ Console verte en haut à droite

**Dans la console, vous devriez voir:**
```
✅ disagne-1-perso.glb loaded
🦴 Bones found: 50
Creating test skeleton with 50 bones...
✅ Test skeleton created
```

### Étape 4: Tester les contrôles (1 minute)

Cliquez sur les boutons dans le panel:

1. **Toggle Original Model** → Masque/affiche le modèle gauche
2. **Toggle Test Skeleton** → Masque/affiche le squelette droite
3. **Export Skeleton (JSON)** → Télécharge un fichier `skeleton-50-bones.json`
4. **Reset Camera** → Réinitialise la vue

### Étape 5: Ouvrir la Console Navigateur (1 minute)

Appuyez sur **F12** pour ouvrir la console du navigateur

Tapez et exécutez:
```javascript
// Voir le squelette
window.skeletonTester

// Voir le nombre d'os
window.skeletonTester.boneCount

// Voir tous les os
window.skeletonTester.testSkeleton.bones

// Voir un os spécifique
window.skeletonTester.testSkeleton.boneMap['Arm.L']
```

---

## 📝 Fichiers créés (6 au total)

```
✅ bone-counter.js           → Analyse os du modèle
✅ skeleton-generator.js     → Crée squelette procédural
✅ skeleton-tester.js        → Interface 3D (logic)
✅ skeleton-test.html        → Interface 3D (web)
✅ animation-tester.js       → Crée et teste animations
✅ example-usage.js          → Exemples d'intégration
```

Plus 3 guides:
```
✅ README_SKELETON_KIT.md    → Récapitulatif complet
✅ SKELETON_GUIDE.md         → Documentation détaillée
✅ QUICK_START.md            ← Vous êtes ici!
```

---

## 🎬 Tester une animation (Console)

Dans la console du navigateur (F12):

```javascript
// Créer animations test
const tester = AnimationTester.createPresets(
  window.skeletonTester.testSkeleton
);

// Lancer une animation
tester.play('wave');

// Attendre 2 secondes... elle devrait se terminer

// Lancer une autre
tester.play('walk');

// Arrêter
tester.stop();

// Voir les animations disponibles
console.log(tester.listAnimations());
// Output: ['wave', 'walk', 'stretch', 'look-around', 'climb-reach']
```

---

## 💡 Cas d'usage courants

### "Je veux compter les os du modèle"

```javascript
// Déjà fait automatiquement, mais si vous le refaites:
window.skeletonTester.boneCount
// → 50 (ou votre nombre)
```

### "Je veux créer une animation"

```javascript
const tester = window.animationTester;

const myAnim = [
  { time: 0, boneName: 'Head', rotation: new THREE.Euler(0, 0, 0) },
  { time: 0.5, boneName: 'Head', rotation: new THREE.Euler(0.5, 0, 0) },
  { time: 1, boneName: 'Head', rotation: new THREE.Euler(0, 0, 0) },
];

tester.createAnimation('myCustom', myAnim);
tester.play('myCustom');
```

### "Je veux voir tous les noms d'os"

```javascript
const names = window.skeletonTester.testSkeleton.bones.map(b => b.name);
console.log(names);
```

### "Je veux exporter mes animations"

Cliquez sur le bouton **"Export Skeleton (JSON)"** dans le panel.

C'est un fichier JSON que vous pouvez charger ailleurs.

### "Je veux intégrer dans mon code"

Voir `example-usage.js` pour des exemples complets.

---

## 🔧 Problèmes courants

### ❌ "Rien ne s'affiche"

1. Vérifiez que le serveur tourne: `python -m http.server 8000`
2. Ouvrez `http://localhost:8000/skeleton-test.html`
3. Appuyez sur F12 pour voir les erreurs
4. Vérifiez que `disagne-1-perso.glb` existe

### ❌ "CORS Error"

Il faut un serveur local, pas `file://`

```bash
python -m http.server 8000
# Puis: http://localhost:8000/skeleton-test.html
```

### ❌ "Le modèle ne charge pas"

Vérifiez:
1. `disagne-1-perso.glb` est dans `c:\Users\fcb1909-user\Desktop\jeux`
2. Le nom du fichier est correct (case-sensitive)
3. Console F12 montre l'erreur exacte

### ❌ "Le squelette ne s'affiche pas"

Normalement, il s'affiche après 1-2 secondes.

Si rien après 5 secondes:
1. Ouvrez F12 (console)
2. Cherchez les erreurs rouges
3. Vérifiez que `skeleton-generator.js` est chargé

---

## ✅ Vous êtes prêt quand:

- [ ] Serveur local tourne (`http://localhost:8000/`)
- [ ] `skeleton-test.html` s'ouvre
- [ ] Vous voyez 2 modèles (original + squelette)
- [ ] Le panel vert fonctionne (boutons)
- [ ] La console F12 montre pas d'erreurs
- [ ] Vous pouvez jouer avec les animations

---

## 📚 Prochaines étapes

1. **Développer une animation personnalisée**
   → Voir `example-usage.js`

2. **Intégrer dans votre code**
   → Voir `SKELETON_GUIDE.md`

3. **Exporter pour le modèle final**
   → Cliquer "Export Skeleton (JSON)"

4. **Appliquer à disagne-1-perso.glb**
   → Voir section "Appliquer au modèle final" dans `SKELETON_GUIDE.md`

---

## 💬 Questions rapides

**Q: Combien de temps pour créer une animation?**
A: 2-5 minutes pour une simple, 30 min pour une complexe

**Q: Je peux utiliser cela dans mon jeu?**
A: Oui! Voir `example-usage.js` pour l'intégration

**Q: Les animations fonctionneront sur le vrai modèle?**
A: Oui, si les noms d'os matchent

**Q: Je peux exporter en FBX/GLTF?**
A: JSON seulement pour maintenant. Vous pouvez convertir après.

**Q: C'est compatible avec Three.js AnimationMixer?**
A: Partiellement. Utiliser `AnimationTester` pour maintenant.

---

## 🚀 Vous êtes prêt!

Lancez le serveur et ouvrez `skeleton-test.html` 🎉

Des questions? Consultez:
- `README_SKELETON_KIT.md` → Vue d'ensemble
- `SKELETON_GUIDE.md` → Documentation complète
- `example-usage.js` → Code d'exemple
- Console F12 → Messages de debug

Bon courage ! 💪
