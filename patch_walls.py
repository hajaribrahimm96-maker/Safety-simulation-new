#!/usr/bin/env python3
"""
Two additions to the handed-off build:

  1. the question board can be moved to ANY wall — preset buttons plus
     height / size / along-the-wall sliders, saved automatically, and
     inside the headset you can aim a controller at a surface and stick
     the board there.
  2. the nurse can talk to the patient — microphone on a computer,
     tappable questions everywhere (including inside the headset), and
     the patient answers out loud with subtitles.

يضيف: نقل لوحة الأسئلة لأي جدار + الكلام مع المريضة بالصوت.
"""

import pathlib, re, sys

HERE = pathlib.Path(__file__).parent
SRC = HERE / 'body.html'
DST = HERE / (sys.argv[1] if len(sys.argv) > 1 else 'v2.html')

html = SRC.read_text(encoding='utf-8')
n_patches = 0


def swap(old, new, label):
    """Exact, single-occurrence replacement — anything else is a bug."""
    global html, n_patches
    count = html.count(old)
    assert count == 1, f'{label}: found {count} occurrences, expected 1'
    html = html.replace(old, new)
    n_patches += 1
    print(f'  ok  {label}')


# ===================================================================== CSS

swap("""#vrPick{
  position:fixed;z-index:25;left:14px;bottom:14px;display:flex;align-items:center;gap:6px;
  background:rgba(11,36,48,.92);padding:8px 10px;border-radius:12px;
}
#vrPick[hidden]{display:none}
#vrPick u{text-decoration:none;color:#9fb6c4;font-size:11px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;margin-inline-end:4px}
#vrPick button{
  width:34px;height:34px;border:1px solid rgba(255,255,255,.22);border-radius:9px;
  background:transparent;color:#fff;font-size:14px;font-weight:700;
}
#vrPick button.on{background:#e08600;border-color:#e08600}""",
"""/* ------------------------------------------ question-board placement */
#placeToggle{
  position:fixed;z-index:25;left:14px;bottom:14px;
  width:40px;height:40px;display:grid;place-items:center;
  border:1px solid rgba(255,255,255,.2);border-radius:11px;
  background:rgba(11,36,48,.86);color:#cfe0ea;
}
#placeToggle svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.7}
#placeToggle.on{background:#0f6b7d;border-color:#0f6b7d;color:#fff}
#placeUI{
  position:fixed;z-index:26;left:14px;bottom:62px;width:264px;
  background:rgba(11,36,48,.96);border:1px solid rgba(255,255,255,.12);
  border-radius:14px;padding:12px 13px 11px;color:#e6eef3;
  box-shadow:0 18px 40px rgba(0,0,0,.45);
}
#placeUI[hidden],#placeToggle[hidden]{display:none}
#placeUI header{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
#placeUI header b{font-size:13px;letter-spacing:.01em}
#placeUI header button{background:none;border:0;color:#8fa6b4;font-size:19px;line-height:1;padding:0 2px}
#placeUI .row{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
#placeUI .row button{
  flex:1 1 76px;padding:7px 4px;border:1px solid rgba(255,255,255,.18);
  border-radius:8px;background:transparent;color:#dbe7ee;font-size:11.5px;font-weight:600;
}
#placeUI .row button.on{background:#e08600;border-color:#e08600;color:#fff}
#placeUI label{display:block;font-size:11px;color:#9fb6c4;font-weight:600;margin-bottom:7px}
#placeUI label output{float:right;color:#e6eef3;font-variant-numeric:tabular-nums}
#placeUI input[type=range]{width:100%;margin:3px 0 0;accent-color:#e08600}
#placeUI .hint{margin:8px 0 9px;font-size:10.5px;line-height:1.5;color:#89a1b0}
#placeUI .ghost{flex:0 0 auto;padding:6px 12px;font-size:11px;color:#9fb6c4;
  border:1px solid rgba(255,255,255,.16);border-radius:8px;background:none}

/* -------------------------------------------------- talking to her */
#voiceToggle{display:flex;align-items:center;gap:7px}
#voiceToggle svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8}
#voiceBar{
  position:fixed;z-index:28;bottom:16px;left:50%;transform:translateX(-50%);
  width:min(680px,94vw);background:rgba(11,36,48,.96);
  border:1px solid rgba(255,255,255,.12);border-radius:16px;
  padding:12px 14px 11px;color:#e6eef3;box-shadow:0 20px 46px rgba(0,0,0,.45);
}
#voiceBar[hidden]{display:none}
#voiceBar .vhead{display:flex;align-items:center;gap:10px;margin-bottom:9px}
#voiceBar .vhead b{font-size:13px;flex:1}
#voiceBar .vhead .lang{display:flex;gap:4px}
#voiceBar .vhead .lang button{
  padding:4px 9px;border:1px solid rgba(255,255,255,.18);border-radius:7px;
  background:none;color:#cfe0ea;font-size:11px;font-weight:600}
#voiceBar .vhead .lang button.on{background:#0f6b7d;border-color:#0f6b7d;color:#fff}
#voiceBar .vhead .x{background:none;border:0;color:#8fa6b4;font-size:19px;line-height:1;padding:0 2px}
#micBtn{
  width:52px;height:52px;flex:0 0 52px;border-radius:50%;display:grid;place-items:center;
  border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#e6eef3;
}
#micBtn svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8}
#micBtn.live{background:#c0392b;border-color:#c0392b;color:#fff;
  animation:micpulse 1.15s ease-in-out infinite}
#micBtn[disabled]{opacity:.38}
@keyframes micpulse{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,.55)}
                    50%{box-shadow:0 0 0 11px rgba(192,57,43,0)}}
#voiceBar .vmain{display:flex;align-items:center;gap:12px}
#voiceBar .vlines{flex:1;min-width:0}
#voiceBar .vline{font-size:13px;line-height:1.45;margin:0 0 3px}
#voiceBar .vline u{text-decoration:none;color:#8fa6b4;font-size:10.5px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;margin-inline-end:7px}
#voiceBar .vline.nurse{color:#9fb6c4}
#voiceBar .vline.her{color:#fff;font-weight:600}
#voiceBar .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
#voiceBar .chips button{
  padding:6px 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;
  background:transparent;color:#dbe7ee;font-size:11.5px;font-weight:600}
#voiceBar .chips button:hover{border-color:#4ecdc4;color:#fff}
#voiceBar .note{margin:9px 0 0;font-size:10.5px;line-height:1.5;color:#89a1b0}
body.voice-on #toast{bottom:190px}
body.in-vr #placeToggle,body.in-vr #placeUI,body.in-vr #voiceBar{display:none}""",
     'CSS')


# ================================================================== markup

swap("""<!-- temporary: compare the four VR panel placements, remove once chosen -->
<div id="vrPick" hidden>
  <u>VR panel</u>
  <button data-vr="A" class="on">A</button>
  <button data-vr="B">B</button>
  <button data-vr="C">C</button>
  <button data-vr="D">D</button>
</div>""",
"""<!-- where the question board hangs, on screen and in the headset -->
<button id="placeToggle" title="Question board placement (press V)"
        aria-label="Question board placement">
  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/>
    <path d="M12 17v3M8.5 20h7"/></svg>
</button>
<div id="placeUI" hidden>
  <header>
    <b>Question board</b>
    <button id="placeClose" aria-label="Close">&times;</button>
  </header>
  <div class="row" id="placeWalls">
    <button data-place="head">Follows head</button>
    <button data-place="back">Back wall</button>
    <button data-place="right">Right wall</button>
    <button data-place="left">Left wall</button>
    <button data-place="front">Front wall</button>
  </div>
  <label>Along the wall <output id="outAlong">0</output>
    <input id="inAlong" type="range" min="-1" max="1" step="0.02"></label>
  <label>Height <output id="outHeight">1.80 m</output>
    <input id="inHeight" type="range" min="0.9" max="2.5" step="0.01"></label>
  <label>Size <output id="outSize">150%</output>
    <input id="inSize" type="range" min="0.7" max="2.2" step="0.01"></label>
  <p class="hint">Saved on this device. In the headset, squeeze a grip to aim,
    then pull the trigger to stick the board on whatever you point at.</p>
  <div class="row"><button id="placeReset" class="ghost">Reset</button></div>
</div>

<!-- the nurse talking to the patient -->
<div id="voiceBar" hidden>
  <div class="vhead">
    <b>Talking to Hajar</b>
    <span class="lang">
      <button data-vlang="en" class="on">English</button>
      <button data-vlang="ar">&#1593;&#1585;&#1576;&#1610;</button>
    </span>
    <button class="x" id="voiceClose" aria-label="Close">&times;</button>
  </div>
  <div class="vmain">
    <button id="micBtn" aria-label="Hold a conversation">
      <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/>
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg>
    </button>
    <div class="vlines">
      <p class="vline nurse" id="vNurse"><u>You</u><span id="vNurseText">&mdash;</span></p>
      <p class="vline her" id="vHer"><u>Hajar</u><span id="vHerText">&mdash;</span></p>
    </div>
  </div>
  <div class="chips" id="vChips"></div>
  <p class="note" id="vNote"></p>
</div>""",
     'markup')

swap('<b id="statProgress">0/9</b>', '<b id="statProgress">0/7</b>', 'header count')

swap("""  <div id="vrSlot"></div>
  <button class="iconbtn" id="sideToggle\"""",
"""  <button class="iconbtn" id="voiceToggle" aria-label="Talk to the patient"
          title="Talk to the patient">
    <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg>
  </button>
  <div id="vrSlot"></div>
  <button class="iconbtn" id="sideToggle\"""",
     'HUD talk button')


# ======================================================== front wall (VR)

swap("""  wall(ROOM_W, ROOM_H, 0.12, 0, ROOM_H / 2, -ROOM_D / 2);
  wall(0.12, ROOM_H, ROOM_D, -ROOM_W / 2, ROOM_H / 2, 0);
  wall(0.12, ROOM_H, ROOM_D, ROOM_W / 2, ROOM_H / 2, 0);""",
"""  wall(ROOM_W, ROOM_H, 0.12, 0, ROOM_H / 2, -ROOM_D / 2);
  wall(0.12, ROOM_H, ROOM_D, -ROOM_W / 2, ROOM_H / 2, 0);
  wall(0.12, ROOM_H, ROOM_D, ROOM_W / 2, ROOM_H / 2, 0);

  // the fourth wall is the camera's way in, so it only exists inside the
  // headset — otherwise you would be orbiting the outside of a closed box.
  // It is flagged out of the click test so it can never swallow a click.
  refs.frontWall = wall(ROOM_W, ROOM_H, 0.12, 0, ROOM_H / 2, ROOM_D / 2);
  refs.frontWall.visible = false;
  refs.frontWall.userData.noPick = true;""",
     'front wall')

swap("""function pickableRoots() {
  return scene.children.filter(o => o !== player && o !== vrPanel);
}""",
"""function pickableRoots() {
  return scene.children.filter(o =>
    o !== player && o !== vrPanel && !o.userData.noPick);
}""",
     'pickableRoots')


# ================================================== placement engine

swap("""const fwd = new THREE.Vector3();

/* ---- where the question panel sits inside the headset -----------------
   Four placements to compare on real hardware. Squeeze either controller
   grip in VR to cycle; outside VR use the A/B/C/D buttons.
   أربعة أماكن للوحة الأسئلة: اضغط زر القبضة داخل النظارة للتبديل. */

const VR_PLACEMENTS = {
  A: { label: 'A · follows your head',   label_ar: 'أ · تتبع الرأس' },
  B: { label: 'B · back wall',           label_ar: 'ب · الجدار الخلفي' },
  C: { label: 'C · beside the bed',      label_ar: 'ج · جنب السرير' },
  D: { label: 'D · side wall',           label_ar: 'د · الجدار الجانبي' }
};
const VR_ORDER = ['A', 'B', 'C', 'D'];
let VR_MODE = (new URLSearchParams(location.search).get('vr') || 'A').toUpperCase();
if (!VR_PLACEMENTS[VR_MODE]) VR_MODE = 'A';

function positionVRPanel() {
  if (!vrPanel) return;
  const solid = VR_MODE !== 'A';
  vrPanel.material.depthTest = solid;
  vrPanel.renderOrder = solid ? 0 : 1000;

  if (VR_MODE === 'B') {
    vrPanel.position.set(0.85, 2.02, -3.02);
    vrPanel.rotation.set(0, 0, 0);
    vrPanel.scale.set(1.55, 1.55, 1);
  } else if (VR_MODE === 'C') {
    vrPanel.position.set(0.92, 1.42, -0.62);
    vrPanel.rotation.set(-0.12, 0.62, 0);
    vrPanel.scale.set(0.72, 0.72, 1);
  } else if (VR_MODE === 'D') {
    vrPanel.position.set(3.5, 1.55, 0.25);
    vrPanel.rotation.set(0, -Math.PI / 2, 0);
    vrPanel.scale.set(1.12, 1.12, 1);
  } else {
    const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
    cam.getWorldDirection(fwd);
    vrPanel.position.copy(cam.getWorldPosition(new THREE.Vector3()))
      .add(fwd.multiplyScalar(0.78));
    vrPanel.quaternion.copy(cam.getWorldQuaternion(new THREE.Quaternion()));
    vrPanel.scale.set(1, 1, 1);
  }
}

function setVRMode(mode) {
  if (!VR_PLACEMENTS[mode]) return;
  VR_MODE = mode;
  document.querySelectorAll('#vrPick button').forEach(b =>
    b.classList.toggle('on', b.dataset.vr === mode));
  if (vrPanel) positionVRPanel();
}

function cycleVRMode() {
  setVRMode(VR_ORDER[(VR_ORDER.indexOf(VR_MODE) + 1) % VR_ORDER.length]);
}""",
"""const fwd = new THREE.Vector3();
const _pv = new THREE.Vector3(), _qv = new THREE.Quaternion();

/* ---- where the question board hangs ----------------------------------
   It can follow your head, sit flat on any of the four walls, or be stuck
   wherever a controller points. Height, size and the position along the
   wall are adjustable, and the choice is remembered on this device.
   لوحة الأسئلة: تتبع الرأس، أو تُثبَّت على أي جدار، أو تُلصق بالمتحكمة. */

const ROOM = { W: 7.2, D: 6.2, H: 2.95 };

const WALLS = {
  back:  { label: 'Back wall' },
  right: { label: 'Right wall' },
  left:  { label: 'Left wall' },
  front: { label: 'Front wall' }
};

const PLACE_DEFAULT = { mode: 'wall', wall: 'right', along: -0.12, height: 1.72, size: 1.35 };

function readPlace() {
  const out = Object.assign({}, PLACE_DEFAULT);
  try { Object.assign(out, JSON.parse(store.get('psim.place', '') || '{}') || {}); }
  catch { /* corrupt entry — fall back to the default */ }

  // a URL can override for one run without disturbing the saved choice
  const q = new URLSearchParams(location.search);
  let v = (q.get('place') || q.get('vr') || '').toLowerCase();
  const legacy = { a: 'head', b: 'back', c: 'right', d: 'right' };   // old A–D links
  if (legacy[v]) v = legacy[v];
  if (v === 'head') out.mode = 'head';
  else if (WALLS[v]) { out.mode = 'wall'; out.wall = v; }

  const clampNum = (k, lo, hi) => {
    const x = parseFloat(q.get(k));
    if (Number.isFinite(x)) out[k] = Math.min(hi, Math.max(lo, x));
  };
  clampNum('along', -1, 1);
  clampNum('height', 0.9, 2.5);
  clampNum('size', 0.7, 2.2);

  if (out.mode !== 'head' && out.mode !== 'free' && out.mode !== 'wall') out.mode = 'wall';
  if (!WALLS[out.wall]) out.wall = 'back';
  return out;
}

const PLACE = readPlace();

function savePlace() {
  const o = { mode: PLACE.mode, wall: PLACE.wall, along: PLACE.along,
              height: PLACE.height, size: PLACE.size };
  if (PLACE.mode === 'free' && PLACE.free) o.free = PLACE.free;
  store.set('psim.place', JSON.stringify(o));
}

/** Flat against the named wall, shifted along it and kept inside the room. */
function wallSlot(name) {
  const half = VR_PW * PLACE.size / 2 + 0.14;
  const a = Math.max(-1, Math.min(1, PLACE.along));
  const y = PLACE.height;
  const IN = 0.26;                       // clear of the wall's own thickness
  const limX = Math.max(0, ROOM.W / 2 - half);
  const limZ = Math.max(0, ROOM.D / 2 - half);
  if (name === 'front') return { pos: [-a * limX, y,  ROOM.D / 2 - IN], rotY: Math.PI };
  if (name === 'left')  return { pos: [-ROOM.W / 2 + IN, y,  a * limZ], rotY:  Math.PI / 2 };
  if (name === 'right') return { pos: [ ROOM.W / 2 - IN, y, -a * limZ], rotY: -Math.PI / 2 };
  return                       { pos: [ a * limX, y, -ROOM.D / 2 + IN], rotY: 0 };
}

function positionVRPanel() {
  if (!vrPanel) return;
  const head = PLACE.mode === 'head';
  vrPanel.material.depthTest = !head;     // a head-locked board must not clip
  vrPanel.renderOrder = head ? 1000 : 0;

  if (head) {
    const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
    cam.getWorldDirection(fwd);
    vrPanel.position.copy(cam.getWorldPosition(_pv)).add(fwd.multiplyScalar(0.82));
    vrPanel.quaternion.copy(cam.getWorldQuaternion(_qv));
    vrPanel.scale.set(1, 1, 1);
  } else if (PLACE.mode === 'free' && PLACE.free) {
    vrPanel.position.fromArray(PLACE.free.p);
    vrPanel.quaternion.fromArray(PLACE.free.q);
    vrPanel.scale.set(PLACE.size, PLACE.size, 1);
  } else {
    const s = wallSlot(PLACE.wall);
    vrPanel.position.set(s.pos[0], s.pos[1], s.pos[2]);
    vrPanel.rotation.set(0, s.rotY, 0);
    vrPanel.scale.set(PLACE.size, PLACE.size, 1);
  }
}

function placeLabel() {
  if (PLACE.mode === 'head') return 'Follows your head';
  if (PLACE.mode === 'free') return 'Placed by controller';
  return (WALLS[PLACE.wall] || WALLS.back).label;
}

/** The one way the placement ever changes. Repositions, redraws and saves. */
function setPlace(patch) {
  if (patch.mode === 'wall' && patch.wall) PLACE.free = null;
  Object.assign(PLACE, patch);
  if (vrPanel) positionVRPanel();
  syncPlaceUI();
  savePlace();
  if (vrPanel && vrPanel.visible) drawVRPanel();
}

/* --- aiming a controller at a surface and sticking the board there ---- */

let vrPlacing = false;
const _nrm = new THREE.Vector3(), _nmat = new THREE.Matrix3();

function toggleVRPlacing(on) {
  vrPlacing = (on === undefined) ? !vrPlacing : !!on;
  ensureVRPanel();
  vrPanel.material.opacity = vrPlacing ? 0.5 : 1;
  controllers.forEach(c => {
    const l = c.children.find(x => x.isLine);
    if (l) l.material.color.set(vrPlacing ? 0xffb020 : 0x4ecdc4);
  });
  if (vrPlacing && !vrPanel.visible) drawVRPanel();
  else if (vrPanel.visible) drawVRPanel();
}

function stickPanelAt(hit) {
  ensureVRPanel();
  _nmat.getNormalMatrix(hit.object.matrixWorld);
  _nrm.copy(hit.face.normal).applyMatrix3(_nmat).normalize();

  // a board on the floor or the ceiling is unreadable — keep it upright
  _nrm.y = 0;
  if (_nrm.lengthSq() < 1e-6) {
    _nrm.copy(hit.point).sub(vrPanel.position).setY(0);
    if (_nrm.lengthSq() < 1e-6) _nrm.set(0, 0, 1);
  }
  _nrm.normalize();

  const p = hit.point.clone().addScaledVector(_nrm, 0.07);
  p.y = Math.min(2.45, Math.max(1.05, p.y));
  vrPanel.position.copy(p);
  vrPanel.lookAt(p.clone().add(_nrm));
  vrPanel.scale.set(PLACE.size, PLACE.size, 1);

  PLACE.mode = 'free';
  PLACE.free = { p: vrPanel.position.toArray(), q: vrPanel.quaternion.toArray() };
  vrPanel.material.depthTest = true;
  vrPanel.renderOrder = 0;
  savePlace();
  syncPlaceUI();
}

/* ------------------------------------------------ the placement panel */

function syncPlaceUI() {
  document.querySelectorAll('#placeWalls button').forEach(b => {
    const want = b.dataset.place;
    b.classList.toggle('on',
      PLACE.mode === 'head' ? want === 'head'
      : PLACE.mode === 'wall' ? want === PLACE.wall : false);
  });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('inAlong', PLACE.along);
  set('inHeight', PLACE.height);
  set('inSize', PLACE.size);
  const out = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  out('outAlong', PLACE.along === 0 ? 'centre'
      : (PLACE.along > 0 ? 'right ' : 'left ') + Math.round(Math.abs(PLACE.along) * 100) + '%');
  out('outHeight', PLACE.height.toFixed(2) + ' m');
  out('outSize', Math.round(PLACE.size * 100) + '%');
}

let placeOpen = false;

function showPlaceUI(on) {
  placeOpen = on === undefined ? !placeOpen : !!on;
  const ui = document.getElementById('placeUI');
  const tg = document.getElementById('placeToggle');
  if (ui) ui.hidden = !placeOpen;
  if (tg) tg.classList.toggle('on', placeOpen);
  if (placeOpen) {
    // show the board live so the placement can be judged on screen
    ensureVRPanel();
    drawVRPanel();
    syncPlaceUI();
  } else if (!renderer.xr.isPresenting && vrPanel) {
    vrPanel.visible = false;
  }
}""",
     'placement engine')


# ------------------------------------------- controller grip + selection

swap("""  c.addEventListener('squeezestart', () => cycleVRMode());   // grip = next placement""",
"""  c.addEventListener('squeezestart', () => toggleVRPlacing()); // grip = aim mode""",
     'grip handler')

swap("""function onVRSelect(c) {
  if (!state.started || state.finished) return;
  rayFromController(c);

  if (vrPanel && vrPanel.visible) {""",
"""function onVRSelect(c) {
  if (!state.started || state.finished) return;
  rayFromController(c);

  // aiming: the trigger sticks the board on whatever the ray lands on
  if (vrPlacing) {
    const surfaces = pickableRoots();
    if (room.refs.frontWall) surfaces.push(room.refs.frontWall);
    const hit = raycaster.intersectObjects(surfaces, true).find(h => h.face);
    if (hit) { stickPanelAt(hit); toggleVRPlacing(false); }
    return;
  }

  if (vrPanel && vrPanel.visible) {""",
     'onVRSelect aim branch')


# ======================================================= the VR board

swap("""  const c = document.createElement('canvas');
  c.width = 1024; c.height = 700;
  vrCtx = c.getContext('2d');
  vrTex = new THREE.CanvasTexture(c);
  vrTex.colorSpace = THREE.SRGBColorSpace;
  vrPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42, 0.98),
    new THREE.MeshBasicMaterial({ map: vrTex, transparent: true })
  );""",
"""  const c = document.createElement('canvas');
  c.width = VR_CW; c.height = VR_CH;
  vrCtx = c.getContext('2d');
  vrTex = new THREE.CanvasTexture(c);
  vrTex.colorSpace = THREE.SRGBColorSpace;
  vrPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(VR_PW, VR_PH),
    new THREE.MeshBasicMaterial({ map: vrTex, transparent: true })
  );""",
     'panel geometry')

swap("""function drawVRPanel() {
  ensureVRPanel();
  const g = vrCtx;
  const rtl = lang === 'ar';
  const W = 1024, H = 700, PAD = 40;
  vrRects = [];

  g.clearRect(0, 0, W, H);
  g.fillStyle = '#ffffff';   // opaque: a world-locked board must not ghost
  roundRect(g, 0, 0, W, H, 26); g.fill();

  g.direction = rtl ? 'rtl' : 'ltr';
  g.textAlign = rtl ? 'right' : 'left';
  const X = rtl ? W - PAD : PAD;
  const fam = rtl ? '"IBM Plex Sans Arabic", sans-serif' : 'Inter, system-ui, sans-serif';

  let y = PAD + 34;
  g.fillStyle = '#0f6b7d';
  g.font = `700 38px ${fam}`;
  g.fillText(t(current.label), X, y);
  // which placement is on screen, so the choice can be judged in the headset
  g.save();
  g.textAlign = rtl ? 'left' : 'right';
  g.fillStyle = '#9bb0bd';
  g.font = `600 19px ${fam}`;
  g.fillText(lang === 'ar' ? VR_PLACEMENTS[VR_MODE].label_ar : VR_PLACEMENTS[VR_MODE].label,
             rtl ? PAD : W - PAD, y);
  g.restore();
  y += 22;""",
"""/* the board is 1024 x 980; the bottom 290 px are the conversation strip,
   which has to hold every question she can be asked, three rows of them */
const VR_CW = 1024, VR_CH = 980, VR_STRIP = 690;
const VR_PW = 1.42, VR_PH = VR_PW * VR_CH / VR_CW;

function drawVRPanel() {
  ensureVRPanel();
  const g = vrCtx;
  const rtl = lang === 'ar';
  const W = VR_CW, H = VR_CH, PAD = 40;
  vrRects = [];

  g.clearRect(0, 0, W, H);
  // hung on a white hospital wall a white rectangle disappears, so the
  // board gets a frame, a drop shadow and a slightly cooler face
  g.save();
  g.shadowColor = 'rgba(8,30,40,.5)';
  g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.fillStyle = '#f6fafb';
  roundRect(g, 16, 8, W - 32, H - 34, 22); g.fill();
  g.restore();
  g.strokeStyle = '#0f6b7d'; g.lineWidth = 7;
  roundRect(g, 16, 8, W - 32, H - 34, 22); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2;
  roundRect(g, 23, 15, W - 46, H - 48, 17); g.stroke();

  g.direction = rtl ? 'rtl' : 'ltr';
  g.textAlign = rtl ? 'right' : 'left';
  const X = rtl ? W - PAD : PAD;
  const fam = rtl ? '"IBM Plex Sans Arabic", sans-serif' : 'Inter, system-ui, sans-serif';

  // nothing live yet — this is the preview a teacher positions before class
  if (!current) {
    g.fillStyle = '#0f6b7d'; g.font = `700 38px ${fam}`;
    g.fillText('Question board', X, PAD + 34);
    drawBoardLabel(g, fam, rtl, W, PAD);
    g.fillStyle = '#5d7686'; g.font = `400 26px ${fam}`;
    let py = PAD + 78;
    wrapText(g, 'Each safety question appears here inside the headset. Move it with the buttons at the bottom left, or aim a controller at a wall and pull the trigger.', W - PAD * 2)
      .forEach(l => { py += 36; g.fillText(l, X, py); });
    drawTalkStrip(g, fam, rtl, W, H, PAD);
    vrTex.needsUpdate = true;
    positionVRPanel();
    vrPanel.visible = true;
    return;
  }

  let y = PAD + 34;
  g.fillStyle = '#0f6b7d';
  g.font = `700 38px ${fam}`;
  g.fillText(t(current.label), X, y);
  drawBoardLabel(g, fam, rtl, W, PAD);
  y += 22;""",
     'drawVRPanel head')

swap("""  vrTex.needsUpdate = true;
  positionVRPanel();
  vrPanel.visible = true;
}

function roundRect(g, x, y, w, h, r) {""",
"""  drawTalkStrip(g, fam, rtl, W, H, PAD);
  vrTex.needsUpdate = true;
  positionVRPanel();
  vrPanel.visible = true;
}

/** Top-right corner: where the board currently is, and the aiming hint. */
function drawBoardLabel(g, fam, rtl, W, PAD) {
  g.save();
  g.textAlign = rtl ? 'left' : 'right';
  g.fillStyle = vrPlacing ? '#c26a00' : '#9bb0bd';
  g.font = `600 19px ${fam}`;
  g.fillText(vrPlacing ? 'Aim at a wall, pull the trigger' : placeLabel(),
             rtl ? PAD : W - PAD, PAD + 34);
  g.restore();
}

/** Bottom strip: what she last said, and the questions you can ask her. */
function drawTalkStrip(g, fam, rtl, W, H, PAD) {
  const top = VR_STRIP;
  g.save();
  g.strokeStyle = '#e2ebf0'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(PAD, top); g.lineTo(W - PAD, top); g.stroke();

  const X = rtl ? W - PAD : PAD;
  g.textAlign = rtl ? 'right' : 'left';

  g.fillStyle = '#0f6b7d'; g.font = `700 20px ${fam}`;
  g.fillText(t(PATIENT.name).split(' ')[0].toUpperCase(), X, top + 32);

  g.fillStyle = '#10222c'; g.font = `400 24px ${fam}`;
  const said = TALK.lastReply || 'Ask her something — pull the trigger on a question below.';
  wrapText(g, said, W - PAD * 2 - 140).slice(0, 2)
    .forEach((l, i) => g.fillText(l, X, top + 62 + i * 30));

  // every question she can be asked, wrapped across three rows
  let cx = PAD, cy = top + 128;
  g.font = `600 20px ${fam}`;
  for (const d of DIALOGUE) {
    if (!d.short) continue;
    const w = g.measureText(d.short).width + 30;
    if (cx + w > W - PAD) { cx = PAD; cy += 46; }
    if (cy + 38 > H - 14) break;
    const asked = TALK.asked.has(d.id);
    g.fillStyle = asked ? '#eef4f7' : '#f3f8fa';
    roundRect(g, cx, cy, w, 38, 19); g.fill();
    g.strokeStyle = asked ? '#dbe6ec' : '#bcd6de'; g.lineWidth = 2; g.stroke();
    g.fillStyle = asked ? '#7d94a1' : '#10222c';
    g.textAlign = 'center';
    g.fillText(d.short, cx + w / 2, cy + 26);
    g.textAlign = rtl ? 'right' : 'left';
    vrRects.push({ x: cx, y: cy, w, h: 38, action: 'ask', ask: d.id });
    cx += w + 9;
  }
  g.restore();
}

function roundRect(g, x, y, w, h, r) {""",
     'talk strip + board label')

swap("""      const px = hit.uv.x * 1024, py = (1 - hit.uv.y) * 700;
      const r = vrRects.find(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
      if (r) { r.action === 'close' ? closeTask() : answer(r.index); }
    }
    return;""",
"""      const px = hit.uv.x * VR_CW, py = (1 - hit.uv.y) * VR_CH;
      const r = vrRects.find(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
      if (r) {
        if (r.action === 'ask') askPatient(r.ask);
        else if (r.action === 'close') closeTask();
        else answer(r.index);
      }
      return;
    }
    // a miss on the board itself should not fall through to the room
    if (PLACE.mode !== 'head') { /* fall through — the board is on a wall */ }
    else return;""",
     'VR hit test')


# ==================================================== front wall in VR

swap("""  document.body.classList.add('in-vr');
  if (!state.started) { state.started = true; startTimer(); $('start').classList.remove('show'); }
  if (current) drawVRPanel();""",
"""  document.body.classList.add('in-vr');
  if (room.refs.frontWall) room.refs.frontWall.visible = true;
  if (!state.started) { state.started = true; startTimer(); $('start').classList.remove('show'); }
  drawVRPanel();""",
     'sessionstart')

swap("""  document.body.classList.remove('in-vr');
  if (vrPanel) vrPanel.visible = false;
  if (current) renderTask();""",
"""  document.body.classList.remove('in-vr');
  if (room.refs.frontWall) room.refs.frontWall.visible = false;
  toggleVRPlacing(false);
  if (vrPanel) vrPanel.visible = placeOpen;
  if (current) renderTask();""",
     'sessionend')

swap("""  if (vrPanel && vrPanel.visible && renderer.xr.isPresenting) positionVRPanel();""",
"""  if (vrPanel && vrPanel.visible) positionVRPanel();""",
     'render loop')


# ========================================================== boot wiring

swap("""(function () {
  const pick = document.getElementById('vrPick');
  if (!pick) return;
  pick.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => setVRMode(b.dataset.vr)));
  setVRMode(VR_MODE);
  const force = new URLSearchParams(location.search).has('vrtest');
  if (force) pick.hidden = false;
  else if (navigator.xr?.isSessionSupported)
    navigator.xr.isSessionSupported('immersive-vr')
      .then(ok => { if (ok) pick.hidden = false; }).catch(() => {});
})();

window.psim = { state, room, TASKS, camera, controls, renderer, camFly, setVRMode,
                focus: focusStation, _drawVRPanel: drawVRPanel, _vrPanel: () => vrPanel };""",
"""(function () {
  const tg = document.getElementById('placeToggle');
  if (tg) tg.addEventListener('click', () => showPlaceUI());
  const cl = document.getElementById('placeClose');
  if (cl) cl.addEventListener('click', () => showPlaceUI(false));

  document.querySelectorAll('#placeWalls button').forEach(b =>
    b.addEventListener('click', () => setPlace(
      b.dataset.place === 'head' ? { mode: 'head' }
                                 : { mode: 'wall', wall: b.dataset.place })));

  const slider = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const patch = {};
      patch[key] = parseFloat(el.value);
      if (PLACE.mode === 'head') patch.mode = 'wall';   // sliders imply a wall
      setPlace(patch);
    });
  };
  slider('inAlong', 'along');
  slider('inHeight', 'height');
  slider('inSize', 'size');

  const rs = document.getElementById('placeReset');
  if (rs) rs.addEventListener('click', () => {
    PLACE.free = null;
    setPlace(Object.assign({}, PLACE_DEFAULT));
  });

  // a teacher setting the room up before class should not need a URL
  addEventListener('keydown', e => {
    if (e.key === 'v' || e.key === 'V') {
      if (/^(input|textarea)$/i.test(e.target?.tagName || '')) return;
      showPlaceUI();
    }
  });

  syncPlaceUI();
  if (new URLSearchParams(location.search).has('place')) showPlaceUI(true);
})();

window.psim = { state, room, TASKS, camera, controls, renderer, camFly,
                PLACE, setPlace, showPlaceUI, TALK, askPatient, showVoice,
                focus: focusStation, _drawVRPanel: drawVRPanel, _vrPanel: () => vrPanel,
                _aim: on => toggleVRPlacing(on), _stick: hit => stickPanelAt(hit),
                _vrRects: () => vrRects };""",
     'boot wiring')

DST.write_text(html, encoding='utf-8')
print(f'\n{n_patches} patches applied -> {DST.name}  ({DST.stat().st_size/1024/1024:.2f} MB)')
