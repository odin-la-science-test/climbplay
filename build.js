const fs = require('fs');
const path = require('path');

const dist = 'www';
if (!fs.existsSync(dist)) fs.mkdirSync(dist);

const filesToCopy = [
  'index.html',
  'game.js',
  'data.js',
  'levels.js',
  'scene.js',
  'climber.js',
  'styles.css',
  'logo.png',
  'manifest.json',
  'disagne-1-perso.glb'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(dist, file));
    console.log(`Copied ${file} to ${dist}`);
  }
});
