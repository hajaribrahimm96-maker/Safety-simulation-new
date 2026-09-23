#!/usr/bin/env python3
"""Adds the spoken conversation with the patient to v2.html."""

import pathlib, sys

HERE = pathlib.Path(__file__).parent
SRC = HERE / (sys.argv[1] if len(sys.argv) > 1 else 'v2.html')
DST = HERE / (sys.argv[2] if len(sys.argv) > 2 else 'v2.html')

html = SRC.read_text(encoding='utf-8')

ANCHOR = "/* entering / leaving VR ------------------------------------------------ */"
assert html.count(ANCHOR) == 1, 'anchor not found'

VOICE = r'''/* ============================================ talking to the patient  */

/* She answers out loud. On a computer you can speak to her through the
   microphone; everywhere else — phone, projector, headset — you ask by
   tapping a question. Speech recognition needs Chrome or Edge and an
   internet connection, so the tappable questions are always there too.

   الكلام مع المريضة: تقدر تسألها بالمايك على الكمبيوتر، أو تضغط على
   السؤال الجاهز على أي جهاز. تجاوبك بصوت مسموع مع نص مكتوب. */

const TALK = {
  lang: 'en',
  listening: false,
  rec: null,
  lastReply: '',
  asked: new Set(),
  sttOK: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  ttsOK: typeof speechSynthesis !== 'undefined'
};

const DIALOGUE = [
  { id: 'greet', short: 'Greeting',
    chip:  { en: 'Good morning, how are you?', ar: 'صباح الخير، شلونك؟' },
    keys:  { en: ['hello', 'hi ', 'good morning', 'good afternoon', 'how are you', 'how do you feel', 'feeling'],
             ar: ['مرحبا', 'السلام', 'صباح', 'هلا', 'شلونك', 'كيفك', 'شحالك', 'شعورك'] },
    say:   { en: "Good morning. Not great, honestly — I'm hot and shivery and my head is pounding.",
             ar: 'صباح النور. مو زينة بصراحة، حاسة بحرارة وقشعريرة وراسي يعورني.' } },

  { id: 'name', short: 'Your name?',
    chip:  { en: 'Can you tell me your full name?', ar: 'ممكن اسمك الكامل؟' },
    keys:  { en: ['your name', 'full name', 'who are you', 'tell me your name', 'confirm your name'],
             ar: ['اسمك', 'الاسم', 'عرفيني', 'اسم الكامل', 'منو انتي'] },
    say:   { en: 'Hajar Tareq Ali.',
             ar: 'هاجر طارق علي.' } },

  { id: 'dob', short: 'Date of birth?',
    chip:  { en: 'And your date of birth?', ar: 'وتاريخ ميلادك؟' },
    keys:  { en: ['date of birth', 'birth', 'birthday', 'born', 'how old'],
             ar: ['تاريخ ميلاد', 'ميلادك', 'مواليد', 'عمرك'] },
    say:   { en: 'The twenty-seventh of July, nineteen ninety-six.',
             ar: 'سبعة وعشرين يوليو، سنة ألف وتسعمئة وستة وتسعين.' } },

  { id: 'allergy', short: 'Allergies?',
    chip:  { en: 'Do you have any allergies?', ar: 'عندك حساسية من أي دواء؟' },
    keys:  { en: ['allerg', 'react to any', 'any medicines you cannot', 'sensitive to'],
             ar: ['حساسية', 'حساسيه', 'تحسس', 'يأثر عليك'] },
    say:   { en: 'Yes — penicillin. I came out in a rash all over when I was a child.',
             ar: 'إي، البنسلين. طلع لي طفح جلدي بكل جسمي وأنا صغيرة.' } },

  { id: 'pain', short: 'Pain now?',
    chip:  { en: 'How bad is the pain, out of ten?', ar: 'الألم كم من عشرة؟' },
    keys:  { en: ['pain', 'hurt', 'sore', 'ache', 'out of ten', 'scale'],
             ar: ['الم', 'يعورك', 'وجع', 'من عشرة', 'تتألمين'] },
    say:   { en: 'About seven out of ten. And my hand, where the drip goes in — it has been stinging since last night.',
             ar: 'تقريباً سبعة من عشرة. وإيدي مكان المغذي تحرقني من أمس بالليل.' } },

  { id: 'cannula', short: 'The drip site',
    chip:  { en: 'May I look at your cannula?', ar: 'ممكن أشوف مكان الكانيولا؟' },
    keys:  { en: ['cannula', 'drip', 'iv ', 'your hand', 'the line', 'look at your arm'],
             ar: ['كانيولا', 'المغذي', 'الوريد', 'ايدك', 'يدك', 'المحلول'] },
    say:   { en: "Go ahead. It looks red to me, and it is sore when anything touches it.",
             ar: 'تفضلي. شكلها محمرة، وتعورني إذا أي شي لمسها.' } },

  { id: 'fever', short: 'Temperature',
    chip:  { en: 'Have you felt feverish today?', ar: 'حاسة بحرارة اليوم؟' },
    keys:  { en: ['fever', 'temperature', 'hot', 'cold', 'shiver', 'sweat'],
             ar: ['حرارة', 'حراره', 'سخونة', 'قشعريرة', 'تعرق', 'برد'] },
    say:   { en: 'Since about four this morning. They gave me something for it then, but it came back.',
             ar: 'من الساعة أربعة الفجر تقريباً. عطوني شي وقتها بس رجعت الحرارة.' } },

  { id: 'lastdose', short: 'Last painkiller',
    chip:  { en: 'When did you last have paracetamol?', ar: 'متى آخر جرعة باراسيتامول؟' },
    keys:  { en: ['last dose', 'last time', 'paracetamol', 'panadol', 'painkiller', 'already had'],
             ar: ['اخر جرعة', 'اخر مرة', 'بنادول', 'باراسيتامول', 'مسكن'] },
    say:   { en: 'At four in the morning. One bag through the drip, the nurse said a gram.',
             ar: 'الساعة أربعة الفجر. كيس واحد بالمغذي، الممرضة قالت غرام.' } },

  { id: 'callbell', short: 'Call bell',
    chip:  { en: 'Can you reach your call bell?', ar: 'توصلين لجرس النداء؟' },
    keys:  { en: ['call bell', 'buzzer', 'bell', 'call us', 'reach'],
             ar: ['جرس', 'النداء', 'تنادين', 'توصلين'] },
    say:   { en: 'No — it slipped down the side of the bed in the night. I have been waiting for someone to walk past.',
             ar: 'لا، طاح جنب السرير بالليل. كنت أنتظر أحد يمر من هني.' } },

  { id: 'mobility', short: 'Getting up',
    chip:  { en: 'Have you been getting up on your own?', ar: 'تقومين من السرير بروحك؟' },
    keys:  { en: ['get up', 'getting up', 'walk', 'dizzy', 'out of bed', 'on your own', 'toilet'],
             ar: ['تقومين', 'تمشين', 'دوخة', 'دايخة', 'تنزلين', 'الحمام'] },
    say:   { en: 'I tried in the night to reach the bathroom and went dizzy, so I sat back down.',
             ar: 'حاولت بالليل أروح الحمام وجتني دوخة، فرجعت قعدت.' } },

  { id: 'consent', short: 'Consent',
    chip:  { en: "I'm going to give you something for the fever — is that alright?",
             ar: 'بعطيك دواء للحرارة، تمام؟' },
    keys:  { en: ['going to give', 'is that alright', 'is that ok', 'consent', 'permission',
                  'happy for me', 'may i give', 'start the'],
             ar: ['بعطيك', 'اعطيك', 'موافقة', 'موافقه', 'تسمحين', 'ابدا'] },
    say:   { en: 'Yes, please — anything that helps. Go ahead.',
             ar: 'إي والله، أي شي يخفف. تفضلي.' } },

  { id: 'anything', short: 'Anything else?',
    chip:  { en: 'Is there anything else you need?', ar: 'تحتاجين شي ثاني؟' },
    keys:  { en: ['anything else', 'need anything', 'can i get you', 'worried', 'questions'],
             ar: ['شي ثاني', 'تحتاجين', 'تبين شي', 'قلقانة', 'سؤال'] },
    say:   { en: 'Some water, when you have a moment. And please put the bell back where I can reach it.',
             ar: 'ماي لو تكرمتي. وحطي الجرس مكان أوصله لو سمحتي.' } }
];

/* --- matching what was said to one of her answers ---------------------
   Plain keyword matching, no network and no model: it has to work in a
   classroom with the projector and nothing else. */

function normalise(s) {
  return String(s).toLowerCase()
    .replace(/[ً-ٰٟ]/g, '')            // Arabic diacritics
    .replace(/[أإآٱ]/g, 'ا') // alef forms
    .replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

function matchIntent(text) {
  const s = ' ' + normalise(text) + ' ';
  let best = null, score = 0;
  for (const d of DIALOGUE) {
    let sc = 0;
    for (const k of [].concat(d.keys.en || [], d.keys.ar || [])) {
      const n = normalise(k);
      if (n && s.includes(' ' + n)) sc += n.length;   // must start a word
    }
    if (sc > score) { score = sc; best = d; }
  }
  return score > 0 ? best : null;
}

/* --- her voice -------------------------------------------------------- */

let ttsVoices = [];
function loadVoices() { try { ttsVoices = speechSynthesis.getVoices() || []; } catch { } }
if (TALK.ttsOK) {
  loadVoices();
  try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch { }
}

function pickVoice(code) {
  const want = code === 'ar' ? 'ar' : 'en';
  const list = ttsVoices.filter(v => (v.lang || '').toLowerCase().startsWith(want));
  return list.find(v => /female|woman|samantha|karen|serena|zira|hoda|salma|amira|laila/i.test(v.name))
      || list[0] || null;
}

function speakAs(text, code) {
  if (!TALK.ttsOK) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = code === 'ar' ? 'ar-SA' : 'en-GB';
    const v = pickVoice(code);
    if (v) u.voice = v;
    u.rate = 0.97; u.pitch = 1.06;
    speechSynthesis.speak(u);
  } catch { /* no speech engine — the subtitle still shows */ }
}

/* --- the exchange ----------------------------------------------------- */

function showLine(who, text) {
  const el = document.getElementById(who === 'nurse' ? 'vNurseText' : 'vHerText');
  if (el) el.textContent = text || '—';
}

function patientReplies(text) {
  TALK.lastReply = text;
  showLine('her', text);
  speakAs(text, TALK.lang);
  if (vrPanel && vrPanel.visible) drawVRPanel();
}

/** Ask by id (a tapped question) or by free text (the microphone). */
function askPatient(idOrText) {
  const byId = typeof idOrText === 'string' && DIALOGUE.some(x => x.id === idOrText);
  const d = byId ? DIALOGUE.find(x => x.id === idOrText) : matchIntent(idOrText);

  // spoken to in Arabic, she answers in Arabic — whatever the toggle says
  const code = byId ? TALK.lang
             : (/[\u0600-\u06FF]/.test(String(idOrText)) ? 'ar' : 'en');

  if (!d) {
    showLine('nurse', idOrText);
    patientReplies(code === 'ar'
      ? 'ما فهمت عليك، ممكن تعيدين السؤال؟'
      : "Sorry, I didn't catch that. Could you ask me again?");
    return;
  }

  showLine('nurse', byId ? (d.chip[code] || d.chip.en) : idOrText);
  TALK.asked.add(d.id);
  patientReplies(d.say[code] || d.say.en);
  renderChips();
}

/* --- the microphone --------------------------------------------------- */

function micError(code) {
  if (code === 'not-allowed' || code === 'service-not-allowed')
    return 'The microphone is blocked — allow it in the address bar, or tap a question instead.';
  if (code === 'network')
    return 'Speech recognition needs an internet connection. Tap a question instead.';
  if (code === 'no-speech') return "I didn't hear anything — try again.";
  if (code === 'audio-capture') return 'No microphone found on this device.';
  return 'The microphone stopped. Tap a question instead.';
}

function setListening(on) {
  TALK.listening = on;
  const b = document.getElementById('micBtn');
  if (b) b.classList.toggle('live', on);
}

function startListening() {
  if (TALK.listening) { try { TALK.rec && TALK.rec.stop(); } catch { } return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('This browser cannot listen — tap a question instead.'); return; }
  let heard = '';
  try {
    const rec = new SR();
    rec.lang = TALK.lang === 'ar' ? 'ar-SA' : 'en-GB';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) heard += r[0].transcript;
        else interim += r[0].transcript;
      }
      showLine('nurse', (heard + ' ' + interim).trim());
    };
    rec.onerror = e => { setListening(false); toast(micError(e.error)); };
    rec.onend = () => {
      setListening(false);
      if (heard.trim()) askPatient(heard.trim());
    };
    TALK.rec = rec;
    rec.start();
    setListening(true);
    showLine('nurse', 'Listening…');
  } catch {
    setListening(false);
    toast('Could not start the microphone.');
  }
}

/* --- the panel -------------------------------------------------------- */

function renderChips() {
  const box = document.getElementById('vChips');
  if (!box) return;
  box.textContent = '';
  for (const d of DIALOGUE) {
    const b = document.createElement('button');
    b.textContent = d.chip[TALK.lang] || d.chip.en;
    b.dataset.ask = d.id;
    if (TALK.asked.has(d.id)) b.style.opacity = '.55';
    b.addEventListener('click', () => askPatient(d.id));
    box.appendChild(b);
  }
}

let voiceOpen = false;

function showVoice(on) {
  voiceOpen = on === undefined ? !voiceOpen : !!on;
  const bar = document.getElementById('voiceBar');
  if (bar) bar.hidden = !voiceOpen;
  document.body.classList.toggle('voice-on', voiceOpen);
  const tg = document.getElementById('voiceToggle');
  if (tg) tg.classList.toggle('on', voiceOpen);
  if (voiceOpen) renderChips();
  else if (TALK.listening) { try { TALK.rec && TALK.rec.stop(); } catch { } }
}

function setTalkLang(code) {
  TALK.lang = code === 'ar' ? 'ar' : 'en';
  document.querySelectorAll('#voiceBar [data-vlang]').forEach(b =>
    b.classList.toggle('on', b.dataset.vlang === TALK.lang));
  const bar = document.getElementById('voiceBar');
  if (bar) bar.dir = TALK.lang === 'ar' ? 'rtl' : 'ltr';
  renderChips();
}

(function wireVoice() {
  const tg = document.getElementById('voiceToggle');
  if (tg) tg.addEventListener('click', () => showVoice());
  const cl = document.getElementById('voiceClose');
  if (cl) cl.addEventListener('click', () => showVoice(false));
  const mic = document.getElementById('micBtn');
  if (mic) {
    mic.addEventListener('click', startListening);
    if (!TALK.sttOK) mic.disabled = true;
  }
  document.querySelectorAll('#voiceBar [data-vlang]').forEach(b =>
    b.addEventListener('click', () => setTalkLang(b.dataset.vlang)));

  const note = document.getElementById('vNote');
  if (note) {
    note.textContent = TALK.sttOK
      ? 'Press the microphone and speak, or tap a question. She answers out loud.'
      : 'This browser cannot listen through the microphone, so tap a question instead — she still answers out loud.';
  }
  renderChips();
})();

'''

html = html.replace(ANCHOR, VOICE + ANCHOR)
DST.write_text(html, encoding='utf-8')
print(f'voice module inserted -> {DST.name}  ({DST.stat().st_size/1024/1024:.2f} MB)')
