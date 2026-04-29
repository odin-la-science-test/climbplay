import * as THREE from 'three';
import { LIMBS, LIMB_LABELS, HOLD_TYPES, ARM_REACH, LEG_REACH, RouteGenerator, SKINS, GRADES, CURATED_ROUTES, ENV_CONDITIONS } from './data.js';
import { buildScene, createHoldMesh } from './scene.js';
import { Climber } from './climber.js';
import { getLevel } from './levels.js';

// ============================================================
// PROFILE — Save/Load stats and skins with daily progression
// ============================================================
/**
 * PROFILE — Individual user data and logic
 */
class Profile {
  constructor(data = {}) {
    this.name = data.name || 'Grimpeur';
    this.xp = data.xp || 0;
    this.records = data.records || { VOIE: 0, BLOC: 0 };
    this.completedRoutes = data.completedRoutes || []; // Array of route IDs
    this.settings = data.settings || { skinId: 'climber-default', swingEnabled: true };
    this.checkpointsHit = data.checkpointsHit || 0;
    this.history = data.history || [];
    this.dailyStats = data.dailyStats || {
      lastPlayDate: null,
      consecutiveDays: 0,
      totalDaysPlayed: 0,
      enduranceBonus: 0,
      sessionsToday: 0
    };
    
    this.updateDailyStats();
  }

  // Get display name for UI
  get displayName() { return this.name; }

  save(manager) {
    if (manager) manager.save();
  }

  addHistory(entry) {
    this.history = this.history || [];
    this.history.unshift(entry);
    if (this.history.length > 20) this.history.pop();
  }

  updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    if (this.dailyStats.lastPlayDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (this.dailyStats.lastPlayDate === yesterdayStr) this.dailyStats.consecutiveDays++;
      else if (this.dailyStats.lastPlayDate !== null) this.dailyStats.consecutiveDays = 1;
      else this.dailyStats.consecutiveDays = 1;
      
      this.dailyStats.lastPlayDate = today;
      this.dailyStats.totalDaysPlayed++;
      this.dailyStats.sessionsToday = 0;
      this.dailyStats.enduranceBonus = Math.min(100, this.dailyStats.consecutiveDays * 2);
    }
  }

  recordSession() {
    this.dailyStats.sessionsToday++;
  }

  getStaminaMultiplier() {
    return 1.0 + (this.dailyStats.enduranceBonus / 100);
  }
}

/**
 * PROFILE MANAGER — Handles multiple user profiles
 */
class ProfileManager {
  constructor() {
    const rawProfiles = JSON.parse(localStorage.getItem('climbplay_profiles') || '{}');
    this.profiles = {};
    Object.keys(rawProfiles).forEach(name => {
      this.profiles[name] = new Profile(rawProfiles[name]);
    });

    this.currentName = localStorage.getItem('climbplay_current_user') || null;
    this.current = null;
    this.onProfileLoaded = null;

    // Migrate old profile if exists
    const oldData = localStorage.getItem('calcaire_v2_profile');
    if (oldData && Object.keys(this.profiles).length === 0) {
      const parsed = JSON.parse(oldData);
      const name = parsed.displayName || 'Grimpeur_1';
      this.profiles[name] = new Profile({ name, ...parsed });
      localStorage.removeItem('calcaire_v2_profile');
      this.save();
    }

    this._initUI();
  }

  _initUI() {
    const list = document.getElementById('profile-list');
    const createBtn = document.getElementById('create-profile-btn');
    const nameInput = document.getElementById('new-profile-name');
    const overlay = document.getElementById('auth-overlay');

    const refreshList = () => {
      list.innerHTML = '';
      Object.keys(this.profiles).forEach(name => {
        const div = document.createElement('div');
        div.className = 'profile-item';
        div.innerHTML = `<span>👤 ${name}</span> <span style="font-size: 0.8rem; opacity: 0.6;">${this.profiles[name].records.BLOC} blocs</span>`;
        div.onclick = () => select(name);
        list.appendChild(div);
      });
    };

    const select = (name) => {
      this.currentName = name;
      this.current = this.profiles[name];
      this.current.updateDailyStats();
      localStorage.setItem('climbplay_current_user', name);
      
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      
      setTimeout(() => {
        overlay.style.display = 'none';
        if (this.onProfileLoaded) this.onProfileLoaded();
      }, 500);
    };

    createBtn.onclick = () => {
      const name = nameInput.value.trim();
      if (!name) return;
      if (this.profiles[name]) { alert('Ce profil existe déjà !'); return; }
      
      this.profiles[name] = new Profile({ name });
      this.save();
      select(name);
    };

    refreshList();
  }

  save() {
    localStorage.setItem('climbplay_profiles', JSON.stringify(this.profiles));
  }

  getGymRecord(routeId) {
    const finishers = [];
    Object.values(this.profiles).forEach(p => {
      if (p.completedRoutes && p.completedRoutes.includes(routeId)) {
        finishers.push(p.name);
      }
    });
    return finishers;
  }
}


// ============================================================
// GAME ENGINE
// ============================================================
export class Game {
  constructor() {
    this.state = 'MENU'; // MENU, PLAYING, FALLING, SUCCESS
    this.mode = 'VOIE';
    this.difficulty = 1;
    
    // Physics & State
    this.limbHolds = { leftHand: 3, rightHand: 4, leftFoot: 1, rightFoot: 2 };
    this.limbPositions = { 
      leftHand: new THREE.Vector3(), rightHand: new THREE.Vector3(),
      leftFoot: new THREE.Vector3(), rightFoot: new THREE.Vector3() 
    };
    this.stamina = 100;
    this.stress = 0;
    this.activeLimb = null;
    this.selectedRoute = null;
    this.checkpointsHitThisRun = 0;
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.25);
    
    // Environmental conditions
    this.currentCondition = 'NONE';
    this.conditionIntensity = 1.0;

    // Physics
    this.bodyOffset = new THREE.Vector3(0, 0, 0);
    this.bodyVelocity = new THREE.Vector3(0, 0, 0);
    this.isDraggingTorso = false;
    this.mouseWorld = new THREE.Vector3();
    
    // Multi-Profile Support
    this.profileManager = new ProfileManager();
    this.profileManager.onProfileLoaded = () => {
      this.profile = this.profileManager.current;
      this.init();
    };
  }

  init() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    container.style.touchAction = 'none';
    const s = buildScene(container);
    Object.assign(this, s);

    this.climber = new Climber(this.profile.settings.skinId);
    this.scene.add(this.climber.group);
    
    // Wait for climber model to load
    this.climber.onLoadCallback = () => {
      this._finishInit();
    };
    
    if (this.climber.isLoaded) {
      this._finishInit();
    }
  }
  
  _finishInit() {
    // Hitboxes for limb interaction
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
    
    // ── CRASHPAD (Starting Ground)
    const padGroup = new THREE.Group();
    // Main pad
    const mainPad = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.4, 3),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.9 })
    );
    mainPad.receiveShadow = true;
    mainPad.castShadow = true;
    padGroup.add(mainPad);
    // Border
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.38, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    border.position.y = -0.02;
    padGroup.add(border);
    // Side pads
    const side1 = mainPad.clone(); side1.scale.set(0.4, 1, 0.8); side1.position.set(-4, 0, 0); side1.material = side1.material.clone(); side1.material.color.set(0x334155); padGroup.add(side1);
    const side2 = side1.clone(); side2.position.set(4, 0, 0); padGroup.add(side2);
    
    padGroup.position.set(0, -0.2, 0.5);
    this.scene.add(padGroup);
    this.crashpad = padGroup;
    
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
    // Logout handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem('climbplay_current_user');
        window.location.reload();
      };
    }
    // ── Theme Toggle
    this._initTheme();
    
    console.log('[DEBUG] Setting up theme buttons...');
    
    // Theme selector buttons in profile
    document.querySelectorAll('.theme-btn').forEach(btn => {
      console.log('[DEBUG] Found theme button:', btn.dataset.theme);
      btn.onclick = () => {
        const theme = btn.dataset.theme;
        console.log('[DEBUG] Theme button clicked:', theme);
        this._setTheme(theme);
      };
    });
    
    // ── Nav tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.dataset.target;
        if (!targetId) return;
        
        // Hide all views and backgrounds
        document.querySelectorAll('.scroll-view').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.fullscreen-bg').forEach(b => b.style.display = 'none');
        
        // Show selected view and background
        document.getElementById(targetId).style.display = 'flex';
        const bgId = targetId === 'view-profile' ? 'bg-profile' : 'bg-home';
        const bgEl = document.getElementById(bgId);
        if (bgEl) bgEl.style.display = 'block';
        
        // Update active class on all nav buttons matching this target
        document.querySelectorAll('.nav-btn').forEach(b => {
          if (b.dataset.target === targetId) b.classList.add('active');
          else b.classList.remove('active');
        });
        
        if (targetId === 'view-profile') this._renderProfilePanel();
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
      
      // Show Map Loading Screen
      const mapLoader = document.getElementById('map-loading-screen');
      const mapFill = document.querySelector('.map-loader-fill');
      
      // Hide home view and background
      document.getElementById('view-home').style.display = 'none';
      document.getElementById('bg-home').style.display = 'none';
      
      if (mapLoader && mapFill) {
        mapLoader.style.display = 'flex';
        mapFill.style.transition = 'none';
        mapFill.style.width = '0%';
        
        // Simulate loading time
        setTimeout(() => { mapFill.style.transition = 'width 1.5s ease-out'; mapFill.style.width = '100%'; }, 50);
        
        setTimeout(() => {
          mapLoader.style.opacity = '0';
          setTimeout(() => {
            mapLoader.style.display = 'none';
            mapLoader.style.opacity = '1';
            this.start(this.selectedRoute.mode, this.selectedRoute.difficulty, this.selectedRoute.mode === 'INFINI');
          }, 500);
        }, 1500);
      } else {
        this.start(this.selectedRoute.mode, this.selectedRoute.difficulty, this.selectedRoute.mode === 'INFINI');
      }
    };

    // ── Profile save
    document.getElementById('btn-save-profile').onclick = () => {
      const nm = document.getElementById('input-name').value.trim();
      if (nm) { this.profile.name = nm; this.profileManager.save(); this._renderProfilePanel(); }
    };

    // ── Swing Toggle
    const swingToggle = document.getElementById('toggle-swing');
    if (swingToggle) {
      swingToggle.onchange = () => {
        this.profile.settings.swingEnabled = swingToggle.checked;
        this.profileManager.save();
        this.log(this.profile.settings.swingEnabled ? "Balancier activé" : "Balancier désactivé", 'info');
      };
    }

    // ── Retry
    document.getElementById('btn-next-climb').onclick = () => this.showMenu();
  }

  _renderRouteList() {
    const list = document.getElementById('route-list');
    list.innerHTML = '';
    
    // Get current week of year for rotation (1-52)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const currentWeek = Math.floor(diff / oneWeek) + 1;
    const rotationIndex = (currentWeek % 4) + 1; // We have 4 rotation slots

    const routes = CURATED_ROUTES.filter(r => {
      if (r.mode !== this._currentMode) return false;
      if (r.permanent) return true;
      if (r.rotation) return r.rotation === rotationIndex;
      return true; // Random routes etc
    });
    
    routes.forEach(route => {
      const gradeInfo = Object.values(GRADES).find(g => g.label === route.grade) || { color: '#f97316' };
      const finishers = this.profileManager.getGymRecord(route.id);
      const isCompletedByMe = this.profile.completedRoutes?.includes(route.id);
      
      const card = document.createElement('div');
      card.className = 'route-card' + (this.selectedRoute?.id === route.id ? ' selected' : '');
      
      let finishersHTML = '';
      if (finishers.length > 0) {
        const others = finishers.filter(n => n !== this.profile.name);
        if (others.length > 0) {
          finishersHTML = `<div class="gym-record">🏆 ${others.join(', ')}</div>`;
        }
      }

      card.innerHTML = `
        <div class="route-card-grade" style="color:${gradeInfo.color}; border-color:${gradeInfo.color}">${route.grade}</div>
        <div class="route-card-info">
          <div class="route-card-name">
            ${route.name} 
            ${isCompletedByMe ? '<span class="top-badge">TOP ✓</span>' : ''}
          </div>
          <div class="route-card-desc">${route.desc}</div>
          ${finishersHTML}
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
  
  // ── Theme Management
  _initTheme() {
    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('chalk_it_theme') || 'dark';
    console.log('[DEBUG] Initializing theme:', savedTheme);
    this._setTheme(savedTheme);
  }
  
  _setTheme(theme) {
    console.log('[DEBUG] Setting theme to:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chalk_it_theme', theme);
    
    console.log('[DEBUG] Current data-theme attribute:', document.documentElement.getAttribute('data-theme'));
    
    // Update active state on theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      if (btn.dataset.theme === theme) {
        btn.classList.add('active');
        console.log('[DEBUG] Activated button:', theme);
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  _toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this._setTheme(newTheme);
  }
  
  _updateThemeIcon(theme) {
    const icons = document.querySelectorAll('#theme-toggle, #theme-toggle-profile');
    icons.forEach(icon => {
      if (icon) {
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
      }
    });
  }

  _renderProfilePanel() {
    const p = this.profile;
    const initials = p.displayName.substring(0,2).toUpperCase();
    document.getElementById('profile-avatar').textContent = initials;
    document.getElementById('profile-display-name').textContent = p.displayName;
    document.getElementById('input-name').value = p.displayName;
    
    // Sync swing toggle
    const swingToggle = document.getElementById('toggle-swing');
    if (swingToggle) swingToggle.checked = p.settings.swingEnabled !== false;
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
    // Hide game HUD and Overlays
    document.getElementById('hud').style.display = 'none';
    document.getElementById('basecamp-overlay').style.display = 'none';
    
    // Show Home View and Background
    document.querySelectorAll('.scroll-view').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.fullscreen-bg').forEach(b => b.style.display = 'none');
    
    const viewHome = document.getElementById('view-home');
    const bgHome = document.getElementById('bg-home');
    if (viewHome) viewHome.style.display = 'flex';
    if (bgHome) bgHome.style.display = 'block';
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(b => {
      if (b.dataset.target === 'view-home') b.classList.add('active');
      else b.classList.remove('active');
    });

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
    this._hasLanded = false;

    this.stamina = 100;
    
    // Apply endurance bonus from daily training
    const staminaMultiplier = this.profile.getStaminaMultiplier();
    this.stamina = 100 * staminaMultiplier;
    this.maxStamina = 100 * staminaMultiplier; // Track max for UI
    
    this.stress = 0;
    this.activeLimb = null;
    this.isJumping = false;
    this.bodyOffset.set(0, 0, 0);
    this.bodyVelocity.set(0, 0, 0);
    
    // Rest system: 3 uses per game, or unlimited in infinite mode (recharges every 5m)
    this.restUsesRemaining = 3;
    this.lastRestHeight = 0; // Track height for infinite mode recharge
    
    // Update mobile button counter
    const restCount = document.getElementById('rest-count');
    if (restCount) restCount.textContent = this.restUsesRemaining;
    
    // Record this session
    this.profile.recordSession();
    
    // Select environmental condition based on difficulty
    const conditionChance = Math.min(0.7, difficulty * 0.1); // 10% per difficulty level, max 70%
    if (Math.random() < conditionChance && (mode === 'VOIE' || mode === 'INFINI')) {
      const conditions = ['WIND', 'RAIN', 'HEAT', 'FOG'];
      this.currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const cond = ENV_CONDITIONS[this.currentCondition];
      this.log(`${cond.icon} Condition: ${cond.label}`, 'warn');
    } else {
      this.currentCondition = 'NONE';
    }

    this.climber.group.position.set(0, 0, 0);
    this.climber.group.rotation.set(0, 0, 0);

    // Check if this route has a predefined level
    const predefinedLevel = this.selectedRoute?.id ? getLevel(this.selectedRoute.id) : null;
    
    if (predefinedLevel) {
      // Load predefined level with exact hold positions
      this.routeGen.loadPredefinedLevel(predefinedLevel);
    } else {
      // Generate route
      this.routeGen.reset(mode, difficulty, isInfinite, this.selectedRoute?.predefined !== false);
    }
    
    this._syncHolds();

    // ── TUTORIAL SYSTEM
    const TUTORIALS = {
      'e2': {
        title: "Le Balancement",
        icon: "↔️",
        msg: "Cliquez et <b>glissez votre torse</b> latéralement pour déplacer votre centre de gravité et atteindre des prises lointaines."
      }
    };

    const tut = TUTORIALS[this.selectedRoute?.id];
    if (tut) {
      const overlay = document.getElementById('tutorial-overlay');
      if (overlay) {
        document.getElementById('tut-title').textContent = tut.title;
        document.getElementById('tut-icon').textContent = tut.icon;
        document.getElementById('tut-msg').innerHTML = tut.msg;
        overlay.style.display = 'flex';
        overlay.classList.remove('hidden');
        
        const closeTut = (e) => {
          if (e) e.stopPropagation();
          overlay.classList.add('hidden');
          setTimeout(() => overlay.style.display = 'none', 300);
          window.removeEventListener('pointerdown', closeTut);
          window.removeEventListener('keydown', closeTut);
        };
        window.addEventListener('pointerdown', closeTut);
        window.addEventListener('keydown', closeTut);
      }
    }

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

    // Hide any menus left over
    document.querySelectorAll('.scroll-view').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.fullscreen-bg').forEach(b => b.style.display = 'none');
    const basecamp = document.getElementById('basecamp-overlay');
    if (basecamp) basecamp.style.display = 'none';
    
    document.getElementById('hud').style.display = 'block';
    const badge = document.getElementById('checkpoint-badge');
    if (badge) badge.style.display = 'none';

    this.log('Départ — ' + routeName + ' (' + routeGrade + ')');
  }

  fall(reason) {
    if (this.state === 'FALLEN') return;
    this.state = 'FALLEN';
    this.activeLimb = null;

    // Get height from torso or glbModel
    let height = 0;
    if (this.climber.glbModel) {
      height = Math.max(0, this.climber.glbModel.position.y);
    } else if (this.climber.parts && this.climber.parts.torso) {
      height = Math.max(0, this.climber.parts.torso.position.y);
    }
    
    const xpGain = Math.floor(height * 10 * this.difficulty + (this.checkpointsHitThisRun || 0) * 50);
    this.profile.xp += xpGain;
    this.profile.checkpointsHit = (this.profile.checkpointsHit || 0) + (this.checkpointsHitThisRun || 0);

    const isWin = reason.includes('TOP') || reason.includes('RELAIS');
    if (isWin && this.selectedRoute) {
      if (!this.profile.completedRoutes) this.profile.completedRoutes = [];
      if (!this.profile.completedRoutes.includes(this.selectedRoute.id)) {
        this.profile.completedRoutes.push(this.selectedRoute.id);
        if (this.mode === 'BLOC') this.profile.records.BLOC = (this.profile.records.BLOC || 0) + 1;
      }
    }

    if (this.mode !== 'BLOC' && height > this.profile.records.VOIE) this.profile.records.VOIE = height;
    this.profile.addHistory({ name: this.selectedRoute?.name || this.mode, height: height.toFixed(1), xp: xpGain });
    this.profileManager.save();

    document.getElementById('hud').style.display = 'none';
    document.getElementById('basecamp-overlay').style.display = 'flex';
    
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

    // Grab Limb or Torso
    window.addEventListener('pointerdown', e => {
      if (this.state !== 'PLAYING') return;
      
      const objectsToCheck = [...Object.values(this.limbHandles)];
      if (this.climber.parts.torso) objectsToCheck.push(this.climber.parts.torso);
      
      const hit = getHit(e, objectsToCheck);
      if (hit) {
        if (hit.object.userData.limb) {
          this.activeLimb = hit.object.userData.limb;
          this.isDraggingTorso = false;
        } else if (this.profile.settings.swingEnabled !== false) {
          this.isDraggingTorso = true;
          this.activeLimb = null;
        }
        
        document.querySelectorAll('.limb-btn').forEach(b => b.classList.remove('active'));
        if (this.activeLimb) document.querySelector(`[data-limb="${this.activeLimb}"]`)?.classList.add('active');
        document.body.style.cursor = 'grabbing';
      }
    });

    // Drag Limb or Torso
    window.addEventListener('pointermove', e => {
      if (this.state !== 'PLAYING') return;
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      rc.setFromCamera(mouse, this.camera);
      
      const hit = rc.ray.intersectPlane(this.dragPlane, new THREE.Vector3());
      if (hit) this.mouseWorld = hit;
      
      if (!this.activeLimb && !this.isDraggingTorso) {
        const objectsToHover = [...Object.values(this.limbHandles)];
        if (this.climber.parts.torso) objectsToHover.push(this.climber.parts.torso);
        const hoverHit = rc.intersectObjects(objectsToHover, true)[0];
        document.body.style.cursor = hoverHit ? 'grab' : 'default';
      } else if (hit) {
        if (this.activeLimb) {
          this.limbPositions[this.activeLimb].copy(hit);
          
          let currentHitHold = null;
          const directHit = rc.intersectObjects(this.holdMeshes, true)[0];
          
          if (directHit && directHit.object.userData.holdId) {
            currentHitHold = this.holdMeshes.find(m => m.userData.holdId === directHit.object.userData.holdId);
          } else {
            let nearest = null;
            let minDist = Infinity;
            this.routeGen.holds.forEach(h => {
               if (h.type === 'RELAIS') return;
               const dx = h.x - hit.x;
               const dy = h.y - hit.y;
               let d, threshold;
               if (h.type === 'VOLUME') { d = Math.sqrt(dx*dx + dy*dy); threshold = 0.35; }
               else { const dz = (h.z + 0.01) - hit.z; d = Math.sqrt(dx*dx + dy*dy + dz*dz); threshold = 0.40; }
               if (d < threshold && d < minDist) { minDist = d; nearest = h; }
            });
            if (nearest) currentHitHold = this.holdMeshes.find(m => m.userData.holdId === nearest.id);
          }
          
          if (this.hoveredHold !== currentHitHold) {
            if (this.hoveredHold) this.hoveredHold.material.emissive.setHex(0x000000);
            if (currentHitHold && currentHitHold.userData.holdType !== 'RELAIS') currentHitHold.material.emissive.setHex(0x333333);
            this.hoveredHold = currentHitHold;
          }
        } else if (this.isDraggingTorso) {
          const mfX = (this.limbPositions.leftHand.x + this.limbPositions.rightHand.x + this.limbPositions.leftFoot.x + this.limbPositions.rightFoot.x) / 4;
          const mfY = (this.limbPositions.leftHand.y + this.limbPositions.rightHand.y + this.limbPositions.leftFoot.y + this.limbPositions.rightFoot.y) / 4;
          
          const targetOffset = hit.clone().sub(new THREE.Vector3(mfX, mfY + 0.10, 0.20));
          targetOffset.x = Math.max(-0.6, Math.min(0.6, targetOffset.x));
          targetOffset.y = Math.max(-0.4, Math.min(0.4, targetOffset.y));
          
          this.bodyVelocity.x = (targetOffset.x - this.bodyOffset.x) * 10;
          this.bodyVelocity.y = (targetOffset.y - this.bodyOffset.y) * 10;
          this.bodyOffset.copy(targetOffset);
        }
      }
    });

    // Release Limb or Torso
    window.addEventListener('pointerup', e => {
      if (this.state !== 'PLAYING') return;
      document.body.style.cursor = 'default';

      if (this.isDraggingTorso) {
        this.isDraggingTorso = false;
        return;
      }

      if (!this.activeLimb) return;
      
      console.log('[DEBUG] pointerup - activeLimb:', this.activeLimb, 'hoveredHold:', this.hoveredHold);
      
      if (this.hoveredHold) {
        const hData = this.hoveredHold.userData;
        
        console.log('[DEBUG] holdId:', hData.holdId, 'holdType:', hData.holdType);
        
        // CHECK: Prevent putting all 4 limbs on the same hold (unrealistic)
        // Count limbs already on this hold (excluding the one we're moving)
        const limbsOnThisHold = LIMBS.filter(l => l !== this.activeLimb && this.limbHolds[l] === hData.holdId).length;
        
        console.log('[DEBUG] limbsOnThisHold:', limbsOnThisHold, 'limbHolds:', this.limbHolds);
        
        // Allow max 3 limbs on one hold (so if 3 are already there, can't add a 4th)
        if (limbsOnThisHold >= 3) {
          this.log(`❌ Maximum 3 membres par prise !`, 'warn');
          if (this.hoveredHold) this.hoveredHold.material.emissive.setHex(0x000000);
          this.hoveredHold = null;
          this.activeLimb = null;
          this._syncPositionsFromHolds();
          return;
        }
        
        console.log('[DEBUG] Checking kinematics...');
        const kinematicsOk = this._checkKinematics(this.activeLimb, this.hoveredHold.position);
        console.log('[DEBUG] Kinematics result:', kinematicsOk);
        
        if (kinematicsOk) {
          this.limbHolds[this.activeLimb] = hData.holdId;
          this.log(`${LIMB_LABELS[this.activeLimb]} → ${HOLD_TYPES[hData.holdType].label}`);
          
          const routeHold = this.routeGen.holds.find(h => h.id === hData.holdId);
          
          // Handle crumbling holds
          if (routeHold && routeHold.type === 'CRUMBLING' && routeHold.durability > 0) {
            routeHold.durability--;
            if (routeHold.durability === 0) {
              this.log(`💥 Prise friable détruite !`, 'warn');
            }
          }
          
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
        // Release logic
        if (this.activeLimb.includes('Foot')) {
          // TECHNIQUE: ADHÉRENCE (SMEARING)
          // If a foot is released in the air, it can "smear" on the wall
          this.limbHolds[this.activeLimb] = 'SMEAR';
          this.log(`👟 ${LIMB_LABELS[this.activeLimb]} en Adhérence (Friction)`, 'info');
        } else {
          // Released hand goes back to resting position
          this.limbHolds[this.activeLimb] = null;
          this.log(`${LIMB_LABELS[this.activeLimb]} relâché(e) - retour au repos`, 'warn');
          
          if (this.limbHolds.leftHand === null && this.limbHolds.rightHand === null) {
            this.fall("Vous avez lâché les deux mains !");
          }
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
      } else if (e.code === 'Escape') {
        this.showMenu();
      }
    });
    
    // Mobile button bindings
    const btnRest = document.getElementById('btn-rest');
    const btnMenu = document.getElementById('btn-menu');
    
    if (btnRest) {
      btnRest.addEventListener('click', () => {
        if (this.state === 'PLAYING') this._performRest();
      });
    }
    
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        if (this.state === 'PLAYING') this.showMenu();
      });
    }
  }
  
  _performRest() {
    // Get current height from torso or glbModel
    let currentHeight = 0;
    if (this.climber.glbModel) {
      currentHeight = Math.max(0, this.climber.glbModel.position.y);
    } else if (this.climber.parts && this.climber.parts.torso) {
      currentHeight = Math.max(0, this.climber.parts.torso.position.y);
    }
    
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
          // If jumping, don't snap to resting position (limbs are moving with physics)
          if (this.isJumping) return;
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
    // Reach tolerance (arms can stretch slightly more than legs)
    const maxReach = isArm ? ARM_REACH * 1.15 : LEG_REACH * 1.05;
    
    // 1. Distance from opposite limb (prevent extreme splits)
    const opp = isArm ? (limb === 'leftHand' ? 'rightHand' : 'leftHand') : (limb === 'leftFoot' ? 'rightFoot' : 'leftFoot');
    if (this.limbHolds[opp] !== null) {
      const oppPos = this._getHoldPos(this.limbHolds[opp]);
      // Arms can span ~2x reach, feet more flexible (~1.8x)
      const maxSpan = isArm ? maxReach * 2.0 : maxReach * 1.8;
      if (newPos.distanceTo(oppPos) > maxSpan) {
        if (Math.random() < 0.1) this.log(`⚠️ Écart trop grand entre les ${isArm ? 'mains' : 'pieds'} !`, 'warn');
        return false;
      }
    }

    // 2. Arms can't go too far above feet
    if (isArm && this.limbHolds.leftFoot !== null && this.limbHolds.rightFoot !== null) {
      const hipY = (this._getHoldPos(this.limbHolds.leftFoot).y + this._getHoldPos(this.limbHolds.rightFoot).y) / 2 + LEG_REACH * 0.8;
      if (newPos.y > hipY + maxReach * 2.2) {
        if (Math.random() < 0.1) this.log("⚠️ Trop haut ! Vous ne pouvez plus vous étendre.", 'warn');
        return false;
      }
    }

    // 3. Feet can reach above hands for technical moves (Heel Hook)
    if (!isArm) {
      let maxHandY = -Infinity;
      if (this.limbHolds.leftHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.leftHand).y);
      if (this.limbHolds.rightHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.rightHand).y);
      
      // Allow technical high steps up to 0.90m above hands
      if (maxHandY !== -Infinity && newPos.y > maxHandY + 0.90) {
        if (Math.random() < 0.1) this.log("⚠️ Pied trop haut par rapport aux mains !", 'warn');
        return false;
      }
      
      // Additional check: Both feet must stay relatively close together
      // This prevents the "splits" position
      const otherFoot = limb === 'leftFoot' ? 'rightFoot' : 'leftFoot';
      if (this.limbHolds[otherFoot] !== null) {
        const otherFootPos = this._getHoldPos(this.limbHolds[otherFoot]);
        const feetDistance = newPos.distanceTo(otherFootPos);
        // Feet can't be more than ~1.2m apart (realistic hip width limit)
        if (feetDistance > 1.2) return false;
      }
      
      // Feet need support - they can't reach holds too far horizontally from the hands
      const handsOn = (this.limbHolds.leftHand !== null ? 1 : 0) + (this.limbHolds.rightHand !== null ? 1 : 0);
      if (handsOn > 0) {
        let sumX = 0;
        let count = 0;
        if (this.limbHolds.leftHand !== null) { sumX += this._getHoldPos(this.limbHolds.leftHand).x; count++; }
        if (this.limbHolds.rightHand !== null) { sumX += this._getHoldPos(this.limbHolds.rightHand).x; count++; }
        const avgHandX = sumX / count;
        
        const footX = newPos.x;
        // Allow a wider horizontal window (0.85m) from the center of hands
        if (Math.abs(footX - avgHandX) > 0.85) return false;
      }
    }
    
    return true;
  }

  _updateFatigue(dt) {
    if (this.state !== 'PLAYING') return;

    let staminaDrain = 0;
    let fatigueMultiplier = 1.0;
    
    // Apply environmental condition multiplier
    if (this.currentCondition !== 'NONE') {
      const condition = ENV_CONDITIONS[this.currentCondition];
      if (condition) {
        fatigueMultiplier *= condition.fatigueMult;
      }
    }
    
    // Count active limbs
    const activeHands = (this.limbHolds.leftHand !== null ? 1 : 0) + (this.limbHolds.rightHand !== null ? 1 : 0);
    const activeFeet = (this.limbHolds.leftFoot !== null ? 1 : 0) + (this.limbHolds.rightFoot !== null ? 1 : 0);
    const totalActiveLimbs = activeHands + activeFeet;
    
    // Base stamina drain based on number of limbs used (per second %)
    let baseDrain = 0;
    if (totalActiveLimbs === 4) baseDrain = 1.0;
    else if (totalActiveLimbs === 3) baseDrain = 2.0;
    else if (totalActiveLimbs === 2) baseDrain = 4.0;
    else if (totalActiveLimbs === 1) baseDrain = 8.0;
    else baseDrain = 40.0;

    // Calculate hold-specific penalties
    let holdPenalty = 0;
    LIMBS.forEach(l => {
      const holdId = this.limbHolds[l];
      if (holdId === null) return;

      if (holdId === 'SMEAR') {
        holdPenalty += 0.5; // Smearing is tiring
      } else {
        const hold = this.routeGen.holds.find(h => h.id === holdId);
        if (hold) {
          const typeData = HOLD_TYPES[hold.type] || { fatigue: 1.0 };
          // If fatigue > 1.0, it adds to the drain
          if (typeData.fatigue > 1.0) holdPenalty += (typeData.fatigue - 1.0) * 2.0;
          if (hold.type === 'SLIPPERY') holdPenalty += 1.5;
        }
      }
    });

    // Technique bonus (Heel hook) reduces the base drain
    let technicalBonus = 1.0;
    const torsoY = (this.climber.glbModel || this.climber.parts.torso).position.y;
    if (this.limbPositions.leftFoot.y > torsoY || this.limbPositions.rightFoot.y > torsoY) {
      technicalBonus = 0.7; 
      if (Math.random() < 0.005) this.log("💪 Crochetage (Heel Hook) !", 'success');
    }

    // Final drain calculation: (Base * Bonus) + Penalties + Core Strain
    let maxHandY = -Infinity;
    if (this.limbHolds.leftHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.leftHand).y);
    if (this.limbHolds.rightHand !== null) maxHandY = Math.max(maxHandY, this._getHoldPos(this.limbHolds.rightHand).y);
    
    let coreStrain = 0;
    if (maxHandY !== -Infinity) {
      if (this.limbHolds.leftFoot !== null && this.limbHolds.leftFoot !== 'SMEAR') 
        coreStrain += Math.max(0, this._getHoldPos(this.limbHolds.leftFoot).y - maxHandY) * 2.0;
      if (this.limbHolds.rightFoot !== null && this.limbHolds.rightFoot !== 'SMEAR')
        coreStrain += Math.max(0, this._getHoldPos(this.limbHolds.rightFoot).y - maxHandY) * 2.0;
    }

    const finalDrain = (baseDrain * technicalBonus + holdPenalty + coreStrain) * fatigueMultiplier * dt;
    this.stamina -= finalDrain;
    
    // ── NEW: DISLOCATION CHECK ────────────────────────────────
    const torsoPos = (this.climber.glbModel || this.climber.parts.torso).position;
    let needsSync = false;
    
    LIMBS.forEach(l => {
      if (this.limbHolds[l] !== null && this.limbHolds[l] !== 'SMEAR') {
        const holdPos = this._getHoldPos(this.limbHolds[l]);
        const side = l.includes('left') ? -1 : 1;
        const jointOffset = l.includes('Hand') 
          ? new THREE.Vector3(side * 0.11, 0.35, 0) // Shoulder
          : new THREE.Vector3(side * 0.08, 0.06, 0); // Hip
        
        const jointWorldPos = torsoPos.clone().add(jointOffset);
        const dist = jointWorldPos.distanceTo(holdPos);
        const max = l.includes('Hand') ? ARM_REACH : LEG_REACH;
        
        if (dist > max * 1.35) {
          this.limbHolds[l] = null;
          this.log(`⚠️ ${LIMB_LABELS[l]} a lâché ! (Écart trop grand)`, 'warn');
          needsSync = true;
        }
      }
    });
    
    if (needsSync) {
      this._syncPositionsFromHolds();
      if (this.limbHolds.leftHand === null && this.limbHolds.rightHand === null) {
        this.fall("Vous avez perdu vos appuis de main !");
      }
    }

    if (this.stamina <= 0) {
      this.fall("Épuisement total. Vous avez lâché prise.");
    }

    // ── NEW: PHYSICS & SWINGING ─────────────────────────────────
    if (this.state === 'PLAYING') {
      const physicsDt = 0.016; // Fixed timestep for physics
      
      // Swinging physics (pendulum effect if hanging)
      const handsOn = (this.limbHolds.leftHand !== null ? 1 : 0) + (this.limbHolds.rightHand !== null ? 1 : 0);
      const isSwingOn = this.profile.settings.swingEnabled !== false;

      if (handsOn > 0 && !this.isDraggingTorso) {
        if (isSwingOn) {
          // Normal pendulum physics
          const spring = 5.0;
          const damp = 0.95;
          const accel = this.bodyOffset.clone().multiplyScalar(-spring);
          this.bodyVelocity.add(accel.multiplyScalar(physicsDt));
          this.bodyVelocity.multiplyScalar(damp);
          this.bodyOffset.add(this.bodyVelocity.clone().multiplyScalar(physicsDt));
        } else {
          // Completely lock to center if swing is off
          this.bodyOffset.set(0,0,0);
          this.bodyVelocity.set(0,0,0);
        }
      }
      
      // Ground detection for landing animation
      const torso = this.climber.glbModel || this.climber.parts.torso;
      if (this.state === 'FALLEN' && torso.position.y < 0.3) {
        this._playLandingEffect();
      }
    }
  }

  _playLandingEffect() {
    if (this._hasLanded) return;
    this._hasLanded = true;
    
    // Camera shake
    const originalPos = this.camera.position.clone();
    const shakeAmount = 0.1;
    let shakeCount = 0;
    const interval = setInterval(() => {
      this.camera.position.x = originalPos.x + (Math.random() - 0.5) * shakeAmount;
      this.camera.position.y = originalPos.y + (Math.random() - 0.5) * shakeAmount;
      shakeCount++;
      if (shakeCount > 10) {
        clearInterval(interval);
        this.camera.position.copy(originalPos);
      }
    }, 30);
    
    // Impact pose (bend knees)
    if (this.climber.isLoaded) {
      this.log("💥 Impact !", 'warn');
      // Visual feedback: briefly scale or move slightly
      this.climber.group.position.y = -0.1;
      setTimeout(() => { if (this.state === 'FALLEN') this.climber.group.position.y = 0; }, 200);
    }
  }

  _updateHUD() {
    if (this.state !== 'PLAYING') return;
    
    // Wait for climber to be loaded
    if (!this.climber || !this.climber.isLoaded) return;
    
    // Get height from torso or glbModel
    let h = 0;
    if (this.climber.glbModel) {
      h = Math.max(0, this.climber.glbModel.position.y);
    } else if (this.climber.parts && this.climber.parts.torso) {
      h = Math.max(0, this.climber.parts.torso.position.y);
    }
    
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
      
      const width = Math.max(0, Math.min(100, val));
      el.style.width = width + '%';
      text.textContent = intVal + '%';
      
      // Color logic: Stamina (id='stamina') should be Green/Blue when high, Red when low
      // Stress (id='stress') should be Red when high, Blue when low
      if (id === 'stamina') {
        el.style.background = width < 20 ? '#ef4444' : (width < 50 ? '#f59e0b' : '#3b82f6');
      } else {
        el.style.background = width > 80 ? '#ef4444' : (width > 50 ? '#f59e0b' : '#3b82f6');
      }
    };
    
    // Show stamina as percentage of max (accounting for endurance bonus)
    const staminaPct = (Math.max(0, this.stamina) / (this.maxStamina || 100)) * 100;
    setGauge('stamina', staminaPct);
    setGauge('stress', this.stress);
    
    // Update mobile bottom bar
    const mobileGauge = document.getElementById('mobile-gauge-stamina');
    const mobileVal = document.getElementById('mobile-val-stamina');
    if (mobileGauge) {
      mobileGauge.style.width = Math.min(100, staminaPct) + '%';
    }
    if (mobileVal) {
      mobileVal.textContent = Math.floor(staminaPct) + '%';
    }
  }

  log(msg, type = 'info') {
    const logEl = document.getElementById('move-log');
    if (!logEl) return;
    const d = document.createElement('div');
    d.textContent = msg;
    if (type === 'warn') d.style.color = '#ef4444';
    else if (type === 'success') d.style.color = '#00ff9d';
    else d.style.color = '#fff';
    logEl.prepend(d);
    if (logEl.children.length > 6) logEl.removeChild(logEl.lastChild);
  }
  
  _updateSpecialHolds(dt) {
    if (this.state !== 'PLAYING') return;
    
    this.routeGen.holds.forEach(hold => {
      const holdType = HOLD_TYPES[hold.type];
      if (!holdType || !holdType.special) return;
      
      // Check if any limb is on this hold
      const limbOnHold = LIMBS.find(limb => this.limbHolds[limb] === hold.id);
      
      switch(hold.type) {
        case 'UNSTABLE':
          if (limbOnHold) {
            hold.unstableTimer = (hold.unstableTimer || 0) + dt;
            if (hold.unstableTimer > hold.unstableThreshold) {
              this.log(`⚠️ Prise instable détachée !`, 'warn');
              this.limbHolds[limbOnHold] = null;
              hold.detached = true;
              this.stamina = Math.max(0, this.stamina - 10);
            }
          }
          break;
          
        case 'TEMPORARY':
          hold.lifetime = Math.max(0, hold.lifetime - dt);
          if (hold.lifetime <= 0 && !hold.expired) {
            hold.expired = true;
            this.log(`⏱️ Prise temporaire disparue !`, 'warn');
            if (limbOnHold) {
              this.limbHolds[limbOnHold] = null;
              this.stamina = Math.max(0, this.stamina - 15);
            }
          }
          break;
          
        case 'CRUMBLING':
          if (hold.durability <= 0 && !hold.crumbled) {
            hold.crumbled = true;
            this.log(`💥 Prise effritée !`, 'warn');
            if (limbOnHold) {
              this.limbHolds[limbOnHold] = null;
              this.stamina = Math.max(0, this.stamina - 12);
            }
          }
          break;
          
        case 'HOT':
          if (limbOnHold) {
            hold.hotTimer = (hold.hotTimer || 0) + dt;
            if (hold.hotTimer > hold.hotThreshold) {
              const burnDamage = 8 * dt; // Direct stamina damage
              this.stamina = Math.max(0, this.stamina - burnDamage);
              if (Math.floor(hold.hotTimer) > Math.floor(hold.hotTimer - dt)) {
                this.log(`🔥 Prise brûlante !`, 'warn');
              }
            }
          } else {
            hold.hotTimer = 0;
          }
          break;
          
        case 'ELECTRIC':
          hold.electricCycle = (hold.electricCycle || 0) + dt;
          if (hold.electricCycle >= hold.electricPeriod) {
            hold.electricCycle = 0;
          }
          hold.electricActive = (hold.electricCycle / hold.electricPeriod) < 0.3;
          
          if (hold.electricActive && limbOnHold && !hold.electricHit) {
            this.stamina = Math.max(0, this.stamina - 15);
            this.log(`⚡ Choc électrique !`, 'warn');
            hold.electricHit = true;
          }
          if (!hold.electricActive) {
            hold.electricHit = false;
          }
          break;
      }
    });
  }
  
  _applyEnvironmentalCondition(dt) {
    if (this.state !== 'PLAYING' || this.currentCondition === 'NONE') return;
    
    const condition = ENV_CONDITIONS[this.currentCondition];
    if (!condition) return;
    
    const staminaDrain = (condition.staminaDrain - 1.0) * 0.5 * dt;
    this.stamina = Math.max(0, this.stamina - staminaDrain);
  }

  _animate() {
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING' || this.state === 'MENU') {
      this.climber.updatePose(
        this.limbPositions.leftHand, this.limbPositions.rightHand,
        this.limbPositions.leftFoot, this.limbPositions.rightFoot,
        this.bodyOffset
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
      this._updateSpecialHolds(dt);
      this._applyEnvironmentalCondition(dt);
      this._updateHUD();
      
      // ── TUTORIAL GHOST / HINTS ──
      if (this.selectedRoute?.id === 'e2') {
        // Show swing helper arrows
        const time = Date.now() * 0.005;
        const arrowX = Math.sin(time) * 0.4;
        // (Visual logic for arrows could be added here or via CSS on HUD)
        if (Math.abs(this.bodyOffset.x) < 0.1) {
          this.log("↔️ Glissez le torse de gauche à droite !", 'info');
        }
      }

      if (this.selectedRoute?.id === 'e1' && !this.isJumping) {
        if (this.bodyVelocity.y > 1.5) {
          this.log("🚀 MAINTENANT ! Appuyez sur ESPACE", 'success');
        }
      }

      // Smooth camera follow
      let targetY = 1.5;
      if (this.climber.glbModel) {
        targetY = this.climber.glbModel.position.y;
      } else if (this.climber.parts && this.climber.parts.torso) {
        targetY = this.climber.parts.torso.position.y;
      }
      this.camera.position.y += (targetY - this.camera.position.y) * 4 * dt;
      this.camera.position.z = 3.8; // Move back to see the whole body
      
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
