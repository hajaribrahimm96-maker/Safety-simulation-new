# How this build was made
## كيف بُني هذا الملف

`index.html` at the top of this package is the file to use. Everything below
is here so the work can be redone, checked, or handed to someone else.

---

## The chain

```
hand-off-version.html          the file you sent back, as you edited it
        │
        │  + completed lower body and contoured blanket
        │  + null-safe element lookup (fixes the startup crash)
        ▼
body.html                      the approved intermediate
        │
        │  python3 patch_walls.py v2.html      ← movable question board
        │  python3 patch_voice.py v2.html v2.html   ← talking to the patient
        ▼
v2.html  →  index.html         the current build
```

Both patch scripts read `body.html`, never `index.html`, so re-running them
from scratch always reproduces the same result. Every edit is an exact
single-occurrence string replacement that fails loudly if the source has
moved — there is no fuzzy matching and nothing is silently skipped.

To rebuild:

```bash
cd source
python3 patch_walls.py v2.html
python3 patch_voice.py v2.html v2.html
cp v2.html ../index.html
```

---

## The files

| File | What it is |
|---|---|
| `index.html` | The build to publish or double-click. Self-contained. |
| `README.md` | How to run it, the placement controls, the conversation, publishing. |
| `screenshots/` | The five views: the laptop controls, and the board on each of the four walls. |
| `source/hand-off-version.html` | Exactly the file you sent, untouched. |
| `source/body.html` | That file plus the lower-body fix and the crash fix you approved. |
| `source/patch_walls.py` | Adds the movable question board, the front wall, the placement panel and the in-headset aiming. |
| `source/patch_voice.py` | Adds the conversation with the patient: the script, the keyword matching, the speech, the bar and the chips. |
| `source/v2check.mjs` | The 22-check regression suite. |
| `source/shoot2.mjs` | Renders the five screenshots. |
| `source/build_standalone.py` | The original bundler — Three.js, simulation code and the font into one file. Only needed if you go back to the modular `js/` sources. |
| `modular-source/` | The earlier 11-station modular version (`index.html` + `js/`). Superseded, kept for reference. |

---

## Running the checks

The suite needs Node and Playwright with a Chromium that can do software
WebGL. It loads the page **offline** on purpose, to prove the file has no
outside dependencies.

```bash
node v2check.mjs      # expects: 22 passed, 0 failed
node shoot2.mjs       # writes the five screenshots
```

Both scripts have absolute paths at the top — change `DIR` and `OUT`, and the
`executablePath` for Chromium, to match wherever you put this.

What the suite covers: that the page boots with no errors offline, that all
seven stations and the front wall are there, that each of the five placements
moves the board somewhere different, that the three sliders do what they say,
that the placement is saved and survives a reload, that aiming a controller at
a surface sticks the board to it, that all twelve questions are reachable on
the board in VR, and that both spoken English and spoken Arabic reach the
right answer.

---

## Still open

**Which wall.** The board defaults to the right wall because it is the only
clear one in this room. Once you have tried it in the headset, say which you
want and the switch, the panel and the grip shortcut can come out, leaving
that placement fixed.

**The font.** Cairo is embedded and subset to Arabic plus Latin. The bundler
also supports Tajawal, Almarai, Readex Pro, Noto Kufi Arabic, Alexandria and
IBM Plex Sans Arabic — `python3 build_standalone.py Tajawal`.

**The medical content.** Check the wording against your hospital's policies
before using it for formal assessment; some limits and escalation protocols
differ between institutions.

---

## ملخص بالعربي

`index.html` هو الملف المعتمد. مجلد `source` فيه ملف الـ handoff اللي أرسلته
كما هو، والنسخة بعد تعديل الجسم، وسكربتين بايثون يضيفان لوحة الأسئلة المتنقلة
والكلام مع المريضة، مع ملف اختبار فيه ٢٢ فحصاً وملف يلتقط الصور.

كل تعديل في السكربتات هو استبدال نص محدد لمرة واحدة، ويفشل بوضوح إذا تغير
المصدر — ما في تخمين ولا تجاوز صامت. عشان تعيد البناء:

```bash
cd source
python3 patch_walls.py v2.html
python3 patch_voice.py v2.html v2.html
cp v2.html ../index.html
```

الباقي المفتوح: تختار الجدار النهائي بعد ما تجرب النظارة، واختيار الخط،
ومراجعة المحتوى الطبي مقابل سياسات مستشفاك.
