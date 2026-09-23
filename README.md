# Patient Safety Simulation · محاكاة سلامة المريض

An interactive 3D patient-safety simulation for nursing students, built with
Three.js and WebXR. One scenario — a STAT IV paracetamol (Perfalgan) order for a
febrile adult — runs through 11 safety checks covering medication administration
and fall prevention.

Runs in any modern browser on desktop, tablet and phone, and in a VR headset.
Full Arabic/English interface with a language switch.

---

## Running it

The simulation loads Three.js as an ES module, so **opening `index.html` by
double-clicking will not work** — browsers block module imports over `file://`.
It needs to be served over HTTP.

### GitHub Pages (recommended)

1. Push these files to the repository root.
2. Repository → **Settings** → **Pages**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the simulation is live at
   `https://hajaribrahimm96-maker.github.io/Patient-Safety-Simulation/`

That URL is what you share with students — no install, works on their phones.

### Locally, while developing

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Project structure

```
index.html        markup, styling, and the Three.js import map
js/content.js     ALL text and teaching content (Arabic + English)
js/scene.js       builds the 3D room and its animations
js/app.js         the engine: picking, scoring, language, VR
```

The split matters: **you never have to touch 3D code to change the teaching
content.** Everything a nurse educator would want to edit — the patient, the
drug order, the questions, the answers, the rationales — lives in
`js/content.js`.

---

## Adding a new safety check

Three steps, no other file changes:

**1.** In `js/scene.js`, build the object and register it:

```js
const oxygen = new THREE.Group();
oxygen.position.set(-2.4, 0, -2.2);
oxygen.add(box(0.2, 0.8, 0.2, M.metal(0x2f7f4f), 0, 0.4, 0));
scene.add(oxygen);
markInteractive(oxygen, 'oxygen', 1.0);   // 'oxygen' is the id, 1.0 is the marker height
```

**2.** In `js/content.js`, add a task pointing at that id:

```js
{
  id: 'oxygen',
  target: 'oxygen',            // must match markInteractive
  points: 10,
  requires: ['patient_id'],    // stations that must be done first
  label:  { en: 'Oxygen safety', ar: 'سلامة الأكسجين' },
  prompt: { en: '...', ar: '...' },
  options: [
    { correct: true, text: { en: '...', ar: '...' } },
    { text: { en: '...', ar: '...' },
      feedback: { en: 'why this is unsafe', ar: 'لماذا هذا غير آمن' } }
  ],
  rationale: { en: '...', ar: '...' },
  effect: 'someEffect'         // optional — a function in scene.js effects{}
}
```

**3.** Optionally add an `effect` to the `effects` object in `js/scene.js` if
answering should change something in the room (raise a rail, lower the bed…).

The checklist, the scoring, the progress counter and the debrief all pick it up
automatically.

### Changing the patient or the drug order

Edit the `PATIENT` object at the top of `js/content.js`. It feeds the side panel
and the monitor readings.

---

## What changed from the earlier prototype

The old `3d-test-2.html` used hand-written WebGL. These were the blocking
problems, and how they are fixed here:

| Problem | Fix |
|---|---|
| Clicks were matched to **percentages of the screen**, so every interaction landed on the wrong object as soon as the camera moved | A real `Raycaster` tests the actual 3D geometry — correct from any angle |
| `gl.clear` never cleared the depth buffer while depth testing was on, corrupting the image after the first frame | Three.js manages the frame buffers |
| Four overlapping click listeners on one canvas — a single click fired several events at once | One picking path, plus drag-vs-click detection so orbiting never triggers an answer |
| `showSafetyQuestion` and `answerQuestion` were each defined twice, the second silently replacing the first | Single definition, content-driven |
| A new GPU buffer was created for every object on every frame | Geometry is uploaded once |
| No lighting — every face of every box was the same flat colour | Directional + hemisphere lighting with soft shadows |
| No touch support; WASD only | Orbit/pinch controls that work on phone, tablet and desktop |
| No progression, scoring, feedback or record of performance | 11 gated checks, per-attempt scoring, rationale after every answer, printable debrief |

**Files you can delete from the repository:**

- `three.module 2.js` — a broken, partial copy of Three.js (the space in the
  filename also makes it unimportable). Three.js now loads from a CDN.
- `3d-test.html` — the "does JavaScript work" test, no longer needed.
- `3d-test-2.html` — superseded, but worth keeping in git history.
- `VRButton.js` — the official add-on is loaded from the CDN instead.

Keep the old 2D version if you want a no-WebGL fallback: rename it to
something like `2d-simple.html`.

---

## How it plays

The student can only work in a clinically sensible order — hand hygiene gates
patient contact, identification gates the chart, the chart gates drawing up the
drug, and so on. Clicking a locked station explains what has to happen first.

Each station asks one question. A wrong answer explains **why it is unsafe** and
lets the student try again for half marks. A right answer shows the rationale
and, where relevant, changes the room: the side rail rises, the bed drops to its
lowest height, the brake goes green, the call bell returns to the patient's
hand, the phlebitic cannula is re-sited.

At the end there is a debrief table showing every check, whether it was right
first time, the score and the elapsed time. **Print / save as PDF** produces a
clean sheet for the student's portfolio or for your records.

Tapping any row in the "Safety checks" panel turns the camera to that station —
useful when demonstrating a specific point to a class.

### Scoring

150 points across 11 checks. Full marks on the first attempt, half on a retry.
≥90 % excellent, ≥70 % good, below that the module should be repeated.

---

## VR

The VR button appears automatically on headsets that support WebXR (Meta Quest
via the built-in browser, and any WebXR-capable desktop headset). Point a
controller at a station and pull the trigger; the question appears on a panel in
front of you. Everything else behaves the same.

VR needs HTTPS — GitHub Pages provides that. It is the newest part of the code
and has had the least testing on real hardware, so try it before using it with a
class.

---

## Clinical content

Built around standard patient-safety teaching: the WHO five moments of hand
hygiene, two-identifier patient verification, the rights of medication
administration, paracetamol dosing limits (4 g / 24 h, 15 mg/kg under 50 kg),
visual infusion phlebitis assessment, early warning scores, fall-prevention bed
configuration, contemporaneous documentation, and sharps handling.

Review the wording against your institution's own policies before using it for
assessment — thresholds and escalation protocols vary between hospitals.

---

## عربي

محاكاة تفاعلية ثلاثية الأبعاد لسلامة المريض، لطلبة التمريض، مبنية على Three.js
و WebXR. سيناريو واحد — أمر بإعطاء بيرفالجان ١ غرام وريدي بشكل فوري لمريضة
بالغة لديها حرارة — يمر عبر ١١ فحص سلامة تغطي إعطاء الأدوية والوقاية من السقوط.

**التشغيل:** المحاكاة تحمّل Three.js كوحدة ES، لذلك **فتح `index.html` بالنقر
المزدوج لن يعمل**. ارفع الملفات إلى المستودع ثم فعّل GitHub Pages من
Settings ← Pages ← فرع `main` ومجلد الجذر، وسيصبح الرابط جاهزاً للمشاركة مع
الطلبة خلال دقيقة.

**التعديل على المحتوى:** كل النصوص والأسئلة والإجابات والتفسيرات بالعربي
والإنجليزي موجودة في ملف واحد هو `js/content.js`. لإضافة فحص جديد: أضف الجسم في
`js/scene.js` مع `markInteractive(group, 'id')`، ثم أضف المهمة في `content.js`
بنفس المعرّف. القائمة والنقاط والتقرير النهائي ستتحدث تلقائياً.

**ترتيب الخطوات:** الطالب لا يستطيع القفز فوق الخطوات — نظافة اليدين تسبق
ملامسة المريض، والتحقق من الهوية يسبق مراجعة الملف، وهكذا. الإجابة الخاطئة تشرح
سبب خطورتها وتسمح بمحاولة ثانية بنصف الدرجة، والإجابة الصحيحة تعرض التفسير
العلمي وتغيّر الغرفة فعلياً: يرتفع حاجز السرير، وينخفض السرير، ويعود جرس النداء
إلى يد المريضة.

في النهاية يظهر تقرير أداء قابل للطباعة أو الحفظ كملف PDF.

**تنبيه:** راجع صياغة المحتوى الطبي مقابل سياسات مستشفاك قبل استخدامه في
التقييم الرسمي، فبعض الحدود وبروتوكولات التصعيد تختلف بين المؤسسات.

---

## Licence

Three.js is MIT licensed and loaded from a CDN. Choose a licence for this
repository — MIT is the usual choice for teaching material you want others to
reuse.
