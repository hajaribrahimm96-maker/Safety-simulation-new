# Safe Medication Administration Simulation
## محاكاة سلامة المريض

An interactive 3D patient-safety simulation for nursing students, built with
Three.js and WebXR. One scenario — a STAT IV paracetamol (Perfalgan) order for
a febrile adult — runs through 7 safety checks, on screen or in a VR headset.

Everything is in a single self-contained `index.html`: Three.js, the
simulation, the font. No build step, no dependencies, no internet connection
required.

---

## Running it

**On a laptop or a projector** — double-click `index.html`. That is all. It
works offline.

**In a VR headset** — the file has to be served over **HTTPS**. WebXR refuses
to start otherwise, and a headset cannot open a local file. See *Publishing*
below.

---

## The question board — now movable to any wall

The board that carries each safety question used to be stuck to your face in
the headset. It can now go anywhere.

### Setting it up on a computer

Click the small board icon at the **bottom left**, or press **V**. A panel
opens with:

| Control | What it does |
|---|---|
| **Follows head** | The old behaviour — the board rides with you. Readable, but it covers the room. |
| **Back wall / Right wall / Left wall / Front wall** | Mounts it flat on that wall. |
| **Along the wall** | Slides it left and right across the wall it is on. |
| **Height** | 0.9 m to 2.5 m from the floor. |
| **Size** | 70 % to 220 %. |

While the panel is open the board is drawn in the room, so you can see exactly
where it will land before putting the headset on. The choice is saved in the
browser, so it is still there next time. **Reset** puts it back to the default.

The default is the **right wall**, because that is the only clear wall in this
room — the back wall carries the monitor, the headwall unit, the sharps bin,
the hand rub and the window, so a board there will sit in front of some of
them. Slide it with *Along the wall* if you want it on the back wall anyway.

### Setting it up inside the headset

1. **Squeeze either grip.** The pointer turns orange and the board goes
   half-transparent — this is aiming mode.
2. **Point at any wall — or any surface — and pull the trigger.** The board
   sticks there, facing you, and stays.

The placement is saved the same way. Squeeze the grip again to cancel without
moving anything.

### Jumping straight to a placement

`index.html?place=right` · `?place=back` · `?place=left` · `?place=front` ·
`?place=head`, and optionally `&height=1.9&size=1.6&along=-0.4`. A URL
overrides the saved choice for that one run without overwriting it. Adding
`?place=1` on its own just opens the panel.

---

## Talking to the patient

Click the **microphone** in the top bar. A bar opens at the bottom with the
conversation and a row of questions.

**Speaking to her.** Press the round microphone button and talk. She answers
out loud, and what she said is printed in the bar and on the question board.
Speech recognition is a browser feature: it needs **Chrome or Edge** and an
**internet connection**, and it is not reliable in Arabic. If it is
unavailable the microphone button is greyed out and the bar says so.

**Tapping a question.** Every question is also a button. This always works —
phone, projector, headset, offline. She still answers out loud.

**Inside the headset**, the questions are along the bottom of the question
board itself. Point and pull the trigger; her reply appears above them. There
is no microphone in VR — the Quest browser's speech recognition cannot be
relied on, so it is not offered rather than failing in front of a class.

**Arabic and English.** The two buttons in the bar switch her replies and the
microphone language. If you speak to her in Arabic she answers in Arabic
whatever the button says.

### What she will answer

Greeting · her name · date of birth · allergies · pain score · the cannula
site · fever · when she last had paracetamol · the call bell · getting out of
bed · consent · anything else she needs.

The answers carry the clinical cues the checks depend on — she names
penicillin when asked about allergies, says the cannula has been stinging
since last night when asked about pain, and says the call bell slipped down
the side of the bed. Asking her before doing a check is the point.

This is keyword matching against a fixed script, not a language model: it has
to work in a classroom with a projector and nothing else. Ask her something
outside the script and she says she did not catch it.

---

## The safety checks

Seven stations, 100 points, in this order:

1. Hand hygiene — 10
2. Patient identification — 15
3. The rights of administration — 15
4. IV cannula site — 20
5. Bed rails and fall risk — 15
6. Call bell — 10
7. Documentation — 15

Each station asks one question. A wrong answer explains **why it is unsafe**
and allows a retry for half marks; a right answer gives the rationale and,
where it applies, changes the room — the side rail rises, the call bell
returns to the patient's hand, the phlebitic cannula is re-sited. A printable
debrief at the end lists every check, whether it was right first time, the
score and the elapsed time.

---

## Publishing

### Netlify Drop — for a quick test link

1. **Sign in first** at [app.netlify.com](https://app.netlify.com) (free).
   A drop made while signed out is protected with a temporary password until
   you claim it, and a headset will hit that prompt instead of the simulation.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag this whole folder onto the page.
4. Open the `https://….netlify.app` link in the Quest browser.

If the link returns a password prompt or a 401, the project is private — open
it in the Netlify dashboard and make it public.

### GitHub Pages — the permanent home

1. In the repository: **Add file → Upload files**, drag `index.html` in, then
   **Commit changes**.
2. **Settings → Pages →** Source: *Deploy from a branch*, branch `main`,
   folder `/ (root)` → **Save**.
3. After a minute it is live at
   `https://hajaribrahimm96-maker.github.io/Patient-Safety-Simulation/`

The file must be named `index.html` for that URL. Pages is free while the
repository is public.

---

## Changes in this version

**The question board moves to any wall.** Preset buttons for all four walls
plus head-locked, with height, size and along-the-wall sliders, previewed live
on screen and saved per device. Inside the headset, squeeze a grip and pull
the trigger to stick it wherever you point.

**The fourth wall.** The room only had three walls — the open side was the
camera's way in. There is now a front wall that exists only inside the
headset, so you are not looking into a void when you turn round, and the board
has a fourth wall to hang on.

**The board looks like a board.** A white rectangle on a white hospital wall
read as a projection, so it now has a teal frame, a drop shadow and a slightly
cooler face, and it hangs 26 cm clear of the wall so ward equipment does not
poke through it.

**Talking to the patient**, as described above.

**Clicking past the board.** With the board on a wall, a click or a trigger
pull that misses it now passes through to the room behind. Before, anything
the board covered was unreachable.

**The header said 0/9 for a moment on load.** It says 0/7.

---

## Editing the content

The teaching content — the patient, the drug order, the questions, the answers
and the rationales — is near the top of the bundled script. Look for
`const PATIENT = {` and `const TASKS = [`. What the patient says is in
`const DIALOGUE = [`, further down, each entry with its English and Arabic
text, the words that trigger it, and the short label used on the board in VR.

---

## Licence

Three.js is MIT licensed and bundled into the file. Choose a licence for this
repository — MIT is the usual choice for teaching material meant to be reused.

---

## عربي

محاكاة تفاعلية ثلاثية الأبعاد لسلامة المريض، لطلبة التمريض. سيناريو واحد —
أمر بإعطاء بيرفالجان ١ غرام وريدي بشكل فوري لمريضة بالغة لديها حرارة — يمر
عبر ٧ فحوصات سلامة، على الشاشة أو داخل نظارة الواقع الافتراضي.

**كل شيء داخل ملف واحد**: مكتبة Three.js وكود المحاكاة والخط كلها مدمجة.
انقر على `index.html` مرتين ويشتغل بدون إنترنت وبدون تثبيت. النظارة تحتاج
رابط `https://` — ارفعه على Netlify Drop أو GitHub Pages.

### لوحة الأسئلة تنتقل لأي جدار

اضغط أيقونة اللوحة أسفل اليسار أو زر **V**. تظهر لك أزرار: تتبع الرأس، الجدار
الخلفي، الأيمن، الأيسر، الأمامي — مع تحكم بالموضع على الجدار والارتفاع
والحجم. اللوحة تُرسم في الغرفة وأنت تعدّل، فتشوف مكانها قبل ما تلبس النظارة،
والاختيار يُحفظ على الجهاز.

الوضع الافتراضي هو **الجدار الأيمن** لأنه الجدار الوحيد الفاضي في هذي الغرفة؛
الجدار الخلفي فيه الشاشة ووحدة الرأس وصندوق الحادّة والمعقّم والنافذة.

**داخل النظارة**: اضغط زر القبضة (grip) — يصير المؤشر برتقالي — بعدين صوّب على
أي جدار واضغط الزناد (trigger) فتلتصق اللوحة هناك. اضغط القبضة مرة ثانية
للإلغاء.

### الكلام مع المريضة

اضغط أيقونة المايك في الشريط العلوي. يفتح شريط تحت فيه المحادثة وأسئلة جاهزة.

- **بالمايك**: اضغط الزر الدائري وتكلم. الميزة هذي تحتاج Chrome أو Edge
  وإنترنت، ودقتها بالعربي ضعيفة. إذا ما كانت متوفرة يصير الزر رمادي.
- **بالضغط على السؤال**: يشتغل دائماً — جوال، عرض، نظارة، وبدون إنترنت.
- **داخل النظارة**: الأسئلة موجودة أسفل لوحة الأسئلة نفسها، صوّب واضغط الزناد.
  ما في مايك داخل النظارة لأن متصفح Quest ما يعتمد عليه.
- **عربي / إنجليزي**: زرّين في الشريط. إذا كلمتها بالعربي تجاوبك بالعربي حتى
  لو الزر على الإنجليزي.

إجاباتها فيها المفاتيح السريرية: تقول البنسلين لما تسألها عن الحساسية، وتقول
إن مكان الكانيولا يحرقها من أمس لما تسألها عن الألم، وتقول إن جرس النداء طاح
جنب السرير. السؤال قبل الفحص هو المقصود.

**تنبيه**: راجع صياغة المحتوى الطبي مقابل سياسات مستشفاك قبل استخدامه في
التقييم الرسمي، فبعض الحدود وبروتوكولات التصعيد تختلف بين المؤسسات.
