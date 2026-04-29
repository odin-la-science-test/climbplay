// ============================================================
// DATA.JS — All game constants, types, skins, route generator
// ============================================================

// ── Hold types ───────────────────────────────────────────────
export const HOLD_TYPES = {
  // Basic holds
  BAC:      { label: 'Bac',      color: 0x00ff9d, fatigue: 0.4,  desc: 'Grande prise confortable',   size: 'large'  },
  REGLETTE: { label: 'Réglette', color: 0x00f2ff, fatigue: 0.9,  desc: 'Prise plate horizontale',    size: 'medium' },
  PINCETTE: { label: 'Pincette', color: 0xff00ff, fatigue: 1.5,  desc: 'Se pince entre les doigts',  size: 'medium' },
  PLAT:     { label: 'Plat',     color: 0x7000ff, fatigue: 2.0,  desc: 'Friction, délicat',           size: 'medium' },
  PETITE:   { label: 'Petite',   color: 0xff0055, fatigue: 2.6,  desc: 'Microscopique, force pure',   size: 'small'  },
  TROU:     { label: 'Mono',     color: 0xffe600, fatigue: 3.0,  desc: 'Un seul doigt, très dur',    size: 'small'  },
  VOLUME:   { label: 'Volume',   color: 0x1e293b, fatigue: 0.3,  desc: 'Grand volume en béton',      size: 'xlarge' },
  RELAIS:   { label: 'Relais',   color: 0xffffff, fatigue: 0.0,  desc: 'Point de sauvegarde',        size: 'medium' },
  
  // Special holds (variations)
  UNSTABLE:  { label: 'Instable',   color: 0xff6b35, fatigue: 1.2,  desc: 'Bouge et peut se détacher',     size: 'medium', special: true },
  TEMPORARY: { label: 'Temporaire', color: 0xffd23f, fatigue: 0.8,  desc: 'Disparaît après un temps',      size: 'medium', special: true },
  SLIPPERY:  { label: 'Glissante',  color: 0x4ecdc4, fatigue: 1.35, desc: 'Augmente la fatigue +50%',      size: 'medium', special: true },
  CRUMBLING: { label: 'Friable',    color: 0xa8763e, fatigue: 1.0,  desc: 'S\'effrite à chaque usage',     size: 'medium', special: true },
  MAGNETIC:  { label: 'Magnétique', color: 0x9b59b6, fatigue: 0.9,  desc: 'Attire ou repousse',            size: 'medium', special: true },
  HOT:       { label: 'Chaude',     color: 0xff4757, fatigue: 1.1,  desc: 'Brûle si trop longtemps',       size: 'medium', special: true },
  ELECTRIC:  { label: 'Électrique', color: 0x00d2ff, fatigue: 1.0,  desc: 'Chocs électriques cycliques',   size: 'medium', special: true },
};

// ── Environmental conditions ─────────────────────────────────
export const ENV_CONDITIONS = {
  WIND:  { label: 'Vent',      icon: '💨', staminaDrain: 1.2, fatigueMult: 1.0,  desc: 'Force latérale, déstabilise' },
  RAIN:  { label: 'Pluie',     icon: '🌧️', staminaDrain: 1.0, fatigueMult: 1.3,  desc: 'Prises glissantes, fatigue accrue' },
  HEAT:  { label: 'Chaleur',   icon: '🔥', staminaDrain: 1.4, fatigueMult: 1.35, desc: 'Épuisement rapide, repos réduit' },
  FOG:   { label: 'Brouillard', icon: '🌫️', staminaDrain: 1.0, fatigueMult: 1.0,  desc: 'Visibilité réduite' },
  NONE:  { label: 'Normal',    icon: '☀️', staminaDrain: 1.0, fatigueMult: 1.0,  desc: 'Conditions normales' },
};

// ── Climbing grades (French system) ─────────────────────────
export const GRADES = {
  1: { label: '4',  name: 'Débutant',    color: '#22c55e' },
  2: { label: '5c', name: 'Initié',      color: '#84cc16' },
  3: { label: '6a', name: 'Confirmé',    color: '#eab308' },
  4: { label: '6b', name: 'Avancé',      color: '#f97316' },
  5: { label: '6c', name: 'Sportif',     color: '#ef4444' },
  6: { label: '7a', name: 'Expert',      color: '#ec4899' },
  7: { label: '7c', name: 'Elite',       color: '#a855f7' },
  8: { label: '8a', name: 'Compétition', color: '#6366f1' },
  9: { label: '8c', name: 'Pro',         color: '#0ea5e9' },
};

// ── Curated named routes ─────────────────────────────────────
export const CURATED_ROUTES = [
  // BLOC PRÉDÉFINI
  { mode:'BLOC', id:'bloc-1', name:"La Dalle Douce",        difficulty:1, grade:'4',  desc:"Première ascension, prises généreuses.", predefined: true },
  { mode:'BLOC', id:'bloc-2', name:"Le Dièdre du Débutant", difficulty:2, grade:'5c', desc:"Quelques réglettes, début de la technique.", predefined: true },
  { mode:'BLOC', id:'bloc-3', name:"La Fissure Traîtresse",  difficulty:3, grade:'6a', desc:"Les premières pincettes apparaissent.", predefined: true },
  { mode:'BLOC', id:'b4', name:"Le Toit du Diable",      difficulty:4, grade:'6c', desc:"Un dévers prononcé, physique exigeant.", predefined: true },
  { mode:'BLOC', id:'b5', name:"L'Araignée Noire",       difficulty:5, grade:'7a', desc:"Mouvements dynamiques, prises microscopiques.", predefined: true },
  { mode:'BLOC', id:'b6', name:"Le Cobra",               difficulty:6, grade:'7c', desc:"Coordination parfaite requise.", predefined: true },
  { mode:'BLOC', id:'b7', name:"Silence (8c)",           difficulty:8, grade:'8c', desc:"Le Graal. Bon courage.", predefined: true },
  
  // NOUVELLES MÉCANIQUES
  { mode:'BLOC', id:'jump-1',  name:"Le Grand Saut",        difficulty:4, grade:'6c', desc:"Testez la propulsion !", predefined: true },
  { mode:'BLOC', id:'swing-1', name:"Le Pendule",          difficulty:3, grade:'6a', desc:"Testez le balancement !", predefined: true },
  { mode:'BLOC', id:'dyno-1',  name:"Le Vol Plané",        difficulty:5, grade:'7a', desc:"Saut massif (Dyno).",    predefined: true },
  { mode:'BLOC', id:'swing-2', name:"L'Horloge",           difficulty:4, grade:'6b', desc:"Coordination de balancement.", predefined: true },
  { mode:'BLOC', id:'no-feet-1', name:"La Traction Pure",  difficulty:6, grade:'7b', desc:"Bras uniquement (No-Feet).",  predefined: true },
  
  // BLOC ALÉATOIRE
  { mode:'BLOC', id:'br1', name:"🎲 Bloc Aléatoire Facile",    difficulty:1, grade:'4',  desc:"Nouveau bloc à chaque fois.", predefined: false },
  { mode:'BLOC', id:'br2', name:"🎲 Bloc Aléatoire Moyen",     difficulty:3, grade:'6a', desc:"Nouveau bloc à chaque fois.", predefined: false },
  { mode:'BLOC', id:'br3', name:"🎲 Bloc Aléatoire Difficile", difficulty:5, grade:'7a', desc:"Nouveau bloc à chaque fois.", predefined: false },
  { mode:'BLOC', id:'br4', name:"🎲 Bloc Aléatoire Extrême",   difficulty:7, grade:'8a', desc:"Nouveau bloc à chaque fois.", predefined: false },
  
  // VOIE PRÉDÉFINIE
  { mode:'VOIE', id:'voie-1', name:"Initiation Falaise",     difficulty:1, grade:'4',  desc:"Voie tracée pour les premières fois.", predefined: true },
  { mode:'VOIE', id:'voie-2', name:"La Couenne Calcaire",    difficulty:2, grade:'5c', desc:"Calcaire typique, bonne adhérence.", predefined: true },
  { mode:'VOIE', id:'v3', name:"Dévers Méditerranéen",   difficulty:3, grade:'6a', desc:"Style sportif, bien équipée.", predefined: true },
  { mode:'VOIE', id:'v4', name:"La Grande Voie",         difficulty:4, grade:'6c', desc:"15 mètres de plaisir intense.", predefined: true },
  { mode:'VOIE', id:'v5', name:"Rêve de Singe",          difficulty:6, grade:'7a', desc:"Sequence de doigts sur faible relief.", predefined: true },
  { mode:'VOIE', id:'v6', name:"Biographie",             difficulty:9, grade:'9a', desc:"La voie la plus dure du monde. Pour les légendes.", predefined: true },
  
  // VOIE ALÉATOIRE
  { mode:'VOIE', id:'vr1', name:"🎲 Voie Aléatoire Facile",    difficulty:1, grade:'4',  desc:"Nouvelle voie à chaque fois.", predefined: false },
  { mode:'VOIE', id:'vr2', name:"🎲 Voie Aléatoire Moyenne",   difficulty:3, grade:'6a', desc:"Nouvelle voie à chaque fois.", predefined: false },
  { mode:'VOIE', id:'vr3', name:"🎲 Voie Aléatoire Difficile", difficulty:5, grade:'7a', desc:"Nouvelle voie à chaque fois.", predefined: false },
  { mode:'VOIE', id:'vr4', name:"🎲 Voie Aléatoire Extrême",   difficulty:7, grade:'8a', desc:"Nouvelle voie à chaque fois.", predefined: false },
  
  // INFINI
  { mode:'INFINI', id:'i1', name:"Mur Sans Fin",         difficulty:2, grade:'5c+', desc:"Grimpe sans limite. Des checkpoints tous les 20m.", predefined: false },
  { mode:'INFINI', id:'i2', name:"L'Infini Expert",      difficulty:5, grade:'7a',  desc:"Le mur sans fin en mode extrême.", predefined: false },
];

// ── Limbs ────────────────────────────────────────────────────
export const LIMBS       = ['leftHand', 'rightHand', 'leftFoot', 'rightFoot'];
export const LIMB_LABELS = {
  leftHand:  'Main G',
  rightHand: 'Main D',
  leftFoot:  'Pied G',
  rightFoot: 'Pied D',
};

// ============================================================
// CHARACTER DIMENSIONS (Elite Athlete Proportions)
// ============================================================
export const ARM_UPPER = 0.22;
export const ARM_LOWER = 0.20;
export const LEG_UPPER = 0.32;
export const LEG_LOWER = 0.30;

export const ARM_REACH = ARM_UPPER + ARM_LOWER;
export const LEG_REACH = LEG_UPPER + LEG_LOWER;

// ── Skins ────────────────────────────────────────────────────
export const SKINS = [
  { id: 0, name: 'Classique',     skin: 0xf5cba7, top: 0x3b82f6, bottom: 0x1e293b },
  { id: 1, name: 'Torse Nu',      skin: 0xf0a899, top: 0xf0a899, bottom: 0x0f172a },
  { id: 2, name: 'Rouge Compète', skin: 0xd4d4d8, top: 0xef4444, bottom: 0x18181b },
  { id: 3, name: 'Grimp\' Nuit',  skin: 0xa1a1aa, top: 0x27272a, bottom: 0x09090b },
  { id: 4, name: 'Bûcheron',      skin: 0xf5cba7, top: 0xb91c1c, bottom: 0x064e3b },
  { id: 5, name: 'Vif d\'Or',     skin: 0xfef08a, top: 0xfacc15, bottom: 0xa16207 },
  { id: 6, name: 'Lézard Vert',   skin: 0x86efac, top: 0x22c55e, bottom: 0x14532d },
  { id: 7, name: 'Glace',         skin: 0xe0f2fe, top: 0x38bdf8, bottom: 0x0284c7 },
  { id: 8, name: 'Urbain',        skin: 0xe4e4e7, top: 0x52525b, bottom: 0x3f3f46 },
  { id: 9, name: 'Sunset',        skin: 0xffedd5, top: 0xf97316, bottom: 0x831843 },
];

// ── Route Generator ──────────────────────────────────────────
export class RouteGenerator {
  constructor() {
    this.holds = [];
    this._nextId = 1;
    this.mode = 'VOIE';
    this.topY = 0;
    this.seed = 0;
    this.rng = Math.random; // Default to Math.random
  }
  
  // Seeded random number generator for reproducible routes
  _seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Load a predefined level with exact hold positions
  loadPredefinedLevel(level) {
    this.holds = [];
    this._nextId = 1;
    this.mode = level.mode;
    this.isInfinite = false;
    
    // Load all holds from the predefined level
    level.holds.forEach(hold => {
      this._add(
        hold.x, 
        hold.y, 
        hold.z, 
        hold.type, 
        HOLD_TYPES[hold.type].label, 
        hold.isStart || false, 
        hold.isTop || false, 
        hold.isCheckpoint || false
      );
    });
    
    // Set topY to the highest hold
    const topHold = level.holds.find(h => h.isTop);
    this.topY = topHold ? topHold.y : level.holds[level.holds.length - 1].y;
  }

  reset(mode, difficulty, isInfinite = false, useSeed = true) {
    this.holds = [];
    this._nextId = 1;
    this.mode = mode;
    this.isInfinite = isInfinite;
    
    // Use seed for predefined routes, random for random mode
    if (useSeed) {
      this.seed = mode.charCodeAt(0) * 1000 + difficulty * 100;
      this.rng = () => this._seededRandom();
    } else {
      this.rng = Math.random;
    }

    // Four guaranteed starting holds
    this._add(-0.22, 0.50, 0.02, 'BAC', 'Départ G', true, false);  // id 1 → leftFoot
    this._add( 0.22, 0.50, 0.02, 'BAC', 'Départ D', true, false);  // id 2 → rightFoot
    this._add(-0.22, 1.10, 0.02, 'BAC', 'Main G', true, false);    // id 3 → leftHand
    this._add( 0.22, 1.10, 0.02, 'BAC', 'Main D', true, false);    // id 4 → rightHand

    const height = isInfinite ? 2000 : (mode === 'BLOC' ? 5.0 : 15.0);
    this.generateChunk(1.6, height, difficulty, isInfinite, mode);

    if (!isInfinite) {
      const lastHold = this.holds[this.holds.length - 1];
      const lastY = lastHold.y;
      const lastX = lastHold.x;
      const topLabel = mode === 'BLOC' ? 'TOP BLOC' : 'RELAIS FINAL';
      this._add(lastX, lastY + 0.8, 0.02, 'BAC', topLabel, false, true);
      this.topY = lastY + 0.8;
    }
  }

  _add(x, y, z, type, name, isStart = false, isTop = false, isCheckpoint = false) {
    this.holds.push({ id: this._nextId++, x, y, z, type, name, isStart, isTop, isCheckpoint });
  }

  generateChunk(yFrom, yTo, difficulty, addCheckpoints = false, mode = 'VOIE') {
    const pools = {
      1: ['BAC','BAC','BAC','REGLETTE','VOLUME'],
      2: ['BAC','REGLETTE','REGLETTE','VOLUME'],
      3: ['REGLETTE','PINCETTE','PINCETTE','VOLUME'],
      4: ['REGLETTE','PINCETTE','PLAT','PLAT'],
      5: ['PINCETTE','PLAT','PETITE','PETITE'],
      6: ['PLAT','PETITE','TROU','PETITE'],
      7: ['PETITE','TROU','TROU','PLAT'],
      8: ['TROU','TROU','PETITE','PETITE'],
      9: ['TROU','TROU','TROU','PETITE'],
    };
    
    // Special holds pools based on difficulty
    const specialPools = {
      1: [],
      2: ['SLIPPERY'],
      3: ['SLIPPERY', 'UNSTABLE'],
      4: ['SLIPPERY', 'UNSTABLE', 'CRUMBLING'],
      5: ['SLIPPERY', 'UNSTABLE', 'CRUMBLING', 'HOT'],
      6: ['SLIPPERY', 'UNSTABLE', 'CRUMBLING', 'HOT', 'MAGNETIC'],
      7: ['SLIPPERY', 'UNSTABLE', 'CRUMBLING', 'HOT', 'MAGNETIC', 'TEMPORARY'],
      8: ['SLIPPERY', 'UNSTABLE', 'CRUMBLING', 'HOT', 'MAGNETIC', 'TEMPORARY', 'ELECTRIC'],
      9: ['SLIPPERY', 'UNSTABLE', 'CRUMBLING', 'HOT', 'MAGNETIC', 'TEMPORARY', 'ELECTRIC'],
    };
    
    const pool  = pools[Math.min(9, Math.max(1, difficulty))];
    const specialPool = specialPools[Math.min(9, Math.max(1, difficulty))];
    const count = Math.round((yTo - yFrom) * 4.0);
    const stepY = (yTo - yFrom) / Math.max(count, 1);
    
    let pathX = 0; // The central line of the route
    let lastHoldX = 0;
    let lastHoldY = yFrom;

    for (let i = 0; i < count; i++) {
      const y = yFrom + i * stepY + (this.rng() - 0.5) * stepY * 0.5;
      
      // ZIGZAG HORIZONTAL: Make route go left-right more aggressively on higher difficulties
      const zigzagIntensity = Math.min(1.5, difficulty * 0.15); // 0 to 1.5
      pathX += (this.rng() - 0.5) * (mode === 'BLOC' ? 1.2 : 0.6) * zigzagIntensity;
      pathX = Math.max(-2.5, Math.min(2.5, pathX)); // Wider range for zigzag
      
      const x = pathX + (this.rng() - 0.5) * 0.8;
      
      let type = pool[Math.floor(this.rng() * pool.length)];

      // Sprinkle volumes on the sides of the path
      if (type === 'VOLUME') {
        const side = this.rng() < 0.5 ? -0.8 : 0.8;
        this._add(side * (0.7 + this.rng() * 0.4), y, 0.01, 'VOLUME', 'Volume');
        continue;
      }
      
      // FORCED 3-LIMB SECTIONS: On high difficulty, create gaps that require releasing a limb
      const shouldCreateGap = difficulty >= 5 && this.rng() < 0.15; // 15% chance on diff 5+
      
      if (shouldCreateGap && i > 5) {
        // Create a horizontal traverse that's too wide for 4 limbs
        const gapDirection = this.rng() < 0.5 ? -1 : 1;
        const gapDistance = 1.2 + this.rng() * 0.8; // 1.2-2.0m horizontal gap
        
        // First hold of the gap
        this._add(lastHoldX, lastHoldY + 0.3, 0.02, 'REGLETTE', '⚠️ Traverse');
        
        // Middle hold (far away, requires releasing a limb)
        const gapX = lastHoldX + (gapDistance * gapDirection);
        this._add(gapX, lastHoldY + 0.4, 0.02, 'PINCETTE', '⚠️ Dyno');
        
        // Exit hold
        this._add(gapX + (0.3 * gapDirection), lastHoldY + 0.8, 0.02, 'BAC', 'Repos');
        
        lastHoldX = gapX + (0.3 * gapDirection);
        lastHoldY = lastHoldY + 0.8;
        pathX = lastHoldX;
        
        i += 2; // Skip ahead since we added 3 holds
        continue;
      }
      
      // OVERHANG SECTIONS: Create roof sections on high difficulty
      const shouldCreateOverhang = difficulty >= 6 && this.rng() < 0.12; // 12% chance on diff 6+
      
      if (shouldCreateOverhang && i > 5) {
        // Create a roof/overhang section (horizontal ceiling)
        const overhangLength = 3 + Math.floor(this.rng() * 3); // 3-5 holds
        
        for (let oh = 0; oh < overhangLength; oh++) {
          const ohX = lastHoldX + (oh * 0.4 * (this.rng() < 0.5 ? -1 : 1));
          const ohY = lastHoldY + (oh * 0.15); // Slight upward progression
          this._add(ohX, ohY, 0.02, oh === 0 ? 'BAC' : (oh === overhangLength - 1 ? 'BAC' : 'REGLETTE'), 
                    oh === 0 ? '🔺 Dévers' : (oh === overhangLength - 1 ? '🔺 Sortie' : '🔺 Toit'));
        }
        
        lastHoldX = lastHoldX + ((overhangLength - 1) * 0.4 * (this.rng() < 0.5 ? -1 : 1));
        lastHoldY = lastHoldY + ((overhangLength - 1) * 0.15);
        pathX = lastHoldX;
        
        i += overhangLength - 1;
        continue;
      }
      
      // Add special holds based on difficulty (keep 60% normal holds minimum)
      if (specialPool.length > 0 && this.rng() < 0.4) {
        type = specialPool[Math.floor(this.rng() * specialPool.length)];
      }

      const ht = HOLD_TYPES[type];
      const hold = this._add(x, y, 0.02, type, ht.label + ' #' + this._nextId);
      
      lastHoldX = x;
      lastHoldY = y;
      
      // Add special properties to special holds
      if (ht.special) {
        const lastHold = this.holds[this.holds.length - 1];
        
        switch(type) {
          case 'UNSTABLE':
            lastHold.unstableTimer = 0;
            lastHold.unstableThreshold = 3 + this.rng() * 3; // 3-6 seconds
            break;
          case 'TEMPORARY':
            lastHold.lifetime = 8 + this.rng() * 4; // 8-12 seconds
            lastHold.maxLifetime = lastHold.lifetime;
            break;
          case 'CRUMBLING':
            lastHold.durability = 2 + Math.floor(this.rng() * 2); // 2-3 uses
            lastHold.maxDurability = lastHold.durability;
            break;
          case 'HOT':
            lastHold.hotTimer = 0;
            lastHold.hotThreshold = 2 + this.rng() * 2; // 2-4 seconds tolerance
            break;
          case 'MAGNETIC':
            lastHold.magneticPolarity = this.rng() < 0.5 ? 'attract' : 'repel';
            break;
          case 'ELECTRIC':
            lastHold.electricCycle = 0;
            lastHold.electricPeriod = 3 + this.rng() * 2; // 3-5 seconds cycle
            lastHold.electricActive = false;
            break;
        }
      }

      // Checkpoint every 20m
      if (addCheckpoints && Math.floor(y / 20) > Math.floor((y - stepY) / 20)) {
        this._add(0, y + 0.3, 0.02, 'RELAIS', `Relais ${Math.floor(y/20)*20}m`, false, false, true);
      }
    }
  }
}
