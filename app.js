/* =========================================================================
   app.js — simulation engine.
   محرك المحاكاة: الاختيار بالأشعة، النقاط، اللغة، الواقع الافتراضي.

   Picking is done with a real Raycaster against the 3D objects, so it keeps
   working no matter where the camera is. (The old version guessed which
   object you meant from percentages of the screen, which broke as soon as
   you moved.)
   ========================================================================= */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { PATIENT, UI, TASKS } from './content.js';
import { buildRoom, STATE_COLOR } from './scene.js';

/* ====================================================== state + helpers */

const $ = id => document.getElementById(id);

const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
};

let lang = store.get('psim-lang', 'en') === 'ar' ? 'ar' : 'en';
const t = o => (o ? (o[lang] ?? o.en ?? '') : '');

const TOTAL_POINTS = TASKS.reduce((s, x) => s + x.points, 0);

const state = {
  started: false,
  finished: false,
  score: 0,
  elapsed: 0,
  done: new Set(),
  results: {}          // id -> { attempts, points }
};

const taskById     = Object.fromEntries(TASKS.map(x => [x.id, x]));
const taskByTarget = Object.fromEntries(TASKS.map(x => [x.target, x]));

const isLocked = task => task.requires.some(r => !state.done.has(r));

/* ============================================================ renderer  */

const canvas   = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.xr.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8c3d2);

const portrait = innerHeight > innerWidth;
const camera = new THREE.PerspectiveCamera(portrait ? 62 : 55, innerWidth / innerHeight, 0.05, 60);
camera.position.set(portrait ? 0.9 : 1.55, portrait ? 2.45 : 2.05, portrait ? 3.5 : 3.05);

// the camera lives inside a "player" group so VR can move the user without
// fighting the orbit controls
const player = new THREE.Group();
player.add(camera);
scene.add(player);

const room = buildRoom(scene);
const indicators = room.interactives.map(g => g.userData.indicator);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(room.focusPoint);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.0;
controls.maxDistance = 5.2;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = Math.PI * 0.495;
controls.screenSpacePanning = false;
controls.panSpeed = 0.6;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.8;
controls.update();

const TARGET_MIN = new THREE.Vector3(-2.8, 0.25, -2.8);
const TARGET_MAX = new THREE.Vector3(2.8, 2.2, 1.6);

/* ---- fly the camera to a station, so nothing can be missed off-screen ---
   تحريك الكاميرا إلى المحطة المطلوبة حتى لا يفوت الطالب أي عنصر */

// where the student "stands" by default — the open side of the room
const VIEW_ANCHOR = new THREE.Vector3(0.5, 1.75, 2.9);
const camFly = {
  on: false, t: 0, dur: 0.75,
  fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(),
  fromTgt: new THREE.Vector3(), toTgt: new THREE.Vector3()
};

function focusStation(id) {
  const g = room.interactives.find(x => x.userData.id === id);
  if (!g || renderer.xr.isPresenting) return;

  const tgt = g.userData.indicator.getWorldPosition(new THREE.Vector3());
  tgt.y = Math.max(0.5, tgt.y - 0.2);

  // move back along the line towards where the student stands, so the camera
  // never ends up inside the bed or buried in a wall
  const toAnchor = VIEW_ANCHOR.clone().sub(tgt);
  const dist = THREE.MathUtils.clamp(toAnchor.length() * 0.55, 1.5, 2.6);
  const pos = tgt.clone().addScaledVector(toAnchor.normalize(), dist);
  pos.y = THREE.MathUtils.clamp(Math.max(pos.y, tgt.y + 0.25), 0.8, 2.7);
  pos.x = THREE.MathUtils.clamp(pos.x, -3.2, 3.2);
  pos.z = THREE.MathUtils.clamp(pos.z, -2.7, 3.6);

  camFly.fromPos.copy(camera.position);
  camFly.fromTgt.copy(controls.target);
  camFly.toPos.copy(pos);
  camFly.toTgt.copy(tgt);
  camFly.t = 0;
  camFly.on = true;
}

function stepCamFly(dt) {
  if (!camFly.on) return;
  camFly.t = Math.min(1, camFly.t + dt / camFly.dur);
  const p = camFly.t;
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  camera.position.lerpVectors(camFly.fromPos, camFly.toPos, e);
  controls.target.lerpVectors(camFly.fromTgt, camFly.toTgt, e);
  if (camFly.t === 1) camFly.on = false;
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});

/* ============================================================== picking */

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function interactiveAncestor(obj) {
  let o = obj;
  while (o) { if (o.userData?.interactive) return o; o = o.parent; }
  return null;
}

/** Everything in the room, minus the player rig and the floating VR panel. */
function pickableRoots() {
  return scene.children.filter(o => o !== player && o !== vrPanel);
}

/** Returns the interactive group under screen coordinates, or null. */
function pickAt(clientX, clientY) {
  ndc.x = (clientX / innerWidth) * 2 - 1;
  ndc.y = -(clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);

  // the floating markers are drawn on top, so they are always clickable
  const onMarker = raycaster.intersectObjects(indicators, false);
  if (onMarker.length) return interactiveAncestor(onMarker[0].object);

  // otherwise the nearest thing actually in view wins — walls block clicks
  const hits = raycaster.intersectObjects(pickableRoots(), true);
  if (!hits.length) return null;
  return interactiveAncestor(hits[0].object);
}

let downAt = null, downTime = 0;

canvas.addEventListener('pointerdown', e => {
  downAt = { x: e.clientX, y: e.clientY };
  downTime = performance.now();
});

canvas.addEventListener('pointerup', e => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  const quick = performance.now() - downTime < 800;
  downAt = null;
  // a drag is a camera move, not a click — this is what separates the two
  if (moved < 9 && quick) activate(pickAt(e.clientX, e.clientY));
});

canvas.addEventListener('pointercancel', () => { downAt = null; });

/* hover ---------------------------------------------------------------- */

let hovered = null;
const tooltip = $('tooltip');

canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' || !state.started || state.finished) return;
  const g = pickAt(e.clientX, e.clientY);
  hovered = g;
  canvas.style.cursor = g ? 'pointer' : 'grab';
  if (g) {
    const task = taskByTarget[g.userData.id];
    tooltip.textContent = t(task.label) + (state.done.has(task.id) ? ' ✓' : '');
    tooltip.style.left = e.clientX + 'px';
    tooltip.style.top = e.clientY + 'px';
    tooltip.classList.add('show');
  } else {
    tooltip.classList.remove('show');
  }
});

canvas.addEventListener('pointerleave', () => {
  hovered = null;
  tooltip.classList.remove('show');
});

/* ======================================================== task handling */

let current = null;         // the task being answered
let currentOptions = [];    // shuffled copy
let wrongPicks = new Set();
let answered = false;

function activate(group) {
  if (!group || !state.started || state.finished) return;
  const task = taskByTarget[group.userData.id];
  if (!task) return;

  if (state.done.has(task.id)) { toast(t(task.label) + ' ✓'); return; }

  if (isLocked(task)) {
    const blocker = taskById[task.requires.find(r => !state.done.has(r))];
    toast(t(UI.lockedBody) + t(blocker.label));
    return;
  }

  current = task;
  wrongPicks = new Set();
  answered = false;
  currentOptions = shuffle(task.options.map((o, i) => ({ ...o, i })));
  renderTask();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderTask() {
  if (!current) return;
  if (renderer.xr.isPresenting) { drawVRPanel(); return; }

  $('mTitle').textContent  = t(current.label);
  $('mPrompt').textContent = t(current.prompt);

  const box = $('mOptions');
  box.innerHTML = '';
  currentOptions.forEach((opt, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = t(opt.text);
    if (wrongPicks.has(idx)) { b.classList.add('wrong'); b.disabled = true; }
    if (answered && opt.correct) { b.classList.add('right'); }
    if (answered) b.disabled = true;
    b.addEventListener('click', () => answer(idx));
    box.appendChild(b);
  });

  const verdict = $('mVerdict');
  const why = $('mWhy');
  verdict.innerHTML = '';
  why.innerHTML = '';

  if (answered) {
    verdict.innerHTML = `<div class="verdict ok"><b>${t(UI.correct)} ✓</b></div>`;
    why.innerHTML = `<div class="why"><u>${t(UI.whyLabel)}</u>${escapeHtml(t(current.rationale))}</div>`;
    $('mActions').style.display = 'flex';
  } else if (lastFeedback) {
    verdict.innerHTML = `<div class="verdict no"><b>${t(UI.incorrect)}</b>${escapeHtml(lastFeedback)}</div>`;
    $('mActions').style.display = 'none';
  } else {
    $('mActions').style.display = 'none';
  }

  $('modal').classList.add('show');
}

let lastFeedback = '';

function answer(idx) {
  if (answered || !current) return;
  const opt = currentOptions[idx];

  if (opt.correct) {
    answered = true;
    lastFeedback = '';
    const full = wrongPicks.size === 0;
    const pts = full ? current.points : Math.max(1, Math.round(current.points * 0.5));
    state.score += pts;
    state.done.add(current.id);
    state.results[current.id] = { attempts: wrongPicks.size + 1, points: pts };
    if (current.effect && room.effects[current.effect]) room.effects[current.effect]();
    refreshStates();
  } else {
    wrongPicks.add(idx);
    lastFeedback = t(opt.feedback) || t(UI.tryAgain);
  }
  renderTask();
}

function closeTask() {
  $('modal').classList.remove('show');
  current = null;
  lastFeedback = '';
  if (vrPanel) vrPanel.visible = false;
  if (state.done.size === TASKS.length) finish();
}

$('mNext').addEventListener('click', closeTask);

/* ======================================================= UI refreshing  */

function refreshStates() {
  room.interactives.forEach(g => {
    const task = taskByTarget[g.userData.id];
    if (!task) return;
    const st = state.done.has(task.id) ? 'done' : isLocked(task) ? 'locked' : 'pending';
    g.userData.state = st;
    g.userData.indicator.material.color.setHex(STATE_COLOR[st]);
    g.userData.indicator.material.opacity = st === 'locked' ? 0.4 : 0.95;
  });

  $('statScore').textContent = state.score;
  $('statProgress').textContent = `${state.done.size}/${TASKS.length}`;
  buildChecklist();
}

function buildChecklist() {
  const ul = $('checklist');
  ul.innerHTML = '';
  TASKS.forEach(task => {
    const li = document.createElement('li');
    const done = state.done.has(task.id);
    li.className = done ? 'done' : isLocked(task) ? 'locked' : '';
    li.innerHTML = `<i class="dot"></i><span></span>`;
    li.querySelector('span').textContent = t(task.label);
    li.title = t(task.label);
    // tapping a check turns the camera to it — no station can hide off-screen
    li.addEventListener('click', () => {
      focusStation(task.target);
      $('side').classList.remove('open');
    });
    ul.appendChild(li);
  });
}

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ============================================================ language  */

const langBtn = $('langBtn');

function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  langBtn.textContent = lang === 'en' ? 'عربي' : 'English';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (UI[key]) el.textContent = t(UI[key]);
  });

  const touch = matchMedia('(pointer: coarse)').matches;
  $('controlsText').textContent = t(touch ? UI.controlsTouch : UI.controlsDesktop);

  $('pName').textContent    = t(PATIENT.name);
  $('pDob').textContent     = PATIENT.dob;
  $('pMrn').textContent     = PATIENT.mrn;
  $('pWeight').textContent  = t(PATIENT.weight);
  $('pAllergy').textContent = t(PATIENT.allergies);
  $('pDrug').textContent    = t(PATIENT.order.drug);
  $('pDose').textContent    = t(PATIENT.order.dose);
  $('pRoute').textContent   = t(PATIENT.order.route);
  $('pTiming').textContent  = t(PATIENT.order.timing);
  $('pLast').textContent    = t(PATIENT.order.last);

  buildChecklist();
  if (current) renderTask();
  if (state.finished) renderDebrief();
}

langBtn.addEventListener('click', () => {
  lang = lang === 'en' ? 'ar' : 'en';
  store.set('psim-lang', lang);
  applyLang();
});

/* ============================================================== timing  */

let timerId = null;

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!state.started || state.finished) return;
    state.elapsed++;
    const m = Math.floor(state.elapsed / 60), s = state.elapsed % 60;
    $('statTime').textContent = `${m}:${String(s).padStart(2, '0')}`;
  }, 1000);
}

/* ============================================================= debrief  */

function finish() {
  state.finished = true;
  clearInterval(timerId);
  renderDebrief();
  $('debrief').classList.add('show');
}

function renderDebrief() {
  $('dScore').textContent = state.score;
  $('dOutOf').textContent = `/ ${TOTAL_POINTS}`;

  const pct = state.score / TOTAL_POINTS;
  $('dGrade').textContent =
    pct >= 0.9 ? t(UI.gradeExcellent) : pct >= 0.7 ? t(UI.gradeGood) : t(UI.gradeReview);

  const rows = TASKS.map(task => {
    const r = state.results[task.id];
    const first = r && r.attempts === 1;
    const cls = first ? 'ok' : 'mid';
    const label = first ? t(UI.firstTry) : t(UI.retried);
    return `<tr>
      <td>${escapeHtml(t(task.label))}</td>
      <td><span class="pill ${cls}">${escapeHtml(label)}</span></td>
      <td>${r ? r.points : 0}</td>
    </tr>`;
  }).join('');

  const m = Math.floor(state.elapsed / 60), s = state.elapsed % 60;
  $('dTable').innerHTML = `
    <tr><th>${escapeHtml(t(UI.taskList))}</th><th></th><th>${escapeHtml(t(UI.score))}</th></tr>
    ${rows}
    <tr><td colspan="2"><b>${escapeHtml(t(UI.time))}</b></td>
        <td><b>${m}:${String(s).padStart(2, '0')}</b></td></tr>`;
}

$('dPrint').addEventListener('click', () => window.print());

$('dRestart').addEventListener('click', () => {
  state.started = true;
  state.finished = false;
  state.score = 0;
  state.elapsed = 0;
  state.done = new Set();
  state.results = {};
  room.reset();
  refreshStates();
  $('statTime').textContent = '0:00';
  $('debrief').classList.remove('show');
  startTimer();
});

/* =============================================================== start  */

$('startBtn').addEventListener('click', () => {
  $('start').classList.remove('show');
  state.started = true;
  startTimer();
});

$('sideToggle').addEventListener('click', () => $('side').classList.toggle('open'));

/* ================================================================== VR  */

let vrPanel = null, vrCtx = null, vrTex = null, vrRects = [];

// only show the VR button on a device that can actually enter VR, so phones
// and laptops are not cluttered with a dead "VR NOT SUPPORTED" chip
if (navigator.xr?.isSessionSupported) {
  navigator.xr.isSessionSupported('immersive-vr')
    .then(ok => { if (ok) $('vrSlot').appendChild(VRButton.createButton(renderer)); })
    .catch(() => {});
}

const controllers = [0, 1].map(i => {
  const c = renderer.xr.getController(i);
  const geo = new THREE.BufferGeometry().setFromPoints(
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x4ecdc4 }));
  line.scale.z = 4;
  line.raycast = () => {};          // the pointer ray must never hit itself
  c.add(line);
  c.addEventListener('selectstart', () => onVRSelect(c));
  player.add(c);
  return c;
});

const tmpMatrix = new THREE.Matrix4();

function rayFromController(c) {
  tmpMatrix.identity().extractRotation(c.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmpMatrix);
}

function onVRSelect(c) {
  if (!state.started || state.finished) return;
  rayFromController(c);

  if (vrPanel && vrPanel.visible) {
    const hit = raycaster.intersectObject(vrPanel, false)[0];
    if (hit && hit.uv) {
      const px = hit.uv.x * 1024, py = (1 - hit.uv.y) * 700;
      const r = vrRects.find(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
      if (r) { r.action === 'close' ? closeTask() : answer(r.index); }
    }
    return;
  }

  const onMarker = raycaster.intersectObjects(indicators, false);
  const hits = onMarker.length ? onMarker : raycaster.intersectObjects(pickableRoots(), true);
  if (hits.length) activate(interactiveAncestor(hits[0].object));
}

function ensureVRPanel() {
  if (vrPanel) return;
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 700;
  vrCtx = c.getContext('2d');
  vrTex = new THREE.CanvasTexture(c);
  vrTex.colorSpace = THREE.SRGBColorSpace;
  vrPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.79),
    new THREE.MeshBasicMaterial({ map: vrTex, transparent: true })
  );
  vrPanel.renderOrder = 1000;
  vrPanel.material.depthTest = false;
  vrPanel.visible = false;
  scene.add(vrPanel);
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawVRPanel() {
  ensureVRPanel();
  const g = vrCtx;
  const rtl = lang === 'ar';
  const W = 1024, H = 700, PAD = 40;
  vrRects = [];

  g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.97)';
  roundRect(g, 0, 0, W, H, 26); g.fill();

  g.direction = rtl ? 'rtl' : 'ltr';
  g.textAlign = rtl ? 'right' : 'left';
  const X = rtl ? W - PAD : PAD;
  const fam = rtl ? '"IBM Plex Sans Arabic", sans-serif' : 'Inter, system-ui, sans-serif';

  let y = PAD + 34;
  g.fillStyle = '#0f6b7d';
  g.font = `700 32px ${fam}`;
  g.fillText(t(current.label), X, y);
  y += 22;

  g.fillStyle = '#10222c';
  g.font = `400 22px ${fam}`;
  wrapText(g, t(current.prompt), W - PAD * 2).forEach(l => { y += 30; g.fillText(l, X, y); });
  y += 26;

  if (answered) {
    g.fillStyle = '#e8f7ee';
    roundRect(g, PAD, y, W - PAD * 2, 56, 12); g.fill();
    g.fillStyle = '#0c5c34'; g.font = `700 22px ${fam}`;
    g.fillText(t(UI.correct) + '  ✓', X + (rtl ? -18 : 18), y + 36);
    y += 74;

    g.fillStyle = '#10222c'; g.font = `400 19px ${fam}`;
    wrapText(g, t(current.rationale), W - PAD * 2 - 20).slice(0, 7)
      .forEach(l => { y += 26; g.fillText(l, X, y); });

    y += 30;
    g.fillStyle = '#0f6b7d';
    roundRect(g, PAD, y, 260, 60, 14); g.fill();
    g.fillStyle = '#fff'; g.font = `700 22px ${fam}`;
    g.textAlign = 'center';
    g.fillText(t(UI.continueBtn), PAD + 130, y + 38);
    vrRects.push({ x: PAD, y, w: 260, h: 60, action: 'close' });
  } else {
    currentOptions.forEach((opt, idx) => {
      const lines = (g.font = `400 20px ${fam}`, wrapText(g, t(opt.text), W - PAD * 2 - 48));
      const h = 26 + lines.length * 27;
      const bad = wrongPicks.has(idx);
      g.fillStyle = bad ? '#fdecea' : '#f3f8fa';
      roundRect(g, PAD, y, W - PAD * 2, h, 13); g.fill();
      g.strokeStyle = bad ? '#f0bdb6' : '#dbe6ec'; g.lineWidth = 2; g.stroke();
      g.fillStyle = bad ? '#8a2c22' : '#10222c';
      let ly = y + 32;
      lines.forEach(l => { g.fillText(l, X + (rtl ? -22 : 22), ly); ly += 27; });
      if (!bad) vrRects.push({ x: PAD, y, w: W - PAD * 2, h, index: idx });
      y += h + 12;
    });

    if (lastFeedback) {
      g.fillStyle = '#fdecea';
      const lines = (g.font = `400 19px ${fam}`, wrapText(g, lastFeedback, W - PAD * 2 - 44));
      const h = 24 + lines.length * 26;
      roundRect(g, PAD, y, W - PAD * 2, h, 12); g.fill();
      g.fillStyle = '#8a2c22';
      let ly = y + 30;
      lines.forEach(l => { g.fillText(l, X + (rtl ? -22 : 22), ly); ly += 26; });
    }
  }

  vrTex.needsUpdate = true;
  positionVRPanel();
  vrPanel.visible = true;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const fwd = new THREE.Vector3();
function positionVRPanel() {
  const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  cam.getWorldDirection(fwd);
  vrPanel.position.copy(cam.getWorldPosition(new THREE.Vector3()))
    .add(fwd.multiplyScalar(1.25));
  vrPanel.quaternion.copy(cam.getWorldQuaternion(new THREE.Quaternion()));
}

/* entering / leaving VR ------------------------------------------------ */

const savedCam = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };

renderer.xr.addEventListener('sessionstart', () => {
  savedCam.pos.copy(camera.position);
  savedCam.quat.copy(camera.quaternion);
  controls.enabled = false;
  player.position.set(1.5, 0, 2.0);
  player.rotation.y = -0.25;
  document.body.classList.add('in-vr');
  if (!state.started) { state.started = true; startTimer(); $('start').classList.remove('show'); }
  if (current) drawVRPanel();
});

renderer.xr.addEventListener('sessionend', () => {
  controls.enabled = true;
  player.position.set(0, 0, 0);
  player.rotation.y = 0;
  camera.position.copy(savedCam.pos);
  camera.quaternion.copy(savedCam.quat);
  document.body.classList.remove('in-vr');
  if (vrPanel) vrPanel.visible = false;
  if (current) renderTask();
});

/* ============================================================ the loop  */

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const now = clock.elapsedTime;

  if (!renderer.xr.isPresenting) {
    stepCamFly(dt);
    // keep panning from wandering out of the room
    controls.target.clamp(TARGET_MIN, TARGET_MAX);
    controls.update();
  }

  // breathe the markers so they read as "you can touch this"
  room.interactives.forEach(g => {
    const s = g.userData.indicator;
    const base = g.userData.state === 'done' ? 0.13 : 0.21;
    const pulse = g.userData.state === 'pending' ? 1 + Math.sin(now * 3.2) * 0.11 : 1;
    const hover = hovered === g ? 1.4 : 1;
    s.scale.setScalar(base * pulse * hover);
  });

  // monitor trace + any running bed/rail animations
  room.update(PATIENT.vitals, now, dt);

  if (vrPanel && vrPanel.visible && renderer.xr.isPresenting) positionVRPanel();

  renderer.render(scene, camera);
});

/* =============================================================== boot   */

applyLang();
refreshStates();
$('statProgress').textContent = `0/${TASKS.length}`;

// exposed for the console, for automated tests, and for teachers demoing a
// specific station: psim.focus('ivpole')
window.psim = { state, room, TASKS, camera, controls, renderer, camFly,
                focus: focusStation, _drawVRPanel: drawVRPanel, _vrPanel: () => vrPanel };
