import * as THREE from 'three';
import { SKINS, ARM_UPPER, ARM_LOWER, LEG_UPPER, LEG_LOWER } from './data.js';

// ============================================================
// CLIMBER.JS — Procedural athletic climber
//
// GUARANTEE: hands and feet are ALWAYS placed at the exact
// world position passed to updatePose() — zero offset.
// Cylinders use geometry.parameters.height so _seg() scales
// correctly every time.
// ============================================================

export class Climber {
  constructor(skinId = 0) {
    this.group    = new THREE.Group();
    this.parts    = {};
    this.skinData = SKINS.find(s => s.id === skinId) || SKINS[0];
    this.isLoaded = true;
    this._build();
    this._tagLimbs();
  }

  // ── Helpers ───────────────────────────────────────────────
  _mat(hex, rough = 0.78, metal = 0.04) {
    return new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
  }
  _cyl(rT, rB, h, seg = 12) { return new THREE.CylinderGeometry(rT, rB, h, seg); }
  _sph(r, ws = 12, hs = 10)  { return new THREE.SphereGeometry(r, ws, hs); }

  _part(key, geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    this.parts[key] = m;
    this.group.add(m);
    return m;
  }

  // ── Build all body parts ──────────────────────────────────
  _build() {
    const S  = this.skinData;
    const sk = this._mat(S.skin,   0.80);   // skin
    const to = this._mat(S.top,    0.85);   // shirt/top
    const bt = this._mat(S.bottom, 0.85);   // shorts
    const sh = this._mat(0xcc3300, 0.50);   // climbing shoe upper
    const sl = this._mat(0x0a0a0a, 0.95);   // sole rubber
    const ha = this._mat(0x0ea5e9, 0.40, 0.12); // harness
    const hr = this._mat(0x1a0800, 0.90);   // hair

    /* HEAD */
    const headG = new THREE.Group();
    headG.castShadow = true;

    const skull = new THREE.Mesh(this._sph(0.082, 20, 16), sk);
    skull.scale.set(1, 1.06, 0.94);
    headG.add(skull);

    // HELMET (Premium look)
    const helmetMat = this._mat(0x1e293b, 0.3, 0.2); // Sleek dark slate
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.088, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), helmetMat);
    helmet.position.y = 0.015;
    const helmetStrap = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.1, 0.005), this._mat(0x111111));
    helmetStrap.position.set(0, -0.05, 0.04);
    helmetStrap.rotation.x = -0.3;
    helmet.add(helmetStrap);
    headG.add(helmet);

    [[-0.029, 0.010, 0.075], [0.029, 0.010, 0.075]].forEach(([x, y, z]) => {
      const white = new THREE.Mesh(this._sph(0.014, 8, 8), this._mat(0xf0eee8, 0.3));
      white.position.set(x, y, z);
      const pupil = new THREE.Mesh(this._sph(0.008, 8, 8), this._mat(0x111111, 0.1));
      pupil.position.set(x, y, z + 0.008);
      headG.add(white, pupil);
    });

    const nose = new THREE.Mesh(this._sph(0.010, 8, 6), sk);
    nose.scale.set(0.8, 0.55, 1.0);
    nose.position.set(0, -0.004, 0.080);
    headG.add(nose);

    [-1, 1].forEach(s => {
      const ear = new THREE.Mesh(this._sph(0.014, 8, 8), sk);
      ear.scale.set(0.45, 0.88, 0.55);
      ear.position.set(s * 0.080, 0.002, 0.003);
      headG.add(ear);
    });

    const neck = new THREE.Mesh(this._cyl(0.026, 0.030, 0.050, 10), sk);
    neck.position.y = -0.112;
    headG.add(neck);

    headG.traverse(c => { if (c.isMesh) { c.castShadow = true; } });
    this.parts.head = headG;
    this.group.add(headG);

    /* TORSO */
    const torsoG = new THREE.Group();
    // V-Taper muscular chest
    const chest = new THREE.Mesh(this._cyl(0.140, 0.100, 0.22, 16), to);
    chest.scale.set(1.40, 1, 0.70);
    chest.position.y = 0.32;
    torsoG.add(chest);

    const belly = new THREE.Mesh(this._cyl(0.100, 0.085, 0.16, 16), to);
    belly.scale.set(1.20, 1, 0.75);
    belly.position.y = 0.13;
    torsoG.add(belly);

    const pelvis = new THREE.Mesh(this._cyl(0.095, 0.082, 0.12, 12), bt);
    pelvis.scale.set(1.10, 1, 0.78);
    pelvis.position.y = -0.01;
    torsoG.add(pelvis);

    torsoG.traverse(c => { if (c.isMesh) { c.castShadow = true; } });
    this.parts.torso = torsoG;
    this.group.add(torsoG);

    /* HARNESS & CHALK BAG */
    const harnessG = new THREE.Group();
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.012, 8, 24), ha);
    belt.rotation.x = Math.PI / 2;
    harnessG.add(belt);
    [-1, 1].forEach(s => {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.008, 6, 16), ha);
      loop.rotation.x = Math.PI / 2;
      loop.position.set(s * 0.063, -0.105, 0);
      harnessG.add(loop);
    });
    
    // Chalk Bag on the back
    const chalkBag = new THREE.Mesh(this._cyl(0.045, 0.038, 0.09, 10), this._mat(0x334155, 0.9));
    chalkBag.position.set(0, -0.05, -0.12);
    chalkBag.rotation.x = -0.15;
    const chalkDust = new THREE.Mesh(this._sph(0.038, 8, 8), this._mat(0xffffff, 1.0));
    chalkDust.position.set(0, 0.045, 0);
    chalkBag.add(chalkDust);
    harnessG.add(chalkBag);
    this.parts.harness = harnessG;
    this.group.add(harnessG);

    /* ARMS */
    ['left', 'right'].forEach(side => {
      const sx = side === 'left' ? -1 : 1;
      const delt = new THREE.Mesh(this._sph(0.036, 10, 8), to);
      delt.scale.set(0.90, 1.0, 0.82);
      this._addPart(side + 'Shoulder', delt);

      this._part(side + 'UpperArm', this._cyl(0.027, 0.020, ARM_UPPER, 10), sk);
      this._addPart(side + 'Elbow',    new THREE.Mesh(this._sph(0.021, 8, 8), sk));
      this._part(side + 'Forearm',  this._cyl(0.023, 0.015, ARM_LOWER, 10), sk);
      this._addPart(side + 'Wrist',    new THREE.Mesh(this._sph(0.016, 8, 8), sk));

      // HAND GROUP — fingers wrap around hold
      const handG = new THREE.Group();
      const palm  = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.022, 0.048), sk);
      handG.add(palm);
      for (let f = 0; f < 4; f++) {
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.010, 0.020), sk);
        p1.position.set(-0.013 + f * 0.009, 0, 0.032);
        handG.add(p1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.009, 0.014), sk);
        p2.position.set(-0.013 + f * 0.009, -0.003, 0.047);
        p2.rotation.x = 0.22;
        handG.add(p2);
      }
      const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.018, 0.015), sk);
      thumb.position.set(sx * -0.025, -0.002, 0.012);
      thumb.rotation.y = sx * 0.38;
      handG.add(thumb);
      handG.traverse(c => { if (c.isMesh) c.castShadow = true; });
      this.parts[side + 'Hand'] = handG;
      this.group.add(handG);
    });

    /* LEGS */
    ['left', 'right'].forEach(side => {
      this._addPart(side + 'Hip',   new THREE.Mesh(this._sph(0.040, 10, 8), bt));
      this._part(side + 'Thigh',  this._cyl(0.038, 0.028, LEG_UPPER, 10), bt);
      this._addPart(side + 'Knee',  new THREE.Mesh(this._sph(0.026, 8, 8), sk));
      this._part(side + 'Calf',   this._cyl(0.026, 0.018, LEG_LOWER, 10), sk);
      this._addPart(side + 'Ankle', new THREE.Mesh(this._sph(0.018, 8, 8), sk));

      // CLIMBING SHOE
      const footG = new THREE.Group();
      const body  = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.026, 0.084), sh);
      body.position.z = 0.010;
      footG.add(body);
      const toe = new THREE.Mesh(this._sph(0.020, 8, 8), sh);
      toe.scale.set(0.75, 0.48, 1.10);
      toe.position.set(0, -0.005, 0.060);
      footG.add(toe);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.005, 0.088), sl);
      sole.position.set(0, -0.015, 0.010);
      footG.add(sole);
      footG.traverse(c => { if (c.isMesh) c.castShadow = true; });
      this.parts[side + 'Foot'] = footG;
      this.group.add(footG);
    });
  }

  // Helper to add a pre-built mesh
  _addPart(key, mesh) {
    mesh.castShadow = mesh.receiveShadow = true;
    this.parts[key] = mesh;
    this.group.add(mesh);
  }

  // ── 2-Bone IK (law of cosines) ────────────────────────────
  // Returns world-space mid-joint position.
  _solveIK(root, target, lenA, lenB, pole) {
    const delta = new THREE.Vector3().subVectors(target, root);
    const actualDist = delta.length();
    const dist  = THREE.MathUtils.clamp(actualDist, 0.001, (lenA + lenB) * 0.999);
    const dir   = actualDist > 1e-6 ? delta.clone().divideScalar(actualDist) : new THREE.Vector3(0, 1, 0);

    const cosA = (lenA * lenA + dist * dist - lenB * lenB) / (2 * lenA * dist);
    const ang  = Math.acos(THREE.MathUtils.clamp(cosA, -1, 1));

    // Orthogonalise pole against dir
    let up = pole.clone().normalize();
    up.sub(dir.clone().multiplyScalar(up.dot(dir)));
    if (up.lengthSq() < 1e-6) up.set(0, 0, 1);
    up.normalize();

    return root.clone()
      .addScaledVector(dir, Math.cos(ang) * lenA)
      .addScaledVector(up,  Math.sin(ang) * lenA);
  }

  // ── Position a CylinderGeometry mesh between two world pts ─
  // Uses geometry.parameters.height for correct Y-scale.
  _seg(mesh, a, b, maxLen = 0) {
    if (!mesh) return;
    const dir = new THREE.Vector3().subVectors(b, a);
    let len = dir.length();
    
    // Prevent physical stretching beyond limb length
    if (maxLen > 0 && len > maxLen) {
      len = maxLen;
      dir.normalize().multiplyScalar(maxLen);
      b.copy(a).add(dir);
    }
    
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mesh.position.copy(mid);
    const h   = mesh.geometry?.parameters?.height ?? 0.28;
    mesh.scale.setScalar(1);
    mesh.scale.y = Math.max(0.01, len / h);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  }

  // ── Main pose update ──────────────────────────────────────
  // lhPos, rhPos, lfPos, rfPos are THREE.Vector3 world positions.
  // They ARE the hold positions — no offset added.
  updatePose(lhPos, rhPos, lfPos, rfPos) {
    // 1. Filter active positions
    const activeHands = [];
    if (lhPos) activeHands.push(lhPos);
    if (rhPos) activeHands.push(rhPos);
    
    const activeFeet = [];
    if (lfPos) activeFeet.push(lfPos);
    if (rfPos) activeFeet.push(rfPos);

    // Fallbacks
    if (activeHands.length === 0) activeHands.push(new THREE.Vector3(0, 0, 0));
    if (activeFeet.length === 0) activeFeet.push(new THREE.Vector3(0, -1, 0));

    const hmx = activeHands.reduce((sum, h) => sum + h.x, 0) / activeHands.length;
    const hmy = activeHands.reduce((sum, h) => sum + h.y, 0) / activeHands.length;
    const fmx = activeFeet.reduce((sum, f) => sum + f.x, 0) / activeFeet.length;
    const mfY = Math.max(...activeFeet.map(f => f.y));

    const aLen = ARM_UPPER + ARM_LOWER;
    const lLen = LEG_UPPER + LEG_LOWER;

    // Initial heuristic for body center
    let hipY = Math.max(hmy - aLen * 1.0, mfY + lLen * 0.45);
    hipY     = Math.min(hipY, hmy - ARM_UPPER * 0.38);
    let hipX = hmx * 0.55 + fmx * 0.45;
    
    let hipC_xy = new THREE.Vector2(hipX, hipY);
    let shC_xy  = new THREE.Vector2(hipX, hipY + 0.44);

    // Iterative relaxation to keep body strictly within reach of all 4 holds
    for (let i = 0; i < 5; i++) {
      let lSh = new THREE.Vector2(shC_xy.x - 0.15, shC_xy.y);
      if (lhPos) {
        let dL = Math.hypot(lhPos.x - lSh.x, lhPos.y - lSh.y);
        if (dL > aLen * 0.99) shC_xy.add(new THREE.Vector2(lhPos.x - lSh.x, lhPos.y - lSh.y).multiplyScalar((dL - aLen * 0.99) / dL * 0.5));
      }

      let rSh = new THREE.Vector2(shC_xy.x + 0.15, shC_xy.y);
      if (rhPos) {
        let dR = Math.hypot(rhPos.x - rSh.x, rhPos.y - rSh.y);
        if (dR > aLen * 0.99) shC_xy.add(new THREE.Vector2(rhPos.x - rSh.x, rhPos.y - rSh.y).multiplyScalar((dR - aLen * 0.99) / dR * 0.5));
      }

      let lHp = new THREE.Vector2(hipC_xy.x - 0.095, hipC_xy.y - 0.030);
      if (lfPos) {
        let dLF = Math.hypot(lfPos.x - lHp.x, lfPos.y - lHp.y);
        if (dLF > lLen * 0.99) hipC_xy.add(new THREE.Vector2(lfPos.x - lHp.x, lfPos.y - lHp.y).multiplyScalar((dLF - lLen * 0.99) / dLF * 0.5));
      }

      let rHp = new THREE.Vector2(hipC_xy.x + 0.095, hipC_xy.y - 0.030);
      if (rfPos) {
        let dRF = Math.hypot(rfPos.x - rHp.x, rfPos.y - rHp.y);
        if (dRF > lLen * 0.99) hipC_xy.add(new THREE.Vector2(rfPos.x - rHp.x, rfPos.y - rHp.y).multiplyScalar((dRF - lLen * 0.99) / dRF * 0.5));
      }

      // Constrain torso length
      let torsoDir = new THREE.Vector2().subVectors(shC_xy, hipC_xy);
      let tLen = torsoDir.length();
      if (Math.abs(tLen - 0.44) > 0.001) {
        torsoDir.multiplyScalar(0.44 / tLen);
        let mid = new THREE.Vector2().addVectors(hipC_xy, shC_xy).multiplyScalar(0.5);
        hipC_xy.copy(mid).sub(torsoDir.clone().multiplyScalar(0.5));
        shC_xy.copy(mid).add(torsoDir.clone().multiplyScalar(0.5));
      }
    }

    hipX = hipC_xy.x;
    hipY = hipC_xy.y;
    const shX = shC_xy.x;
    const shY = shC_xy.y;

    // Hip Z: keep body away from wall to prevent chest clipping
    const ratio = THREE.MathUtils.clamp((hipY - mfY) / Math.max(lLen, 0.01), 0, 1);
    const hipZ  = 0.30 - ratio * 0.10; // 0.20 to 0.30

    const hipC = new THREE.Vector3(hipX, hipY, hipZ);
    const shZ = hipZ + 0.04; // shoulders lean slightly back
    const shC = new THREE.Vector3(shX, shY, shZ);

    // Compute dangling limbs if null
    const finalLhPos = lhPos || new THREE.Vector3(shX - 0.15, shY - aLen * 0.90, shZ + 0.1);
    const finalRhPos = rhPos || new THREE.Vector3(shX + 0.15, shY - aLen * 0.90, shZ + 0.1);
    const finalLfPos = lfPos || new THREE.Vector3(hipX - 0.10, hipY - lLen * 0.95, hipZ + 0.1);
    const finalRfPos = rfPos || new THREE.Vector3(hipX + 0.10, hipY - lLen * 0.95, hipZ + 0.1);

    /* HEAD — looks at the higher hand */
    const hiHand = finalLhPos.y >= finalRhPos.y ? finalLhPos : finalRhPos;
    this.parts.head.position.set(shX, shY + 0.125, shZ + 0.012);
    this.parts.head.lookAt(
      shX + (hiHand.x - shX) * 0.60,
      hiHand.y > shY ? hiHand.y : shY + 0.20,
      shZ - 1.0 // Faces the wall (negative Z)
    );

    /* TORSO — oriented hips→shoulders, slight forward lean */
    this.parts.torso.position.copy(hipC);
    const td = new THREE.Vector3().subVectors(shC, hipC).normalize();
    this.parts.torso.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), td);
    this.parts.torso.rotateX(-0.09);
    this.parts.torso.scale.set(1, 1, 1);

    /* HARNESS */
    this.parts.harness.position.copy(hipC);
    this.parts.harness.quaternion.copy(this.parts.torso.quaternion);

    /* Joint anchors (world) */
    const lSh = new THREE.Vector3(shX - 0.15, shY, shZ);
    const rSh = new THREE.Vector3(shX + 0.15, shY, shZ);
    const lHp = new THREE.Vector3(hipX - 0.095, hipY - 0.030, hipZ);
    const rHp = new THREE.Vector3(hipX + 0.095, hipY - 0.030, hipZ);

    /* ARMS */
    [['left', lSh, finalLhPos, -1], ['right', rSh, finalRhPos, 1]].forEach(([side, sh, hand, sx]) => {
      this.parts[side + 'Shoulder'].position.copy(sh);

      // Elbow direction: out + down when arm is high, out + up when low
      const poleY = hand.y > sh.y ? -0.20 : 0.30;
      const pole  = new THREE.Vector3(sx * 0.65, poleY, 0.55);
      const elbow = this._solveIK(sh, hand, ARM_UPPER, ARM_LOWER, pole);

      this.parts[side + 'Elbow'].position.copy(elbow);
      this._seg(this.parts[side + 'UpperArm'], sh, elbow, ARM_UPPER);

      const wrist = hand.clone();
      this._seg(this.parts[side + 'Forearm'], elbow, wrist, ARM_LOWER);
      this.parts[side + 'Wrist'].position.copy(wrist);

      // Hand follows wrist (if stretched, it pulls away from mouse/hold)
      this.parts[side + 'Hand'].position.copy(wrist);
      this.parts[side + 'Hand'].lookAt(wrist.x, wrist.y, wrist.z - 1);
    });

    /* LEGS */
    [['left', lHp, finalLfPos, -1], ['right', rHp, finalRfPos, 1]].forEach(([side, hp, foot, sx]) => {
      this.parts[side + 'Hip'].position.copy(hp);

      // Knee: outward (frog style) parallel to the wall so it doesn't clip inside
      const hiStep = foot.y > hp.y - lLen * 0.42;
      const pole   = new THREE.Vector3(sx * 0.85, hiStep ? 0.20 : 0.35, 0.0);
      const knee   = this._solveIK(hp, foot, LEG_UPPER, LEG_LOWER, pole);

      this.parts[side + 'Knee'].position.copy(knee);
      this._seg(this.parts[side + 'Thigh'], hp, knee, LEG_UPPER);

      const ankle = foot.clone();
      this._seg(this.parts[side + 'Calf'], knee, ankle, LEG_LOWER);
      this.parts[side + 'Ankle'].position.copy(ankle);

      // Foot follows ankle (if stretched, it pulls away from mouse/hold)
      this.parts[side + 'Foot'].position.copy(ankle);
      this.parts[side + 'Foot'].lookAt(ankle.x, ankle.y, ankle.z - 1);
    });
  }

  // ── Limb tagging for raycasting ───────────────────────────
  _tagLimbs() {
    // Tag hands and the arm segments above them
    ['leftHand', 'rightHand', 'leftFoot', 'rightFoot'].forEach(limb => {
      const p = this.parts[limb];
      if (p) p.traverse(c => { c.userData.limb = limb; });

      const side = limb.startsWith('left') ? 'left' : 'right';
      const near = limb.includes('Hand')
        ? [side + 'Wrist', side + 'Forearm', side + 'Elbow']
        : [side + 'Ankle', side + 'Calf',    side + 'Knee'];
      near.forEach(k => {
        if (this.parts[k]) this.parts[k].userData.limb = limb;
      });
    });
  }

  tagLimbMeshes() { this._tagLimbs(); }

  getLimbMeshes() {
    const out = [];
    this.group.traverse(c => { if (c.isMesh && c.userData.limb) out.push(c); });
    return out;
  }
}
