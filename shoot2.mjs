import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const DIR = '/tmp/claude-0/-home-claude/02ab11b2-0436-5cb4-827b-47271d2e83de/scratchpad/handoff';
const OUT = '/tmp/claude-0/-home-claude/02ab11b2-0436-5cb4-827b-47271d2e83de/scratchpad/shots';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--no-sandbox', '--disable-dev-shm-usage']
});

// where the nurse stands in the headset, what she turns to, and where the
// board goes on that wall
const VIEW = {
  right: { eye: [1.5, 1.62, 0.9],  look: [3.5, 1.70, -0.5], along: -0.12, size: 1.35, h: 1.72 },
  back:  { eye: [1.3, 1.62, 0.1],  look: [0.4, 1.95, -3.0], along: -0.55, size: 1.20, h: 2.00 },
  left:  { eye: [-1.0, 1.62, 1.0], look: [-3.5, 1.70, 1.9], along:  0.62, size: 1.30, h: 1.72 },
  front: { eye: [0.6, 1.62, -0.4], look: [-0.5, 1.72, 3.0], along:  0.18, size: 1.45, h: 1.75 }
};

async function shot(name, prep) {
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 850 }, offline: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log(name, 'ERR', e.message));
  await p.goto(`file://${DIR}/v2.html`, { waitUntil: 'load' });
  await p.waitForTimeout(9000);

  for (const sel of ['#welcomeContinue', '#startBtn']) {
    if (await p.$(sel)) { await p.click(sel).catch(() => {}); await p.waitForTimeout(700); }
  }
  try { await p.waitForFunction(() => !window.psim.camFly.on, null, { timeout: 60000, polling: 300 }); } catch {}
  await p.waitForTimeout(2000);

  // open the live station so a real question sits on the board
  const target = await p.evaluate(() => {
    const d = window.psim.state.done;
    const t = window.psim.TASKS.find(x => !d.has(x.id));
    return t ? t.target : null;
  });
  const pt = await p.evaluate(sid => {
    const g = window.psim.room.interactives.find(x => x.userData.id === sid);
    const i = g.userData.indicator;
    const w = i.getWorldPosition(new (i.position.constructor)());
    w.project(window.psim.camera);
    return { x: (w.x + 1) / 2 * innerWidth, y: (-w.y + 1) / 2 * innerHeight,
             on: Math.abs(w.x) <= 1 && Math.abs(w.y) <= 1 };
  }, target);
  if (pt.on) { await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(900); }

  await prep(p);
  await p.waitForTimeout(4500);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
  await ctx.close();
}

/* 1 — on a laptop: the board on the right wall, the placement controls and
      the conversation with the patient, all live at once */
await shot('W1-desktop', async p => {
  await p.evaluate(v => {
    const ps = window.psim;
    ps.setPlace({ mode: 'wall', wall: 'right', along: v.along, height: v.h, size: v.size });
    ps.showPlaceUI(true);
    ps.showVoice(true);
    ps.askPatient('pain');
    // hide the chrome that would sit on top of the board in this framing
    ['modal', 'side'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    ps._drawVRPanel();
    ps.camera.position.set(-0.9, 1.92, 1.25);
    ps.controls.target.set(3.4, 1.62, -0.5);
    ps.controls.update();
  }, VIEW.right);
});

/* 2-5 — what the wearer sees, with the board on each of the four walls */
for (const wall of ['right', 'back', 'left', 'front']) {
  await shot(`W2-vr-${wall}`, async p => {
    await p.evaluate(([w, v]) => {
      const ps = window.psim;
      ps.setPlace({ mode: 'wall', wall: w, along: v.along, height: v.h, size: v.size });
      ps.askPatient('callbell');
      ps.room.refs.frontWall.visible = true;    // the headset sees all four walls
      document.querySelectorAll('#modal,#side,#hud,#toast,#welcome,#start,#placeUI,#placeToggle,#voiceBar,#voiceToggle')
        .forEach(el => el && (el.style.display = 'none'));
      ps.camera.fov = 84;
      ps.camera.updateProjectionMatrix();
      ps.camera.position.set(...v.eye);
      ps.controls.minDistance = 0.1;
      ps.controls.maxDistance = 40;
      ps.controls.target.set(...v.look);
      ps.controls.update();
      ps._drawVRPanel();
    }, [wall, VIEW[wall]]);
    await p.waitForTimeout(2500);
    await p.evaluate(() => window.psim._drawVRPanel());
  });
}

await browser.close();
