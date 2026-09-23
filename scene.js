/* =========================================================================
   scene.js — builds the 3D patient room.
   بناء غرفة المريض ثلاثية الأبعاد.

   Everything the simulation can be clicked on is registered with
   markInteractive(group, id). The engine in app.js finds it by that id.
   ========================================================================= */

import * as THREE from 'three';

/* ------------------------------------------------------------- materials */

const M = {
  floor:    () => new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.55, metalness: 0.02 }),
  wall:     () => new THREE.MeshStandardMaterial({ color: 0xeef3f6, roughness: 0.95 }),
  wallLow:  () => new THREE.MeshStandardMaterial({ color: 0xd3e2ea, roughness: 0.9 }),
  ceiling:  () => new THREE.MeshStandardMaterial({ color: 0xf7fafc, roughness: 1 }),
  metal:    (c = 0xb9c2c9) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.75 }),
  plastic:  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.05 }),
  linen:    (c = 0xf4f7fa) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
  skin:     () => new THREE.MeshStandardMaterial({ color: 0xe0ac86, roughness: 0.75 }),
  glass:    (c, o = 0.45) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.15, metalness: 0.1, transparent: true, opacity: o }),
  emissive: (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9, roughness: 1 })
};

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#dfe6ea'; g.fillRect(0, 0, 256, 256);
  // speckled vinyl
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${140 + Math.random() * 70 | 0},${150 + Math.random() * 70 | 0},${160 + Math.random() * 70 | 0},.35)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  g.strokeStyle = 'rgba(150,165,175,.55)'; g.lineWidth = 2;
  g.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 7);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* -------------------------------------------------------------- helpers  */

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* Pulsing marker that tells the student "this is interactive".
   العلامة النابضة التي تدل الطالب على العناصر القابلة للنقر. */
function indicatorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 128, 128);
  g.beginPath(); g.arc(64, 64, 44, 0, Math.PI * 2);
  g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke();
  g.beginPath(); g.arc(64, 64, 36, 0, Math.PI * 2);
  g.lineWidth = 13; g.strokeStyle = '#fff'; g.stroke();
  g.beginPath(); g.arc(64, 64, 15, 0, Math.PI * 2);
  g.fillStyle = '#fff'; g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
let INDICATOR_TEX = null;

export const STATE_COLOR = {
  pending: 0xffb020,
  locked:  0x94a3b8,
  done:    0x22c55e
};

/* ========================================================================= */

export function buildRoom(scene) {

  INDICATOR_TEX = indicatorTexture();

  const interactives = [];   // clickable groups
  const refs = {};           // named handles the engine animates

  /* register a group as clickable ------------------------------------- */
  function markInteractive(group, id, anchorY = 0.4) {
    // give it its own materials so highlighting one item never tints another
    group.traverse(o => { if (o.isMesh && o.material) o.material = o.material.clone(); });

    const spriteMat = new THREE.SpriteMaterial({
      map: INDICATOR_TEX, color: STATE_COLOR.pending,
      depthTest: false, depthWrite: false, transparent: true, opacity: 0.95
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.setScalar(0.17);
    sprite.position.y = anchorY;
    sprite.renderOrder = 999;
    sprite.userData.isIndicator = true;
    group.add(sprite);

    group.userData.interactive = true;
    group.userData.id = id;
    group.userData.indicator = sprite;
    group.userData.state = 'pending';
    interactives.push(group);
    return group;
  }

  /* --------------------------------------------------------- shell ---- */

  const ROOM_W = 7, ROOM_D = 6, ROOM_H = 3;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), M.floor());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), M.ceiling());
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM_H;
  scene.add(ceiling);

  // back wall + dado rail band
  const back = box(ROOM_W, ROOM_H, 0.1, M.wall(), 0, ROOM_H / 2, -ROOM_D / 2);
  scene.add(back);
  scene.add(box(ROOM_W, 0.9, 0.04, M.wallLow(), 0, 0.45, -ROOM_D / 2 + 0.06));

  const left = box(0.1, ROOM_H, ROOM_D, M.wall(), -ROOM_W / 2, ROOM_H / 2, 0);
  scene.add(left);
  scene.add(box(0.04, 0.9, ROOM_D, M.wallLow(), -ROOM_W / 2 + 0.06, 0.45, 0));

  const right = box(0.1, ROOM_H, ROOM_D, M.wall(), ROOM_W / 2, ROOM_H / 2, 0);
  scene.add(right);
  scene.add(box(0.04, 0.9, ROOM_D, M.wallLow(), ROOM_W / 2 - 0.06, 0.45, 0));

  // window on the back wall — the room's light source
  const winGroup = new THREE.Group();
  winGroup.position.set(2.45, 1.65, -ROOM_D / 2 + 0.06);
  winGroup.add(box(1.7, 1.25, 0.06, M.metal(0xdde5ea), 0, 0, 0));
  const pane = box(1.55, 1.1, 0.02, new THREE.MeshBasicMaterial({ color: 0xdff0ff }), 0, 0, 0.04);
  pane.castShadow = false;
  winGroup.add(pane);
  winGroup.add(box(0.04, 1.1, 0.03, M.metal(0xdde5ea), 0, 0, 0.05));
  scene.add(winGroup);

  // ceiling light panel
  const panel = box(1.5, 0.05, 0.5, new THREE.MeshBasicMaterial({ color: 0xfbfbf2 }), -0.3, ROOM_H - 0.05, -0.6);
  panel.castShadow = false; panel.receiveShadow = false;
  scene.add(panel);

  /* ----------------------------------------------------------- bed ---- */

  const BED_X = -0.3, BED_Z = -1.2;
  const DECK_HIGH = 0.60, DECK_LOW = 0.40;

  const bed = new THREE.Group();
  bed.position.set(BED_X, 0, BED_Z);
  scene.add(bed);

  // base + castors
  bed.add(box(1.7, 0.08, 0.5, M.metal(0x70808b), 0, 0.1, 0));
  [[-0.78, 0.22], [0.78, 0.22], [-0.78, -0.22], [0.78, -0.22]].forEach(([x, z]) => {
    const w = cyl(0.05, 0.05, 0.045, M.plastic(0x3c4650), x, 0.05, z, 12);
    w.rotation.z = Math.PI / 2;
    bed.add(w);
  });

  // telescoping columns — these stretch when the bed is raised/lowered
  const colGeo = new THREE.BoxGeometry(0.15, 1, 0.15);
  colGeo.translate(0, 0.5, 0);
  const COL_BASE = 0.13;
  const columns = [-0.55, 0.55].map(x => {
    const c = new THREE.Mesh(colGeo, M.metal(0x98a5ad));
    c.position.set(x, COL_BASE, 0);
    c.scale.y = DECK_HIGH - COL_BASE;
    c.castShadow = true;
    bed.add(c);
    return c;
  });

  // brake pedal at the foot — clickable (bed height + brakes)
  const bedControl = new THREE.Group();
  bedControl.position.set(0.88, 0, 0);
  bedControl.add(box(0.08, 0.42, 0.08, M.metal(0x8f9ba3), 0, 0.28, 0));
  bedControl.add(box(0.17, 0.04, 0.26, M.plastic(0xd94f3d), 0.02, 0.13, 0));   // brake pedal
  bedControl.add(box(0.16, 0.12, 0.1, M.plastic(0x2f3a44), 0, 0.55, 0));       // handset
  bed.add(bedControl);
  markInteractive(bedControl, 'bedcontrol', 0.95);

  // deck — everything that moves up and down with the bed
  const deck = new THREE.Group();
  deck.position.y = DECK_HIGH;
  bed.add(deck);

  deck.add(box(2.1, 0.09, 0.95, M.metal(0xc8d2d8), 0, 0.045, 0));
  deck.add(box(2.0, 0.17, 0.86, M.linen(0xeef3f7), 0, 0.17, 0));          // mattress
  deck.add(box(0.42, 0.12, 0.62, M.linen(0xffffff), -0.84, 0.315, 0));    // pillow
  deck.add(box(0.12, 0.45, 0.95, M.metal(0xdbe4e9), -1.08, 0.24, 0));     // head board
  deck.add(box(0.1, 0.34, 0.95, M.metal(0xdbe4e9), 1.06, 0.2, 0));        // foot board

  /* rails ------------------------------------------------------------- */
  function railMesh() {
    const g = new THREE.Group();
    const mat = M.metal(0xc3ccd2);
    g.add(box(0.85, 0.05, 0.035, mat, 0, 0.22, 0));
    g.add(box(0.85, 0.04, 0.03, mat, 0, 0.08, 0));
    g.add(box(0.04, 0.2, 0.03, mat, -0.4, 0.14, 0));
    g.add(box(0.04, 0.2, 0.03, mat, 0.4, 0.14, 0));
    g.add(box(0.78, 0.1, 0.012, M.glass(0xdfe9ef, 0.35), 0, 0.15, 0));
    return g;
  }

  const railFar = railMesh();                 // already correctly raised
  railFar.position.set(-0.2, 0.26, -0.47);
  deck.add(railFar);

  const railNear = railMesh();                // dropped — the hazard
  railNear.position.set(-0.2, -0.12, 0.47);
  deck.add(railNear);
  markInteractive(railNear, 'rail', 0.5);

  /* patient ----------------------------------------------------------- */
  const patient = new THREE.Group();
  patient.position.y = 0.26;
  deck.add(patient);

  const gown = M.linen(0x67b3bd);

  patient.add(box(0.62, 0.28, 0.42, gown, -0.45, 0.15, 0));               // chest
  patient.add(box(0.95, 0.22, 0.40, gown, 0.38, 0.12, 0));                // hips + legs
  patient.add(box(0.14, 0.13, 0.15, M.linen(0xe8eef2), 0.9, 0.2, -0.1));  // feet
  patient.add(box(0.14, 0.13, 0.15, M.linen(0xe8eef2), 0.9, 0.2, 0.1));

  // blanket drawn up to the chest, with a turned-down white edge
  patient.add(box(1.20, 0.14, 0.90, M.linen(0xc9d9e4), 0.32, 0.19, 0));
  patient.add(box(0.12, 0.15, 0.91, M.linen(0xffffff), -0.24, 0.20, 0));

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 18), M.skin());
  head.position.set(-0.88, 0.17, 0);
  head.castShadow = true;
  patient.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.128, 20, 16), M.plastic(0x3b2b23));
  hair.position.set(-0.92, 0.19, 0);
  hair.scale.set(1, 0.88, 1.02);
  patient.add(hair);

  // arms resting on top of the blanket
  function arm(z, withBand) {
    patient.add(box(0.42, 0.095, 0.105, gown, -0.52, 0.27, z));          // sleeve
    patient.add(box(0.44, 0.085, 0.092, M.skin(), -0.08, 0.285, z));      // forearm
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), M.skin());
    hand.position.set(0.17, 0.285, z);
    hand.castShadow = true;
    patient.add(hand);
    if (!withBand) return;

    const wristband = new THREE.Group();
    wristband.position.set(0.07, 0.285, z);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.017, 10, 22), M.plastic(0xffffff));
    band.rotation.y = Math.PI / 2;
    band.castShadow = true;
    wristband.add(band);
    wristband.add(box(0.022, 0.04, 0.085, M.plastic(0x1f6feb), 0, 0.058, 0));
    patient.add(wristband);
    markInteractive(wristband, 'wristband', 0.28);

    // cannula site — red while it is phlebitic
    const cannula = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), M.plastic(0xd0342c));
    cannula.scale.set(1, 0.45, 1);
    cannula.position.set(-0.12, 0.325, z);
    patient.add(cannula);
    refs.cannula = cannula;
  }
  arm(0.25, true);     // near side — wristband and cannula
  arm(-0.25, false);

  /* --------------------------------------------------------- IV pole -- */

  const iv = new THREE.Group();
  iv.position.set(-1.75, 0, -0.55);
  scene.add(iv);
  iv.add(cyl(0.16, 0.18, 0.04, M.metal(0x8b979f), 0, 0.03, 0, 18));
  iv.add(cyl(0.022, 0.022, 1.95, M.metal(0xc6ced3), 0, 1.0, 0, 12));
  iv.add(box(0.26, 0.03, 0.03, M.metal(0xc6ced3), 0.1, 1.93, 0));
  const ivBag = box(0.2, 0.34, 0.07, M.glass(0xb9e6f2, 0.75), 0.2, 1.72, 0);
  iv.add(ivBag);
  iv.add(box(0.06, 0.05, 0.05, M.glass(0xd8f2f8, 0.8), 0.2, 1.5, 0));
  iv.add(cyl(0.008, 0.008, 1.0, M.glass(0xcfe8f0, 0.7), 0.2, 1.0, 0, 8));
  iv.add(box(0.13, 0.1, 0.05, M.plastic(0x33414d), 0.2, 0.45, 0));
  markInteractive(iv, 'ivpole', 2.15);

  /* -------------------------------------------------------- monitor --- */

  const monitor = new THREE.Group();
  monitor.position.set(-1.35, 1.72, -ROOM_D / 2 + 0.1);
  scene.add(monitor);
  monitor.add(box(0.78, 0.56, 0.1, M.plastic(0x1d252c), 0, 0, 0));
  const mCanvas = document.createElement('canvas');
  mCanvas.width = 512; mCanvas.height = 352;
  const mCtx = mCanvas.getContext('2d');
  const mTex = new THREE.CanvasTexture(mCanvas);
  mTex.colorSpace = THREE.SRGBColorSpace;
  const mScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.46),
    new THREE.MeshBasicMaterial({ map: mTex }));
  mScreen.position.z = 0.051;
  monitor.add(mScreen);
  monitor.add(box(0.1, 0.06, 0.3, M.metal(0x6d7a84), 0, -0.3, -0.05));
  markInteractive(monitor, 'monitor', 0.45);

  /* ------------------------------------------------- bedside table ---- */

  const table = new THREE.Group();
  table.position.set(1.35, 0, -1.9);
  scene.add(table);
  table.add(box(0.5, 0.62, 0.45, M.plastic(0xd9c3a0), 0, 0.33, 0));
  table.add(box(0.56, 0.04, 0.5, M.plastic(0xe9dcc4), 0, 0.66, 0));
  table.add(box(0.42, 0.02, 0.36, M.plastic(0xc0a884), 0, 0.5, 0.23));
  table.add(box(0.2, 0.22, 0.2, M.glass(0xe9f6fa, 0.6), 0.15, 0.78, 0.05));   // water jug

  // patient chart / clipboard — clickable
  const chart = new THREE.Group();
  chart.position.set(-0.05, 0.7, -0.02);
  chart.rotation.set(-0.35, 0.3, 0);
  chart.add(box(0.3, 0.015, 0.4, M.plastic(0x3d4b57), 0, 0, 0));
  chart.add(box(0.27, 0.012, 0.36, M.linen(0xfdfdfd), 0, 0.014, 0.01));
  chart.add(box(0.1, 0.02, 0.04, M.metal(0xa9b4bc), 0, 0.024, -0.17));
  for (let i = 0; i < 5; i++)
    chart.add(box(0.19, 0.002, 0.008, M.plastic(0x9aa7b2), -0.01, 0.022, 0.07 - i * 0.05));
  table.add(chart);
  markInteractive(chart, 'chart', 0.3);

  /* ------------------------------------------------ medication trolley  */

  const trolley = new THREE.Group();
  trolley.position.set(2.05, 0, -0.5);
  scene.add(trolley);
  trolley.add(box(0.58, 0.72, 0.46, M.plastic(0xdfe6ea), 0, 0.46, 0));
  trolley.add(box(0.64, 0.04, 0.52, M.metal(0xc3ccd2), 0, 0.84, 0));
  for (let i = 0; i < 3; i++) {
    trolley.add(box(0.5, 0.18, 0.02, M.plastic(0xa8b6c0), 0, 0.26 + i * 0.22, 0.235));
    trolley.add(box(0.16, 0.025, 0.03, M.metal(0x8b979f), 0, 0.26 + i * 0.22, 0.25));
  }
  [[-0.22, 0.17], [0.22, 0.17], [-0.22, -0.17], [0.22, -0.17]].forEach(([x, z]) =>
    trolley.add(cyl(0.045, 0.045, 0.03, M.plastic(0x2b3440), x, 0.05, z, 10)));
  trolley.add(box(0.3, 0.02, 0.24, M.plastic(0xf0f4f7), -0.1, 0.87, 0));       // tray
  trolley.add(cyl(0.045, 0.045, 0.14, M.glass(0xeef6fa, 0.85), -0.14, 0.93, 0, 14)); // vial
  trolley.add(cyl(0.046, 0.046, 0.02, M.plastic(0x2f7fd0), -0.14, 1.01, 0, 14));
  trolley.add(box(0.14, 0.012, 0.1, M.plastic(0xffffff), 0.06, 0.87, 0));      // label
  markInteractive(trolley, 'trolley', 1.25);

  /* ------------------------------------------- wall-mounted equipment -- */

  // alcohol hand rub dispenser — on the back wall so it is in view from the start
  const sanitizer = new THREE.Group();
  sanitizer.position.set(1.15, 1.5, -ROOM_D / 2 + 0.12);
  sanitizer.rotation.y = -Math.PI / 2;
  scene.add(sanitizer);
  sanitizer.add(box(0.06, 0.34, 0.16, M.plastic(0xf2f6f8), 0, 0, 0));
  sanitizer.add(box(0.05, 0.2, 0.11, M.glass(0xdff3e6, 0.8), -0.03, 0.02, 0));
  sanitizer.add(box(0.07, 0.04, 0.1, M.plastic(0x2f9e5f), -0.04, -0.17, 0));
  sanitizer.add(box(0.012, 0.1, 0.13, M.plastic(0x1f8a52), -0.05, 0.12, 0));
  markInteractive(sanitizer, 'sanitizer', 0.3);

  // sharps bin — wall bracket next to the dispenser
  const sharps = new THREE.Group();
  sharps.position.set(0.42, 1.08, -ROOM_D / 2 + 0.2);
  sharps.rotation.y = -Math.PI / 2;
  scene.add(sharps);
  sharps.add(box(0.26, 0.34, 0.26, M.plastic(0xf2c033), 0, 0, 0));
  sharps.add(box(0.28, 0.08, 0.28, M.plastic(0xd94f3d), 0, 0.2, 0));
  sharps.add(box(0.12, 0.012, 0.16, M.plastic(0x2b3440), 0, 0.245, 0));
  sharps.add(box(0.005, 0.16, 0.18, M.plastic(0xffffff), -0.132, -0.02, 0));
  markInteractive(sharps, 'sharps', 0.42);

  // computer on wheels — the documentation station (left wall, screen facing the bed)
  const workstation = new THREE.Group();
  workstation.position.set(-ROOM_W / 2 + 0.55, 0, -0.35);
  workstation.rotation.y = Math.PI / 2;          // built facing +z, turned to face the room
  scene.add(workstation);
  workstation.add(cyl(0.2, 0.22, 0.05, M.metal(0x8b979f), 0, 0.04, 0, 18));
  workstation.add(cyl(0.05, 0.05, 1.05, M.metal(0xb6c0c7), 0, 0.55, 0, 12));
  workstation.add(box(0.5, 0.03, 0.3, M.plastic(0xdfe6ea), 0, 1.06, 0.13));
  workstation.add(box(0.38, 0.012, 0.16, M.plastic(0x33414d), 0, 1.08, 0.15));
  workstation.add(box(0.5, 0.34, 0.03, M.plastic(0x222b33), 0, 1.34, 0));
  const wsScreen = box(0.44, 0.28, 0.01, new THREE.MeshBasicMaterial({ color: 0x2f6f9e }), 0, 1.34, 0.021);
  wsScreen.castShadow = false;
  workstation.add(wsScreen);
  markInteractive(workstation, 'workstation', 1.66);

  // call bell — on the floor where it has slipped
  const callbell = new THREE.Group();
  callbell.position.set(0.55, 0.05, -0.45);
  scene.add(callbell);
  callbell.add(box(0.1, 0.05, 0.17, M.plastic(0xf2f4f6), 0, 0, 0));
  callbell.add(cyl(0.022, 0.022, 0.012, M.plastic(0xd94f3d), 0, 0.03, -0.03, 12));
  const cord = cyl(0.007, 0.007, 0.42, M.plastic(0xc3ccd2), -0.12, 0.01, 0.17, 8);
  cord.rotation.set(Math.PI / 2, 0, 0.7);
  callbell.add(cord);
  markInteractive(callbell, 'callbell', 0.28);

  /* ---------------------------------------------------------- lights -- */

  scene.add(new THREE.HemisphereLight(0xf2f8ff, 0x8f9fad, 0.85));
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));

  const sun = new THREE.DirectionalLight(0xfff4e2, 1.25);
  sun.position.set(3.2, 4.2, -2.2);
  sun.castShadow = true;
  // 1024 keeps phones and tablets comfortable; the room is small enough that
  // a bigger map buys almost nothing
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5;   sun.shadow.camera.bottom = -5;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 16;
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xdcecff, 0.38);
  fill.position.set(-2.5, 3.5, 3);
  scene.add(fill);

  /* ------------------------------------------------- monitor drawing -- */

  const trace = new Array(170).fill(0);
  let beatClock = 0;

  function drawMonitor(vitals, t, dt) {
    // scroll an ECG-ish trace
    beatClock += dt;
    const period = 60 / vitals.hr;
    let v = 0;
    const p = (beatClock % period) / period;
    if (p < 0.06) v = Math.sin(p / 0.06 * Math.PI) * 0.18;
    else if (p < 0.10) v = -0.22;
    else if (p < 0.14) v = 1.0;
    else if (p < 0.18) v = -0.35;
    else if (p < 0.30) v = Math.sin((p - 0.18) / 0.12 * Math.PI) * 0.26;
    trace.push(v); trace.shift();

    mCtx.fillStyle = '#05090d';
    mCtx.fillRect(0, 0, 512, 352);

    mCtx.strokeStyle = 'rgba(70,120,150,.18)';
    mCtx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) { mCtx.beginPath(); mCtx.moveTo(x, 0); mCtx.lineTo(x, 352); mCtx.stroke(); }
    for (let y = 0; y <= 352; y += 32) { mCtx.beginPath(); mCtx.moveTo(0, y); mCtx.lineTo(512, y); mCtx.stroke(); }

    mCtx.strokeStyle = '#43e07a';
    mCtx.lineWidth = 2.6;
    mCtx.beginPath();
    trace.forEach((val, i) => {
      const x = i * (340 / trace.length);
      const y = 78 - val * 52;
      i ? mCtx.lineTo(x, y) : mCtx.moveTo(x, y);
    });
    mCtx.stroke();

    // pleth wave
    mCtx.strokeStyle = '#4ea8ff';
    mCtx.lineWidth = 2.2;
    mCtx.beginPath();
    for (let i = 0; i < 170; i++) {
      const ph = (i / 170) * 6 + t * 1.6;
      const y = 178 - (Math.max(0, Math.sin(ph)) ** 1.7) * 34;
      i ? mCtx.lineTo(i * 2, y) : mCtx.moveTo(i * 2, y);
    }
    mCtx.stroke();

    const rows = [
      ['HR',   String(vitals.hr),      '#43e07a', 26],
      ['SpO2', vitals.spo2 + '%',      '#4ea8ff', 96],
      ['RR',   String(vitals.rr),      '#f3e05a', 166],
      ['NIBP', vitals.bp,              '#ff8c6b', 236],
      ['TEMP', vitals.temp.toFixed(1), '#ff6b8c', 300]
    ];
    mCtx.textAlign = 'right';
    rows.forEach(([label, value, color, y]) => {
      mCtx.fillStyle = color;
      mCtx.font = '600 17px system-ui, sans-serif';
      mCtx.fillText(label, 512 - 14, y - 26);
      mCtx.font = '700 42px system-ui, sans-serif';
      mCtx.fillText(value, 512 - 14, y + 14);
    });

    mCtx.textAlign = 'left';
    mCtx.fillStyle = '#8fa6b6';
    mCtx.font = '600 15px system-ui, sans-serif';
    mCtx.fillText('BED 2   ADULT', 12, 330);
    mTex.needsUpdate = true;
  }

  /* --------------------------------------------------------- effects -- */

  const effects = {
    /* raise the dropped side rail */
    raiseRail() {
      animate(railNear.position, { y: 0.26 }, 550);
    },
    /* drop the bed to its lowest safe height */
    lowerBed() {
      animate(deck.position, { y: DECK_LOW }, 700);
      columns.forEach(c => animate(c.scale, { y: DECK_LOW - COL_BASE }, 700));
      bedControl.children[1].material.color.set(0x2f9e5f);   // brake pedal locks green
    },
    /* put the call bell back in the patient's hand */
    placeBell() {
      callbell.rotation.set(0, 0, 0);
      animate(callbell.position, { x: -0.05, y: 0.94, z: -0.85 }, 650);
    },
    /* clean hands */
    sanitize() {
      const btn = sanitizer.children[2].material;
      btn.color.set(0x43e07a);
      btn.emissive.set(0x1f8a52);
      btn.emissiveIntensity = 0.8;
    },
    /* re-sited cannula — the phlebitic site is gone */
    fixIV() {
      refs.cannula.material.color.set(0xe0ac86);
      refs.cannula.scale.set(0.7, 0.25, 0.7);
      ivBag.material.color.set(0xcfeff7);
    }
  };

  /* tiny tween helper — no animation library needed */
  const tweens = [];
  function animate(target, to, ms) {
    const from = {};
    Object.keys(to).forEach(k => from[k] = target[k]);
    tweens.push({ target, from, to, ms, t: 0 });
  }
  function stepTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt * 1000;
      const p = Math.min(1, tw.t / tw.ms);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;   // easeInOutCubic
      Object.keys(tw.to).forEach(k => {
        tw.target[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      });
      if (p === 1) tweens.splice(i, 1);
    }
  }

  /* reset everything for a second run */
  function reset() {
    tweens.length = 0;
    railNear.position.y = -0.12;
    deck.position.y = DECK_HIGH;
    columns.forEach(c => c.scale.y = DECK_HIGH - COL_BASE);
    bedControl.children[1].material.color.set(0xd94f3d);
    callbell.position.set(0.55, 0.05, -0.45);
    const btn = sanitizer.children[2].material;
    btn.color.set(0x2f9e5f); btn.emissive.set(0x000000); btn.emissiveIntensity = 1;
    refs.cannula.material.color.set(0xd0342c);
    refs.cannula.scale.set(1, 0.45, 1);
    ivBag.material.color.set(0xb9e6f2);
  }

  return {
    interactives,
    refs,
    effects,
    reset,
    update(vitals, t, dt) {
      stepTweens(dt);
      drawMonitor(vitals, t, dt);
    },
    focusPoint: new THREE.Vector3(BED_X, 0.95, BED_Z)
  };
}
