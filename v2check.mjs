import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const DIR = '/tmp/claude-0/-home-claude/02ab11b2-0436-5cb4-827b-47271d2e83de/scratchpad/handoff';
const OUT = '/tmp/claude-0/-home-claude/02ab11b2-0436-5cb4-827b-47271d2e83de/scratchpad/shots';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--no-sandbox', '--disable-dev-shm-usage']
});

const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, offline: true });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

await p.goto(`file://${DIR}/v2.html`, { waitUntil: 'load' });
await p.waitForTimeout(9000);

const ok = [], bad = [];
const check = (n, c, x = '') => (c ? ok : bad).push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`);

const boot = await p.evaluate(() => ({
  psim: typeof window.psim === 'object',
  tasks: window.psim?.TASKS?.length ?? -1,
  place: window.psim?.PLACE ? JSON.stringify(window.psim.PLACE) : 'none',
  talk: window.psim?.TALK ? window.psim.TALK.sttOK + '/' + window.psim.TALK.ttsOK : 'none',
  frontWall: !!window.psim?.room?.refs?.frontWall,
  progress: document.getElementById('statProgress').textContent
}));
console.log('BOOT', JSON.stringify(boot));
check('boots without errors', errs.length === 0, errs.slice(0, 3).join(' | '));
check('psim exposed with 7 tasks', boot.psim && boot.tasks === 7, String(boot.tasks));
check('placement state present', boot.place !== 'none', boot.place);
check('front wall exists for VR', boot.frontWall);
check('header count is not 0/9', boot.progress !== '0/9', boot.progress);

// get past the welcome / start screens
for (const sel of ['#welcomeContinue', '#startBtn']) {
  if (await p.$(sel)) { await p.click(sel).catch(() => {}); await p.waitForTimeout(700); }
}
try { await p.waitForFunction(() => !window.psim.camFly.on, null, { timeout: 60000, polling: 300 }); } catch {}
await p.waitForTimeout(1500);

/* ----------------------------------------------- the placement panel */

await p.keyboard.press('v');
await p.waitForTimeout(800);
check('V opens the placement panel', await p.isVisible('#placeUI'));
check('board previews on screen', await p.evaluate(() => !!window.psim._vrPanel()?.visible));

const seen = {};
for (const w of ['back', 'right', 'left', 'front', 'head']) {
  await p.click(`#placeWalls button[data-place="${w}"]`);
  await p.waitForTimeout(500);
  seen[w] = await p.evaluate(() => {
    const v = window.psim._vrPanel();
    return v.position.toArray().map(n => +n.toFixed(2)).join(',');
  });
}
console.log('POSITIONS', JSON.stringify(seen, null, 0));
const uniq = new Set(Object.values(seen));
check('every wall moves the board somewhere different', uniq.size === 5, [...uniq].join(' | '));

// sliders
await p.click('#placeWalls button[data-place="back"]');
await p.waitForTimeout(300);
const beforeH = await p.evaluate(() => window.psim._vrPanel().position.y);
await p.evaluate(() => {
  const el = document.getElementById('inHeight');
  el.value = '2.3'; el.dispatchEvent(new Event('input', { bubbles: true }));
});
await p.waitForTimeout(400);
const afterH = await p.evaluate(() => window.psim._vrPanel().position.y);
check('height slider raises the board', afterH > beforeH + 0.3, `${beforeH.toFixed(2)} -> ${afterH.toFixed(2)}`);

await p.evaluate(() => {
  const el = document.getElementById('inAlong');
  el.value = '-0.9'; el.dispatchEvent(new Event('input', { bubbles: true }));
  const s = document.getElementById('inSize');
  s.value = '1.9'; s.dispatchEvent(new Event('input', { bubbles: true }));
});
await p.waitForTimeout(400);
const moved = await p.evaluate(() => ({
  x: window.psim._vrPanel().position.x,
  s: window.psim._vrPanel().scale.x,
  saved: localStorage.getItem('psim.place')
}));
check('along slider slides it across the wall', moved.x < -0.5, 'x=' + moved.x.toFixed(2));
check('size slider scales it', moved.s > 1.7, 's=' + moved.s.toFixed(2));
check('the choice is saved', !!moved.saved && moved.saved.includes('2.3'), moved.saved);

// and it comes back after a reload
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(8000);
const restored = await p.evaluate(() => JSON.stringify(window.psim.PLACE));
check('placement survives a reload', restored.includes('2.3'), restored);

for (const sel of ['#welcomeContinue', '#startBtn']) {
  if (await p.$(sel)) { await p.click(sel).catch(() => {}); await p.waitForTimeout(700); }
}
try { await p.waitForFunction(() => !window.psim.camFly.on, null, { timeout: 60000, polling: 300 }); } catch {}
await p.waitForTimeout(1200);

/* ------------------------------------------------------- point-and-place */

const stuck = await p.evaluate(() => {
  const ps = window.psim;
  ps.showPlaceUI(true);
  const T = ps.renderer.domElement.__proto__ ? null : null;
  // simulate a controller ray hitting the left wall
  const THREE_V = ps.camera.position.constructor;
  const hit = {
    object: ps.room.refs.frontWall,
    point: new THREE_V(-1.2, 1.7, 3.0),
    face: { normal: new THREE_V(0, 0, -1) }
  };
  ps.room.refs.frontWall.updateMatrixWorld(true);
  ps._stick(hit);
  const v = ps._vrPanel();
  return { mode: ps.PLACE.mode, pos: v.position.toArray().map(n => +n.toFixed(2)) };
});
console.log('STUCK', JSON.stringify(stuck));
check('pointing at a surface sticks the board there',
      stuck.mode === 'free' && Math.abs(stuck.pos[0] + 1.2) < 0.2 && stuck.pos[2] < 3.0,
      JSON.stringify(stuck));

/* ------------------------------------------------------------- voice */

await p.evaluate(() => window.psim.showPlaceUI(false));
await p.click('#voiceToggle');
await p.waitForTimeout(500);
check('the talk bar opens', await p.isVisible('#voiceBar'));
const nChips = (await p.$$('#vChips button')).length;
check('every question has a chip', nChips === 12, nChips + ' chips');

await p.click('#vChips button[data-ask="allergy"]');
await p.waitForTimeout(500);
const reply = await p.textContent('#vHerText');
check('asking about allergies gets the penicillin answer', /penicillin/i.test(reply), reply);

const free = await p.evaluate(() => {
  const out = {};
  for (const q of ['what is your date of birth', 'how bad is the pain', 'can you reach your call bell',
                   'I am going to give you something for the fever is that alright',
                   'وش اسمك الكامل', 'عندك حساسية']) {
    window.psim.askPatient(q);
    out[q.slice(0, 26)] = document.getElementById('vHerText').textContent.slice(0, 40);
  }
  return out;
});
console.log('FREE TEXT\n' + Object.entries(free).map(([k, v]) => '  ' + k + '  ->  ' + v).join('\n'));
check('spoken date-of-birth question is understood', /twenty-seventh/i.test(free['what is your date of birth']));
check('spoken pain question is understood', /seven out of ten/i.test(free['how bad is the pain']));
check('spoken consent question is understood', /anything that helps/i.test(free['I am going to give you som']), free['I am going to give you som']);
check('Arabic question gets an Arabic answer', /\u0647\u0627\u062c\u0631|\u0627\u0644\u0628\u0646\u0633\u0644\u064a\u0646/.test(Object.values(free).join(' ')), Object.entries(free).slice(-2).map(x=>x[1]).join(' | '));

// the board carries the conversation into the headset
const strip = await p.evaluate(() => {
  window.psim.showPlaceUI(true);
  window.psim._drawVRPanel();
  const v = window.psim._vrPanel();
  return { visible: v.visible, h: v.material.map.image.height,
           asks: window.psim.TALK.asked.size,
           asks12: window.psim._vrRects().filter(r => r.action === 'ask').length };
});
check('every question is reachable on the VR board', strip.h === 980 && strip.asks12 === 12, JSON.stringify(strip));

await p.evaluate(() => {
  document.querySelectorAll('#placeUI').forEach(e => e.hidden = false);
});
await p.screenshot({ path: OUT + '/V2-desk.png' });

console.log('\n================ RESULTS ================');
[...ok, ...bad].forEach(l => console.log(l));
console.log(`\n${ok.length} passed, ${bad.length} failed`);
console.log('\n--- page errors ---\n' + (errs.join('\n') || '(none)'));

await browser.close();
process.exit(bad.length ? 1 : 0);
