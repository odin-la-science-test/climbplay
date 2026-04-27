// ============================================================
// LEVELS.JS — Predefined climbing routes with exact hold positions
// ============================================================

export const PREDEFINED_LEVELS = {
  // ══════════ BLOC LEVELS ══════════
  'bloc-1': {
    name: "La Dalle Douce",
    mode: 'BLOC',
    difficulty: 1,
    grade: '4',
    desc: "Première ascension, prises généreuses.",
    holds: [
      // Start holds
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      // Route holds
      { x: -0.15, y: 1.60, z: 0.02, type: 'BAC' },
      { x: 0.18, y: 1.75, z: 0.02, type: 'BAC' },
      { x: -0.10, y: 2.20, z: 0.02, type: 'REGLETTE' },
      { x: 0.25, y: 2.40, z: 0.02, type: 'BAC' },
      { x: 0.05, y: 2.90, z: 0.02, type: 'BAC' },
      { x: -0.20, y: 3.30, z: 0.02, type: 'REGLETTE' },
      { x: 0.15, y: 3.60, z: 0.02, type: 'BAC' },
      { x: -0.05, y: 4.10, z: 0.02, type: 'BAC' },
      { x: 0.10, y: 4.50, z: 0.02, type: 'BAC' },
      
      // Top
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },
  
  'bloc-2': {
    name: "Le Dièdre du Débutant",
    mode: 'BLOC',
    difficulty: 2,
    grade: '5c',
    desc: "Quelques réglettes, début de la technique.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: -0.30, y: 1.55, z: 0.02, type: 'REGLETTE' },
      { x: 0.35, y: 1.70, z: 0.02, type: 'BAC' },
      { x: -0.40, y: 2.10, z: 0.02, type: 'VOLUME' },
      { x: 0.25, y: 2.35, z: 0.02, type: 'REGLETTE' },
      { x: -0.15, y: 2.80, z: 0.02, type: 'PINCETTE' },
      { x: 0.40, y: 3.10, z: 0.02, type: 'BAC' },
      { x: -0.25, y: 3.50, z: 0.02, type: 'REGLETTE' },
      { x: 0.20, y: 3.90, z: 0.02, type: 'REGLETTE' },
      { x: 0.00, y: 4.40, z: 0.02, type: 'BAC' },
      
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },
  
  'bloc-3': {
    name: "La Fissure Traîtresse",
    mode: 'BLOC',
    difficulty: 3,
    grade: '6a',
    desc: "Les premières pincettes apparaissent.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: 0.45, y: 1.50, z: 0.02, type: 'PINCETTE' },
      { x: -0.35, y: 1.85, z: 0.02, type: 'REGLETTE' },
      { x: 0.30, y: 2.20, z: 0.02, type: 'PINCETTE' },
      { x: -0.50, y: 2.60, z: 0.01, type: 'VOLUME' },
      { x: 0.15, y: 2.95, z: 0.02, type: 'PLAT' },
      { x: -0.20, y: 3.35, z: 0.02, type: 'PINCETTE' },
      { x: 0.40, y: 3.70, z: 0.02, type: 'REGLETTE' },
      { x: -0.10, y: 4.10, z: 0.02, type: 'PLAT' },
      { x: 0.25, y: 4.50, z: 0.02, type: 'PINCETTE' },
      
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },
  
  // ══════════ VOIE LEVELS ══════════
  'voie-1': {
    name: "Initiation Falaise",
    mode: 'VOIE',
    difficulty: 1,
    grade: '4',
    desc: "Voie tracée pour les premières fois.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: -0.18, y: 1.80, z: 0.02, type: 'BAC' },
      { x: 0.25, y: 2.20, z: 0.02, type: 'BAC' },
      { x: -0.15, y: 2.80, z: 0.02, type: 'REGLETTE' },
      { x: 0.30, y: 3.40, z: 0.02, type: 'BAC' },
      { x: -0.20, y: 4.00, z: 0.02, type: 'BAC' },
      { x: 0.15, y: 4.60, z: 0.02, type: 'REGLETTE' },
      { x: -0.25, y: 5.20, z: 0.02, type: 'BAC' },
      { x: 0.20, y: 5.80, z: 0.02, type: 'BAC' },
      { x: -0.10, y: 6.50, z: 0.02, type: 'REGLETTE' },
      { x: 0.25, y: 7.20, z: 0.02, type: 'BAC' },
      { x: -0.15, y: 7.90, z: 0.02, type: 'BAC' },
      { x: 0.20, y: 8.60, z: 0.02, type: 'REGLETTE' },
      { x: -0.10, y: 9.30, z: 0.02, type: 'BAC' },
      { x: 0.15, y: 10.00, z: 0.02, type: 'BAC' },
      { x: -0.20, y: 10.70, z: 0.02, type: 'REGLETTE' },
      { x: 0.10, y: 11.40, z: 0.02, type: 'BAC' },
      { x: -0.15, y: 12.10, z: 0.02, type: 'BAC' },
      { x: 0.20, y: 12.80, z: 0.02, type: 'REGLETTE' },
      { x: 0.00, y: 13.50, z: 0.02, type: 'BAC' },
      { x: -0.10, y: 14.20, z: 0.02, type: 'BAC' },
      
      { x: 0.00, y: 15.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },
  
  'voie-2': {
    name: "La Couenne Calcaire",
    mode: 'VOIE',
    difficulty: 2,
    grade: '5c',
    desc: "Calcaire typique, bonne adhérence.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: 0.35, y: 1.70, z: 0.02, type: 'REGLETTE' },
      { x: -0.40, y: 2.30, z: 0.01, type: 'VOLUME' },
      { x: 0.30, y: 2.95, z: 0.02, type: 'PINCETTE' },
      { x: -0.25, y: 3.60, z: 0.02, type: 'REGLETTE' },
      { x: 0.40, y: 4.25, z: 0.02, type: 'BAC' },
      { x: -0.35, y: 4.90, z: 0.02, type: 'REGLETTE' },
      { x: 0.25, y: 5.55, z: 0.02, type: 'PINCETTE' },
      { x: -0.45, y: 6.20, z: 0.01, type: 'VOLUME' },
      { x: 0.30, y: 6.90, z: 0.02, type: 'REGLETTE' },
      { x: -0.20, y: 7.60, z: 0.02, type: 'PLAT' },
      { x: 0.35, y: 8.30, z: 0.02, type: 'PINCETTE' },
      { x: -0.30, y: 9.00, z: 0.02, type: 'REGLETTE' },
      { x: 0.25, y: 9.70, z: 0.02, type: 'BAC' },
      { x: -0.35, y: 10.40, z: 0.02, type: 'REGLETTE' },
      { x: 0.20, y: 11.10, z: 0.02, type: 'PINCETTE' },
      { x: -0.25, y: 11.80, z: 0.02, type: 'PLAT' },
      { x: 0.30, y: 12.50, z: 0.02, type: 'REGLETTE' },
      { x: -0.15, y: 13.20, z: 0.02, type: 'BAC' },
      { x: 0.20, y: 13.90, z: 0.02, type: 'REGLETTE' },
      { x: 0.00, y: 14.60, z: 0.02, type: 'BAC' },
      
      { x: 0.00, y: 15.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  }
};

// Get level by ID
export function getLevel(levelId) {
  return PREDEFINED_LEVELS[levelId] || null;
}

// Get all levels for a mode
export function getLevelsByMode(mode) {
  return Object.entries(PREDEFINED_LEVELS)
    .filter(([id, level]) => level.mode === mode)
    .map(([id, level]) => ({ id, ...level }));
}
