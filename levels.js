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
    desc: "Première ascension, apprenez à zig-zaguer.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: 0.50, y: 1.60, z: 0.02, type: 'BAC' },
      { x: 0.80, y: 2.10, z: 0.02, type: 'BAC' },
      { x: 0.30, y: 2.50, z: 0.02, type: 'BAC' },
      { x: -0.40, y: 2.80, z: 0.02, type: 'REGLETTE' },
      { x: -0.80, y: 3.30, z: 0.02, type: 'BAC' },
      { x: -0.30, y: 3.80, z: 0.02, type: 'BAC' },
      { x: 0.40, y: 4.30, z: 0.02, type: 'BAC' },
      
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },
  
  'bloc-2': {
    name: "Le Dièdre du Débutant",
    mode: 'BLOC',
    difficulty: 2,
    grade: '5c',
    desc: "Un passage en traversée pour tester votre équilibre.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: -0.60, y: 1.60, z: 0.02, type: 'REGLETTE' },
      { x: -1.20, y: 1.80, z: 0.02, type: 'VOLUME' },
      { x: -0.80, y: 2.40, z: 0.02, type: 'REGLETTE' },
      { x: 0.20, y: 2.60, z: 0.02, type: 'BAC' },
      { x: 1.10, y: 2.80, z: 0.02, type: 'VOLUME' },
      { x: 1.40, y: 3.40, z: 0.02, type: 'REGLETTE' },
      { x: 0.70, y: 3.90, z: 0.02, type: 'BAC' },
      { x: -0.10, y: 4.40, z: 0.02, type: 'BAC' },
      
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },
  
  'bloc-3': {
    name: "La Fissure Traîtresse",
    mode: 'BLOC',
    difficulty: 3,
    grade: '6a',
    desc: "Un grand écart nécessaire !",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 1.10, z: 0.02, type: 'BAC', isStart: true },
      
      { x: 1.50, y: 1.80, z: 0.02, type: 'PINCETTE' },
      { x: 1.20, y: 2.40, z: 0.02, type: 'PLAT' },
      { x: -1.50, y: 2.40, z: 0.02, type: 'REGLETTE' },
      { x: -1.20, y: 3.20, z: 0.02, type: 'VOLUME' },
      { x: 0.00, y: 3.50, z: 0.02, type: 'BAC' },
      { x: 1.80, y: 4.10, z: 0.02, type: 'PINCETTE' },
      
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
  },
  
  // ══════════ MECHANIC TESTS ══════════
  'jump-1': {
    name: "Le Grand Saut",
    mode: 'BLOC',
    difficulty: 4,
    grade: '6c',
    desc: "Un saut dynamique est nécessaire pour continuer.",
    holds: [
      { x: -0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.22, y: 0.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.00, y: 1.20, z: 0.02, type: 'BAC', isStart: true },
      
      // The gap
      { x: 0.00, y: 3.20, z: 0.02, type: 'BAC' }, // Very far
      
      { x: -0.30, y: 3.80, z: 0.02, type: 'REGLETTE' },
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'swing-1': {
    name: "Le Pendule",
    mode: 'BLOC',
    difficulty: 3,
    grade: '6a',
    desc: "Balancez votre corps pour atteindre les prises latérales.",
    holds: [
      { x: 0.00, y: 1.00, z: 0.02, type: 'BAC', isStart: true },
      
      // Side holds far away
      { x: -1.20, y: 2.50, z: 0.02, type: 'BAC' },
      { x: 1.20, y: 2.50, z: 0.02, type: 'BAC' },
      
      { x: 0.00, y: 4.50, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'dyno-1': {
    name: "Le Vol Plané",
    mode: 'BLOC',
    difficulty: 5,
    grade: '7a',
    desc: "Un saut massif vers le haut. Prenez de l'élan !",
    holds: [
      { x: 0.00, y: 0.80, z: 0.02, type: 'BAC', isStart: true },
      // Huge gap
      { x: 0.00, y: 3.80, z: 0.02, type: 'BAC' },
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'swing-2': {
    name: "L'Horloge",
    mode: 'BLOC',
    difficulty: 4,
    grade: '6b',
    desc: "Balancez-vous de gauche à droite pour progresser.",
    holds: [
      { x: 0.00, y: 1.00, z: 0.02, type: 'BAC', isStart: true },
      { x: -1.00, y: 2.20, z: 0.02, type: 'BAC' },
      { x: 1.00, y: 3.40, z: 0.02, type: 'BAC' },
      { x: -0.80, y: 4.60, z: 0.02, type: 'BAC' },
      { x: 0.00, y: 5.50, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'no-feet-1': {
    name: "La Traction Pure",
    mode: 'BLOC',
    difficulty: 6,
    grade: '7b',
    desc: "Pas de prises de pieds. Utilisez uniquement vos bras !",
    holds: [
      { x: -0.20, y: 1.20, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 1.20, z: 0.02, type: 'BAC', isStart: true },
      // No feet reachable below
      { x: -0.15, y: 2.50, z: 0.02, type: 'PINCETTE' },
      { x: 0.15, y: 3.80, z: 0.02, type: 'REGLETTE' },
      { x: 0.00, y: 5.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  // ══════════ ENTRAINEMENT ══════════
  // Note: ARM_REACH = 0.8m. Jump height peak ~1.3m.
  
  'e1': {
    name: "Saut d'Initiation",
    mode: 'ENTRAINEMENT',
    difficulty: 1,
    grade: '4',
    desc: "Un saut court pour apprendre le timing.",
    holds: [
      { x: -0.20, y: 0.60, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 0.60, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.00, y: 1.80, z: 0.02, type: 'BAC' }, // Gap 1.2m (Reachable with jump)
      { x: 0.00, y: 3.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'e2': {
    name: "Balancement de Base",
    mode: 'ENTRAINEMENT',
    difficulty: 2,
    grade: '5c',
    desc: "Apprenez à décaler votre corps.",
    holds: [
      { x: -0.20, y: 0.80, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 0.80, z: 0.02, type: 'BAC', isStart: true },
      { x: -0.65, y: 1.50, z: 0.02, type: 'BAC' }, // Requires slight swing
      { x: 0.65, y: 2.20, z: 0.02, type: 'BAC' },  // Swing back
      { x: 0.00, y: 3.20, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'e3': {
    name: "Saut de Précision",
    mode: 'ENTRAINEMENT',
    difficulty: 3,
    grade: '6a',
    desc: "Un saut vers une prise plus petite.",
    holds: [
      { x: -0.20, y: 0.60, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 0.60, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.00, y: 2.00, z: 0.02, type: 'REGLETTE' }, // Precise target
      { x: 0.00, y: 3.20, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'e4': {
    name: "Le Balancier",
    mode: 'ENTRAINEMENT',
    difficulty: 4,
    grade: '6b',
    desc: "Utilisez l'élan pour atteindre les bords.",
    holds: [
      { x: 0.00, y: 0.80, z: 0.02, type: 'BAC', isStart: true },
      { x: -1.10, y: 1.80, z: 0.02, type: 'BAC' }, // Wide reach
      { x: 1.10, y: 2.80, z: 0.02, type: 'BAC' },  // Cross-body swing
      { x: 0.00, y: 4.00, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'e5': {
    name: "Dyno Extrême",
    mode: 'ENTRAINEMENT',
    difficulty: 6,
    grade: '7b',
    desc: "Un saut massif vers le haut.",
    holds: [
      { x: -0.20, y: 0.60, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 0.60, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.00, y: 2.20, z: 0.02, type: 'BAC' }, // High gap
      { x: 0.00, y: 3.80, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'e6': {
    name: "Campus Master",
    mode: 'ENTRAINEMENT',
    difficulty: 7,
    grade: '8a',
    desc: "Force pure, pas de pieds.",
    holds: [
      { x: -0.20, y: 1.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 1.50, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.00, y: 2.60, z: 0.02, type: 'PETITE' },
      { x: 0.00, y: 3.70, z: 0.02, type: 'PETITE' },
      { x: 0.00, y: 4.80, z: 0.02, type: 'BAC', isTop: true }
    ]
  },

  'e7': {
    name: "Techniques Avancées",
    mode: 'ENTRAINEMENT',
    difficulty: 5,
    grade: '6c',
    desc: "Apprenez l'adhérence et le crochetage.",
    holds: [
      { x: -0.20, y: 0.80, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.20, y: 0.80, z: 0.02, type: 'BAC', isStart: true },
      { x: 0.00, y: 1.80, z: 0.02, type: 'PETITE' },
      { x: 0.60, y: 2.50, z: 0.02, type: 'BAC' }, // Heel hook target
      { x: 0.00, y: 4.00, z: 0.02, type: 'BAC', isTop: true }
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
