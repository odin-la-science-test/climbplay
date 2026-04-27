import * as THREE from 'three';
import { LIMBS, LIMB_LABELS, HOLD_TYPES, ARM_REACH, LEG_REACH, RouteGenerator, SKINS, GRADES, CURATED_ROUTES } from './data.js';
import { buildScene, createHoldMesh } from './scene.js';
import { Climber } from './climber.js';
import { getLevel } from './levels.js';

// ============================================================
// PROFILE — Save/Load stats and skins with daily progression
// ============================================================
class Profile {
  constructor() {
    this.xp = 0;
    this.records = { VOIE: 0, BLOC: 0 };
    this.settings = { skinId: 0, sound: false };
    this.displayName = 'Grimpeur';
    this.checkpointsHit = 0;
    this.history = [];
    
    // Daily progression system
    this.dailyStats = {
      lastPlayDate: null,        // Last date played (YYYY-MM-DD)
      consecutiveDays: 0,        // Streak of consecutive days
      totalDaysPlayed: 0,        // Total unique days played
      enduranceBonus: 0,         // Bonus endurance from training (0-100)
      sessionsToday: 0           // Number of sessions today
    };
    
    this.load();
    this.updateDailyStats();
  }
  
  load() {
    try {
      const data = JSON.parse(localStorage.getItem('calcaire_v2_profile'));
      if (data) {
        Object.assign(this, data);
        // Ensure dailyStats exists for old saves
        if (!this.dailyStats) {
          this.dailyStats = {
            lastPlayDate: null,
            consecutiveDays: 0,
            totalDaysPlayed: 0,
            enduranceBonus: 0,
            sessionsToday: 0
          };
        }
      }
    } catch(e) {}
  }
  
  save() {
    localStorage.setItem('calcaire_v2_profile', JSON.stringify(this));
  }
  
  addHistory(entry) {
    this.history.unshift(entry);
    if (this.history.length > 20) this.history.pop();
  }
  
  // Update daily stats and calculate endurance bonus
  updateDailyStats() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (this.dailyStats.lastPlayDate !== today) {
      // New day!
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (this.dailyStats.lastPlayDate === yesterdayStr) {
        // Consecutive day
        this.dailyStats.consecutiveDays++;
      } else if (this.dailyStats.lastPlayDate !== null) {
        // Streak broken
        this.dailyStats.consecutiveDays = 1;
      } else {
        // First day
        this.dailyStats.consecutiveDays = 1;
      }
      
      this.dailyStats.lastPlayDate = today;
      this.dailyStats.totalDaysPlayed++;
      this.dailyStats.sessionsToday = 0;
      
      // Calculate endurance bonus: +2% per consecutive day, max 100%
      this.dailyStats.enduranceBonus = Math.min(100, this.dailyStats.consecutiveDays * 2);
      
      this.save();
    }
  }
  
  // Record a session (called when starting a climb)
  recordSession() {
    this.dailyStats.sessionsToday++;
    this.save();
  }
  
  // Get stamina multiplier based on training
  getStaminaMultiplier() {
    // Base: 1.0, with bonus up to 2.0 (100% more stamina)
    return 1.0 + (this.dailyStats.enduranceBonus / 100);
  }
}

// ============================================================
// GAME ENGINE
// ============================================================
export class Game {
  constructor() {
    this.profile = new Profile();
    this.state = 'MENU'; // MENU, PLAYING, FALLEN
    this.mode = 'VOIE';
    this.difficulty = 1;
    
    // Physics & State
    this.limbHolds = { leftHand: 3, rightHand: 4, leftFoot: 1, rightFoot: 2 };
    this.limbPositions = { 
      leftHand: new THREE.Vector3(), rightHand: new THREE.Vector3(),
      leftFoot: new THREE.Vector3(), rightFoot: new THREE.Vector3() 
    };
    this.fatigue = { leftArm: 0, rightArm: 0 };
    this.stamina = 100;
    this.stress = 0;
    this.activeLimb = null;
    this.selectedRoute = null;
    this.checkpointsHitThisRun = 0;
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.25);
    
    this.init();
  }

  init() {
    const container = document.getElementById('canvas-container');
    container.style.touchAction = 'none'; // CRITICAL: prevents browser from stealing drag on touch devices
    const s = buildScene(container);
    Object.assign(this, s);

    this.climber = new Climber(this.profile.settings.skinId);
    this.scene.add(this.climber.group);
    
    // Hitboxes for limb interaction (invisible)
    this.limbHandles = {};
    LIMBS.forEach(limb => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.20, 8, 8), 
        new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false})
      );
      mesh.userData.limb = limb;
      this.scene.add(mesh);
      this.limbHandles[limb] = mesh;
    });

    this.routeGen = new RouteGenerator();
    this.holdMeshes = [];
    
    // Setup background scene for menu
    this.routeGen.reset('VOIE', 1, false, true);
    this._syncHolds();
    this._syncPositionsFromHolds();
    this.climber.updatePose(
      this.limbPositions.leftHand, this.limbPositions.rightHand,
      this.limbPositions.leftFoot, this.limbPositions.rightFoot
    );
    
    this._setupUI();
    this._bindInput();
    
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this._animate());
    
    // Remove loading screen
    const loader = document.getElementById('loading-screen');
    if (loader) loader.style.display = 'none';
    
    this.showMenu();
  }

  _syncHolds() {
    this.holdGroup.clear();
    this.holdMeshes = [];
    this.routeGen.holds.forEach(h => {
      const mesh = createHoldMesh(h);
      this.holdGroup.add(mesh);
      this.holdMeshes.push(mesh);
    });
  }

  _setupUI() {
    // ── Nav tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.nav-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`panel-${btn.dataset.nav}`).classList.add('active');
        if (btn.dataset.nav === 'profile') this._renderProfilePanel();
      };
    });

    // ── Mode buttons
    this._currentMode = 'BLOC';
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._currentMode = btn.dataset.mode;
        document.getElementById('route-mode-label').textContent = this._currentMode;
        this._renderRouteList();
      };
    });

    // ── Route list init
    this._renderRouteList();

    // ── Skin selector
    const skinGrid = document.getElementById('skin-selector');
    SKINS.forEach(s => {
      const btn = document.createElement('button');
      btn.className = `skin-btn ${s.id === this.profile.settings.skinId ? 'active' : ''}`;
      const colors = document.createElement('div');
      colors.className = 'skin-colors';
      [s.skin, s.top, s.bottom].forEach(c => {
        const dot = document.createElement('div');
        dot.className = 'skin-color';
        dot.style.background = '#' + c.toString(16).padStart(6, '0');
        colors.appendChild(dot);
      });
      const nm = document.createElement('span');
      nm.className = 'skin-name';
      nm.textContent = s.name;
      btn.appendChild(colors); btn.appendChild(nm);
      btn.onclick = () => {
        document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.profile.settings.skinId = s.id;
        this.profile.save();
        this.scene.remove(this.climber.group);
        this.climber = new Climber(s.id);
        this.scene.add(this.climber.group);
        this.climber.updatePose(this.limbPositions.leftHand, this.limbPositions.rightHand, this.limbPositions.leftFoot, this.limbPositions.rightFoot);
      };
      skinGrid.appendChild(btn);
    });

    // ── Launch
    document.getElementById('btn-start-game').onclick = () => {
      if (!this.selectedRoute) return;
      this.start(this.selectedRoute.mode, this.selectedRoute.difficulty, this.selectedRoute.mode === 'INFINI');
    };

    // ── Profile save
    document.getElementById('btn-save-profile').onclick = () => {
      const nm = document.getElementById('input-name').value.trim();
      if (nm) { this.profile.displayName = nm; this.profile.save(); this._renderProfilePanel(); }
    };

    // ── Retry
    document.getElementById('btn-next-climb').onclick = () => this.showMenu();
  }

  _renderRouteList() {
    const list = document.getElementById('route-list');
    list.innerHTML = '';
    const routes = CURATED_ROUTES.filter(r => r.mode === this._currentMode);
    routes.forEach(route => {
      const gradeInfo = Object.values(GRADES).find(g => g.label === route.grade) || { color: '#f97316' };
      const card = document.createElement('div');
      card.className = 'route-card' + (this.selectedRoute?.id === route.id ? ' selected' : '');
      card.innerHTML = `
        <div class="route-card-grade" style="color:${gradeInfo.color}; border-color:${gradeInfo.color}">${route.grade}</div>
        <div class="route-card-info">
          <div class="route-card-name">${route.name}</div>
          <div class="route-card-desc">${route.desc}</div>
        </div>`;
      card.onclick = () => {
        this.selectedRoute = route;
        document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.getElementById('preview-grade').textContent = route.grade;
        document.getElementById('preview-name').textContent = route.name;
        document.getElementById('preview-desc').textContent = route.desc;
        const pct = Math.min(100, (route.difficulty / 9) * 100);
        document.getElementById('diff-bar-fill').style.width = pct + '%';
        document.getElementById('diff-label').textContent = route.name + ' — ' + route.grade;
        document.getElementById('btn-start-game').disabled = false;
      };
      list.appendChild(card);
    });
  }

  _renderProfilePanel() {
    const p = this.profile;
    const initials = p.displayName.substring(0,2).toUpperCase();
    document.getElementById('profile-avatar').textContent = initials;
    document.getElementById('profile-display-name').textContent = p.displayName;
    document.getElementById('input-name').value = p.displayName;
    document.getElementById('stat-xp').textContent = p.xp;
    document.getElementById('stat-voie').textContent = p.records.VOIE.toFixed(1) + 'm';
    document.getElementById('stat-bloc').textContent = p.records.BLOC ? 'TOP ✓' : '—';
    document.getElementById('stat-checkpoints').textContent = p.checkpointsHit;
    const xpLevel = Math.floor(p.xp / 500);
    const xpPct = (p.xp % 500) / 500 * 100;
    document.getElementById('xp-bar-fill').style.width = xpPct + '%';
    document.getElementById('xp-bar-label').textContent = `Niv. ${xpLevel + 1}`;
    
    // Add daily progression stats
    const statsGrid = document.querySelector('.stat-grid');
    if (statsGrid && statsGrid.children.length === 4) {
      // Add endurance stat
      const enduranceBlock = document.createElement('div');
      enduranceBlock.className = 'stat-block';
      enduranceBlock.innerHTML = `
        <div class="stat-val" style="color:var(--green)">+${p.dailyStats.enduranceBonus}%</div>
        <div class="stat-lbl">Endurance</div>
      `;
      statsGrid.appendChild(enduranceBlock);
      
      // Add streak stat
      const streakBlock = document.createElement('div');
      streakBlock.className = 'stat-block';
      streakBlock.innerHTML = `
        <div class="stat-val" style="color:var(--yellow)">${p.dailyStats.consecutiveDays}</div>
        <div class="stat-lbl">Jours consécutifs</div>
      `;
      statsGrid.appendChild(streakBlock);
    }
    
    const hist = document.getElementById('history-list');
    hist.innerHTML = '';
    if (p.history.length === 0) { hist.innerHTML = '<p class="empty-state">Aucune ascension enregistrée.</p>'; return; }
    p.history.slice(0,8).forEach(h => {
      const el = document.createElement('div'); el.className = 'history-item';
      el.innerHTML = `<span>${h.name || 'Voie'}</span><span style="color:var(--accent)">${h.height}m</span><span style="color:var(--green)">+${h.xp} XP</span>`;
      hist.appendChild(el);
    });
  }

  _updateProfileUI() {
    document.getElementById('local-record-voie').textContent = this.profile.records.VOIE.toFixed(1) + 'm';
    document.getElementById('local-record-bloc').textContent = this.profile.records.BLOC === 0 ? 'Aucun' : 'TOP';
    document.getElementById('profile-xp').textContent = this.profile.xp;
  }

  showMenu() {
    this.state = 'MENU';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('basecamp-overlay').style.display = 'none';
    const vEl = document.getElementById('local-record-voie');
    const bEl = document.getElementById('local-record-bloc');
    const xEl = document.getElementById('profile-xp');
    if (vEl) vEl.textContent = this.profile.records.VOIE.toFixed(1) + 'm';
    if (bEl) bEl.textContent = this.profile.records.BLOC ? 'TOP ✓' : '—';
    if (xEl) xEl.textContent = this.profile.xp + ' XP';
  }

  start(mode, difficulty, isInfinite = false) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.isInfinite = isInfinite;
    this.state = 'PLAYING';
    this.checkpointsHitThisRun = 0;

    this.fatigue = { leftArm: 0, rightArm: 0 };
    
    // Apply endurance bonus from daily training
    const staminaMultiplier = this.profile.getStaminaMultiplier();
    this.stamina = 100 * staminaMultiplier;
    this.maxStamina = 100 * staminaMultiplier; // Track max for UI
    
    this.stress = 0;
    this.activeLimb = null;
    
    // Rest system: 3 uses per game, or unlimited in infinite mode (recharges every 5m)
    this.restUsesRemaining = 3;
    this.lastRestHeight = 0; // Track height for infinite mode recharge
    
    // Update mobile button counter
    const restCount = document.getElementById('rest-count');
    if (restCount) restCount.textContent = this.restUsesRemaining;
    
    // Record this session
    this.profile.recordSession();

    this.climber.group.position.set(0, 0, 0);
    this.climber.group.rotation.set(0, 0, 0);

    // Check if this route has a predefined level
    const predefinedLevel = this.selectedRoute?.id ? getLevel(this.selectedRoute.id) : null;
    
    if (predefinedLevel) {
      // Load predefined level with exact hold positions
      this.routeGen.loadPredefinedLevel(predefinedLevel);
    } else {
      // Generate procedural route
      this.routeGen.reset(mode, difficulty, isInfinite, this.selectedRoute?.predefined !== false);
    }
    
    this._syncHolds();

    this.limbHolds = { leftHand: 3, rightHand: 4, leftFoot: 1, rightFoot: 2 };
    
    // Initialize all limb positions (never null)
    LIMBS.forEach(l => {
      if (!this.limbPositions[l]) {
        this.limbPositions[l] = new THREE.Vector3();
      }
    });
    
    this._syncPositionsFromHolds();
    this.climber.updatePose(
      this.limbPositions.leftHand, this.limbPositions.rightHand,
      this.limbPositions.leftFoot, this.limbPositions.rightFoot
    );

    this.camera.position.set(0, 1.5, 2.8);
    this.camera.lookAt(0, 1.5, 0);

    const routeName = this.selectedRoute?.name || mode;
    const routeGrade = this.selectedRoute?.grade || '?';
    const hudName = document.getElementById('hud-route-name');
    const hudGrade = document.getElementById('hud-grade');
    if (hudName) hudName.textContent = routeName;
    if (hudGrade) hudGrade.textContent = routeGrade;

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('basecamp-overlay').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    const badge = document.getElementById('checkpoint-badge');
    if (badge) badge.style.display = 'none';

    this.log('Départ — ' + routeName + ' (' + routeGrade + ')');
  }

  fall(reason) {
    if (this.state === 'FALLEN') return;
    this.state = 'FALLEN';
    this.activeLimb = null;

    const height = Math.max(0, this.climber.parts.torso.position.y);
    const xpGain = Math.floor(height * 10 * this.difficulty + (this.checkpointsHitThisRun || 0) * 50);
    this.profile.xp += xpGain;
    this.profile.checkpointsHit = (this.profile.checkpointsHit || 0) + (this.checkpointsHitThisRun || 0);

    if (this.mode !== 'BLOC' && height > this.profile.records.VOIE) this.profile.records.VOIE = height;
    this.profile.addHistory({ name: this.selectedRoute?.name || this.mode, height: height.toFixed(1), xp: xpGain });
    this.profile.save();

    document.getElementById('hud').style.display = 'none';
    document.getElementById('basecamp-overlay').style.display = 'flex';
    const isWin = reason.includes('TOP') || reason.includes('RELAIS');
    const titleEl = document.getElementById('fall-title');
    if (titleEl) titleEl.textContent = isWin ? '🏆 Bravo !' : '⛺ Camp de Base';
    document.getElementById('fall-reason').textContent = reason;
    document.getElementById('report-height').textContent = height.toFixed(1) + 'm';
    document.getElementById('report-xp').textContent = '+' + xpGain + ' XP';
    const cpEl = document.getElementById('report-checkpoints');
    if (cpEl) cpEl.textContent = this.checkpointsHitThisRun || 0;
    const xpEndEl = document.getElementById('profile-xp-end');
    if (xpEndEl) xpEndEl.textContent = this.profile.xp;
  }

  _bindInput() {
    const rc = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getHit = (e, objects) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      rc.setFromCamera(mouse, this.camera);
      return rc.intersectObjects(objects, true)[0];
    };

    // Grab Limb
    window.addEventListener('pointerdown', e => {
      if (this.state !== 'PLAYING') return;
      const hit = getHit(e, Object.values(this.limbHandles));
      if (hit) {
        this.activeLimb = hit.object.userData.limb;
        document.querySelectorAll('.limb-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-limb="${this.activeLimb}"]`)?.classList.add('active');
        document.body.style.cursor = 'grabbing';
      }
    });

    // Drag Limb
    window.addEventListener('pointermove', e => {
      if (this.state !== 'PLAYING') return;
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      rc.setFromCamera(mouse, this.camera);
      
      if (!this.activeLimb) {
        const hoverHit = rc.intersectObjects(Object.values(this.limbHandles), true)[0];
        document.body.style.cursor = hoverHit ? 'grab' : 'default';
        return;
      }
      
      const hit = rc.ray.intersectPlane(this.dragPlane, new THREE.Vector3());
      if (hit) {
        this.limbPositions[this.activeLimb].copy(hit);
        
        // Try direct raycasting on hold meshes first
        const directHit = rc.intersectObjects(this.holdMeshes, true)[0];
        
        if (directHit && directHit.object.userData.holdId) {
          // Direct hit on a hold mesh - use this!
          const hitHold = this.holdMeshes.find(m => m.userData.holdId === directHit.object.userData.holdId);
          if (this.hoveredHold !== hitHold) {
            if (this.hoveredHold) this.hoveredHold.material.emissive.setHex(0x000000);
            if (hitHold) hitHold.material.emissive.setHex(0x333333);
            this.hoveredHold = hitHold;
          }
        } else {
          // No direct hit - fall back to proximity detection
          let nearest = null;
          let minDist = Infinity;
          
          this.routeGen.holds.forEach(h => {
             const dx = h.x - hit.x;
             const dy = h.y - hit.y;
             
             let d, threshold;
             if (h.type === 'VOLUME') {
               d = Math.sqrt(dx*dx + dy*dy);
               threshold = 0.50;
             } else {
               const dz = (h.z + 0.01) - hit.z;
               d = Math.sqrt(dx*dx + dy*dy + dz*dz);
               threshold = 0.35;
             }
             
             if (d < threshold && d < minDist) { 
               minDist = d; 
               nearest = h; 
             }
          });

          const hitHold = nearest ? this.holdMeshes.find(m => m.userData.holdId === nearest.id) : null;
          if (this.hoveredHold !== hitHold) {
            if (this.hoveredHold) this.hoveredHold.material.emissive.setHex(0x000000);
            if (hitHold) hitHold.material.emissive.setHex(0x333333);
            this.hoveredHold = hitHold;
          }
        }
      }
    });

    // Release Limb (Drop on Hold)
    window.addEventListener('pointerup', e => {
      if (this.state !== 'PLAYING' || !this.activeLimb) return;
      document.body.style.cursor = 'default';
      
      if (this.hoveredHold) {
        const hData = this.hoveredHold.userData;
        if (this._checkKinematics(this.activeLimb, this.hoveredHold.position)) {
          this.limbHolds[this.activeLimb] = hData.holdId;
          this.log(`${LIMB_LABELS[this.activeLimb]} → ${HOLD_TYPES[hData.holdType].label}`);
          
          const routeHold = this.routeGen.holds.find(h => h.id === hData.holdId);
          if (routeHold && routeHold.isTop) {
            const oppArm = this.activeLimb === 'leftHand' ? 'rightHand' : 'leftHand';
            if (this.limbHolds[oppArm] === hData.holdId) {
              if (this.mode === 'BLOC') {
                this.profile.records.BLOC = 1;
                this.fall("TOP ! Bloc réussi !");
              } else {
                this.profile.records.VOIE = Math.max(this.profile.records.VOIE, routeHold.y);
                this.fall("RELAIS ! Voie terminée avec succès !");
              }
            } else {
              this.log("TOP touché ! Amenez l'autre main pour valider.", 'warn');
            }
          } else if (routeHold && routeHold.isCheckpoint) {
            this.checkpointsHitThisRun = (this.checkpointsHitThisRun || 0) + 1;
            this.stamina = Math.min(100, this.stamina + 50);
            this.log('💾 Checkpoint ! Endurance +50', 'ok');
            const badge = document.getElementById('checkpoint-badge');
            if (badge) { badge.style.display = 'inline-block'; setTimeout(() => { badge.style.display = 'none'; }, 3000); }
            this.profile.checkpointsHit = (this.profile.checkpointsHit || 0) + 1;
            this.profile.save();
          }
        } else {
          this.log(`Prise trop loin !`, 'warn');
        }
      } else {
        // Released limb goes back to resting position behind the body
        this.limbHolds[this.activeLimb] = null;
        this.log(`${LIMB_LABELS[this.activeLimb]} relâché(e) - retour au repos`, 'warn');
        
        if (this.limbHolds.leftHand === null && this.limbHolds.rightHand === null) {
          this.fall("Vous avez lâché les deux mains !");
        }
      }
      
      if (this.hoveredHold) this.hoveredHold.material.emissive.setHex(0x000000);
      this.hoveredHold = null;
      this.activeLimb = null;
      this._syncPositionsFromHolds(); // Snap back to holds or resting position
    });

    // Keyboard bindings
    window.addEventListener('keydown', e => {
      if (this.state !== 'PLAYING') return;
      if (e.code === 'KeyR') {
        this._performRest();
      } else if (e.code === 'Space') {
        this._performShake();
      } else if (e.code === 'Escape') {
        this.showMenu();
      }
    });
    
    // Mobile button bindings
    const btnRest = document.getElementById('btn-rest');
    const btnShake = document.getElementById('btn-shake');
    const btnMenu = document.getElementById('btn-menu');
    
    if (btnRest) {
      btnRest.addEventListener('click', () => {
        if (this.state === 'PLAYING') this._performRest();
      });
    }
    
    if (btnShake) {
      btnShake.addEventListener('click', () => {
        if (this.state === 'PLAYING') this._performShake();
      });
    }
    
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        if (this.state === 'PLAYING') this.showMenu();
      });
    }
  }
  
  _performRest() {
    const currentHeight = Math.max(0, this.climber.parts.torso.position.y);
    
    if (this.isInfinite) {
      // Infinite mode: recharge every 5m
      if (currentHeight - this.lastRestHeight >= 5.0) {
        this.restUsesRemaining = 3;
        this.lastRestHeight = currentHeight;
      }
    }
    
    if (this.restUsesRemaining > 0) {
      this.stamina = Math.min(this.maxStamina || 100, this.stamina + 20);
      this.restUsesRemaining--;
      this.log(`Repos (Stamina +20) - ${this.restUsesRemaining} repos restants`);
      
      // Update mobile button counter
      const restCount = document.getElementById('rest-count');
      if (restCount) restCount.textContent = this.restUsesRemaining;
    } else {
      this.log("Plus de repos disponibles !", 'warn');
    }
  }
  
  _performShake() {
    this.fatigue.leftArm = Math.max(0, this.fatigue.leftArm - 15);
    this.fatigue.rightArm = Math.max(0, this.fatigue.rightArm - 15);
    this.log("Secouage des bras !");
  }

  _getHoldPos(id) {
    const h = this.routeGen.holds.find(x => x.id === id);
    if (!h) return new THREE.Vector3();
    
    // For VOLUME holds, position limbs on the front surface, not inside the volume
    // This applies to both hands AND feet for realistic climbing posture
    if (h.type === 'VOLUME') {
      // Volumes are at z=0.05 and can be 0.18-0.32 in size
      // Position all limbs at z=0.20 (in front of the volume surface)
      return new THREE.Vector3(h.x, h.y, 0.20);
    }
    
    // For other holds, use exact position
    return new THREE.Vector3(h.x, h.y, h.z + 0.01);
  }

  _syncPositionsFromHolds() {
    LIMBS.forEach(l => {
      if (this.activeLimb !== l) {
        if (this.limbHolds[l] === null) {
          // Released limb - put it in resting position EXTENDED behind the body
          if (!this.limbPositions[l]) this.limbPositions[l] = new THREE.Vector3();
          
          // Get current body position from torso
          const torso = this.climber?.parts?.torso;
          const torsoX = torso?.position?.x || 0;
          const torsoY = torso?.position?.y || 1.5;
          const torsoZ = torso?.position?.z || 0.2;
          
          const isHand = l.includes('Hand');
          const side = l.includes('left') ? -1 : 1;
          
          if (isHand) {
            // Hands extended down and back (arms hanging straight)
            this.limbPositions[l].set(
              torsoX + side * 0.20,  // Slightly to the side
              torsoY - 0.50,          // Extended down (arm length)
              torsoZ + 0.25           // Behind the body
            );
          } else {
            // Feet extended down and back (legs hanging straight)
            this.limbPositions[l].set(
              torsoX + side * 0.12,  // Slightly to the side
              torsoY - 1.00,          // Extended down (leg length)
              torsoZ + 0.20           // Behind the body
            );
          }
        } else {
          // Attached to hold
          if (!this.limbPositions[l]) this.limbPositions[l] = new THREE.Vector3();
          this.limbPositions[l].copy(this._getHoldPos(this.limbHolds[l]));
        }
      }
    });
  }

  // Prevents impossible moves
  _checkKinematics(limb, newPos) {
    const isArm = limb.includes('Hand');
    const maxReach = isArm ? ARM_REACH * 1.1 : LEG_REACH * 1.1;
    
    // 1. Distance from opposite limb
    const opp = isArm ? (limb === 'leftHand' ? 'rightHand' : 'leftHand') : (limb === 'leftFoot' ? 'rightFoot' : 'leftFoot');
    if (this.limbHolds[opp] !== null) {
      const oppPos = this._getHoldPos(this.limbHolds[opp]);
      if (newPos.distanceTo(oppPos) > maxReach * 2.2) return false;
    }

    // 2. Arms can't go too far above feet
    if (isArm && this.limbHolds.leftFoot !== null && this.limbHolds.rightFoot !== null) {
      const hipY = (this._getHoldPos(this.limbHolds.leftFoot).y + this._getHoldPos(this.limbHolds.rightFoot).y) / 2 + LEG_REACH * 0.8;
      if (newPos.y > hipY + maxReach * 1.6) return false;
    }

    // 3. Feet shouldn't go absurdly higher than hands
    if (!isArm) {
      let maxHandY = -Infinity;
      if (this.limbHolds.leftHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.leftHand).y);
      if (this.limbHolds.rightHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.rightHand).y);
      if (maxHandY !== -Infinity && newPos.y > maxHandY + 0.4) return false;
    }
    
    return true;
  }

  _updateFatigue(dt) {
    if (this.state !== 'PLAYING') return;

    let totalLoad = 0;
    LIMBS.forEach(l => {
      if (this.activeLimb === l || this.limbHolds[l] === null) {
        totalLoad += 2.5; // Hanging limb costs a lot of energy
      } else {
        const hold = this.routeGen.holds.find(h => h.id === this.limbHolds[l]);
        if (hold) totalLoad += HOLD_TYPES[hold.type].fatigue;
      }
    });

    const activeArms = (this.limbHolds.leftHand !== null ? 1 : 0) + (this.limbHolds.rightHand !== null ? 1 : 0);
    const armLoad = totalLoad * (activeArms === 1 ? 0.8 : 0.4); // Double load if hanging by one hand
    
    // Check if feet are hooked high above hands (bat hang / high hook)
    let maxHandY = -Infinity;
    if (this.limbHolds.leftHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.leftHand).y);
    if (this.limbHolds.rightHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.rightHand).y);
    
    let coreStrain = 0;
    if (maxHandY !== -Infinity) {
      if (this.limbHolds.leftFoot !== null) coreStrain += Math.max(0, this._getHoldPos(this.limbHolds.leftFoot).y - maxHandY) * 15;
      if (this.limbHolds.rightFoot !== null) coreStrain += Math.max(0, this._getHoldPos(this.limbHolds.rightFoot).y - maxHandY) * 15;
    }
    
    const finalArmLoad = armLoad + coreStrain;
    
    // Base multiplier reduced from 3.0 to 1.5 to make game last longer than 20 seconds
    if (this.activeLimb !== 'leftHand' && this.limbHolds.leftHand !== null)  this.fatigue.leftArm  += finalArmLoad * dt * 1.5;
    if (this.activeLimb !== 'rightHand' && this.limbHolds.rightHand !== null) this.fatigue.rightArm += finalArmLoad * dt * 1.5;

    this.stamina -= (totalLoad + coreStrain) * dt * 0.15;
    this.stress = Math.min(100, Math.max(this.fatigue.leftArm, this.fatigue.rightArm));

    if (this.fatigue.leftArm > 100 || this.fatigue.rightArm > 100 || this.stamina <= 0) {
      this.fall("Épuisement total. Vous avez lâché prise.");
    }
  }

  _updateHUD() {
    if (this.state !== 'PLAYING') return;
    
    const h = Math.max(0, this.climber.parts.torso.position.y);
    const hStr = h.toFixed(1) + 'm';
    if (this._lastH !== hStr) {
      const el = document.getElementById('current-height');
      if (el) el.textContent = hStr;
      this._lastH = hStr;
    }
    
    if (!this._lastGauges) this._lastGauges = {};
    const setGauge = (id, val) => {
      const intVal = Math.floor(val);
      const cacheKey = id + intVal;
      if (this._lastGauges[id] === cacheKey) return;
      this._lastGauges[id] = cacheKey;

      const el = document.getElementById('gauge-' + id);
      const text = document.getElementById('val-' + id);
      if(!el || !text) return;
      
      // Set CSS variable for circular gauge on mobile
      el.parentElement.style.setProperty('--gauge-value', Math.min(100, val));
      
      // Keep bar gauge for desktop
      el.style.width = Math.min(100, val) + '%';
      text.textContent = intVal + '%';
      el.style.background = val > 80 ? '#ef4444' : (val > 50 ? '#f59e0b' : '#3b82f6');
    };
    
    setGauge('left-arm', this.fatigue.leftArm);
    setGauge('right-arm', this.fatigue.rightArm);
    // Show stamina as percentage of max (accounting for endurance bonus)
    const staminaPct = (Math.max(0, this.stamina) / (this.maxStamina || 100)) * 100;
    setGauge('stamina', staminaPct);
    setGauge('stress', this.stress);
  }

  log(msg, type = 'info') {
    const logEl = document.getElementById('move-log');
    if (!logEl) return;
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.color = type === 'warn' ? '#ef4444' : '#fff';
    logEl.prepend(d);
    if (logEl.children.length > 6) logEl.removeChild(logEl.lastChild);
  }

  _animate() {
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING' || this.state === 'MENU') {
      this.climber.updatePose(
        this.limbPositions.leftHand, this.limbPositions.rightHand,
        this.limbPositions.leftFoot, this.limbPositions.rightFoot
      );

      // Sync invisible hitboxes for clicking limbs
      LIMBS.forEach(l => {
        const partName = l.includes('Hand') ? l : l.replace('Foot', 'Ankle');
        const p = this.climber.parts[partName];
        if (p) this.limbHandles[l].position.copy(p.position);
      });
    }

    if (this.state === 'PLAYING') {
      this._updateFatigue(dt);
      this._updateHUD();

      // Smooth camera follow
      const targetY = this.climber.parts.torso.position.y + 0.4;
      this.camera.position.y += (targetY - this.camera.position.y) * 4 * dt;
      
      // Keep sun relative to camera to preserve shadow quality
      this.sun.position.y = this.camera.position.y + 10;
      this.sun.target.position.y = this.camera.position.y;
      
    } else if (this.state === 'FALLEN') {
      // Simulate falling down
      this.climber.group.position.y -= 9.8 * dt * dt * 50; 
      this.camera.position.y = Math.max(1.5, this.camera.position.y - 8 * dt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Start Game Engine
window.onload = () => new Game();
