/* =========================================================================
   content.js — all text and teaching content lives here.
   كل النصوص والمحتوى التعليمي في هذا الملف.

   To add a new safety station:
     1. add a mesh in scene.js with userData.id = "myStation"
     2. add a task below with target: "myStation"
   Nothing else needs to change.
   ========================================================================= */

/* ---------------------------------------------------------------- patient */

export const PATIENT = {
  name:      { en: 'Hajar Tareq Ali',  ar: 'هاجر طارق علي' },
  dob:       '27 / 07 / 1996',
  mrn:       '204-88-17',
  room:      { en: 'Room 204 · Bed 2', ar: 'غرفة ٢٠٤ · سرير ٢' },
  weight:    { en: '58 kg',            ar: '٥٨ كجم' },
  allergies: { en: 'Penicillin',       ar: 'بنسلين' },
  order: {
    drug:   { en: 'Perfalgan (paracetamol)', ar: 'بيرفالجان (باراسيتامول)' },
    dose:   { en: '1 g',    ar: '١ غرام' },
    route:  { en: 'IV infusion over 15 min', ar: 'وريدي بالتسريب خلال ١٥ دقيقة' },
    timing: { en: 'STAT',   ar: 'فوري STAT' },
    last:   { en: 'Last dose 1 g at 04:00 · 1 g / 4 g in last 24 h',
              ar: 'آخر جرعة ١ غرام الساعة ٠٤:٠٠ · ١ من ٤ غرام خلال ٢٤ ساعة' }
  },
  vitals: {
    hr: 92, bp: '138/84', rr: 20, spo2: 96, temp: 38.9, pain: 7
  }
};

/* ------------------------------------------------------------ UI strings  */

export const UI = {
  appTitle:      { en: 'Patient Safety Simulation', ar: 'محاكاة سلامة المريض' },
  appSubtitle:   { en: 'Medication administration · Fall prevention',
                   ar: 'إعطاء الأدوية · الوقاية من السقوط' },

  startHeading:  { en: 'Shift handover', ar: 'تسليم الوردية' },
  startBody: {
    en: 'You are the nurse on an adult medical ward. Your patient has a fever of 38.9 °C and pain 7/10. A STAT dose of IV Perfalgan has been prescribed.\n\nWork through the room and complete every safety check before, during and after giving the medication. Each decision is scored and explained.',
    ar: 'أنتِ/أنت الممرض(ة) المسؤول(ة) في جناح باطني للبالغين. المريضة لديها حرارة ٣٨٫٩ درجة وألم بدرجة ٧ من ١٠، وصُرِف لها بيرفالجان وريدي بشكل فوري.\n\nتنقّل في الغرفة وأكمل كل فحوصات السلامة قبل إعطاء الدواء وأثناءه وبعده. كل قرار يُحتسب ويُشرح لك سببه.'
  },
  startButton:   { en: 'Start simulation', ar: 'ابدأ المحاكاة' },

  controlsTitle: { en: 'Controls', ar: 'التحكم' },
  controlsDesktop: { en: 'Drag to look around · scroll to zoom · click a highlighted item',
                     ar: 'اسحب للنظر حولك · حرّك العجلة للتقريب · انقر على العنصر المُميّز' },
  controlsTouch:   { en: 'Drag to look · pinch to zoom · tap a highlighted item',
                     ar: 'اسحب للنظر · قرّب بإصبعين · المس العنصر المُميّز' },

  score:         { en: 'Score',    ar: 'النقاط' },
  progress:      { en: 'Checks',   ar: 'الفحوصات' },
  time:          { en: 'Time',     ar: 'الوقت' },
  orderCard:     { en: 'Medication order', ar: 'أمر إعطاء الدواء' },
  patient:       { en: 'Patient',  ar: 'المريض' },
  dob:           { en: 'DOB',      ar: 'تاريخ الميلاد' },
  mrn:           { en: 'MRN',      ar: 'الرقم الطبي' },
  weight:        { en: 'Weight',   ar: 'الوزن' },
  allergies:     { en: 'Allergies',ar: 'الحساسية' },
  drug:          { en: 'Drug',     ar: 'الدواء' },
  dose:          { en: 'Dose',     ar: 'الجرعة' },
  route:         { en: 'Route',    ar: 'طريقة الإعطاء' },
  timing:        { en: 'Timing',   ar: 'التوقيت' },

  taskList:      { en: 'Safety checks', ar: 'فحوصات السلامة' },
  correct:       { en: 'Correct',   ar: 'إجابة صحيحة' },
  incorrect:     { en: 'Not safe',  ar: 'غير آمن' },
  whyLabel:      { en: 'Why this matters', ar: 'لماذا هذا مهم' },
  tryAgain:      { en: 'Try again', ar: 'حاول مرة أخرى' },
  continueBtn:   { en: 'Continue',  ar: 'متابعة' },
  closeBtn:      { en: 'Close',     ar: 'إغلاق' },

  lockedTitle:   { en: 'Not yet', ar: 'ليس بعد' },
  lockedBody:    { en: 'Complete this first: ', ar: 'أكمل هذا أولاً: ' },

  doneTitle:     { en: 'Simulation complete', ar: 'انتهت المحاكاة' },
  doneSubtitle:  { en: 'Performance debrief', ar: 'تقرير الأداء' },
  finalScore:    { en: 'Final score', ar: 'النتيجة النهائية' },
  firstTry:      { en: 'First attempt', ar: 'من المحاولة الأولى' },
  retried:       { en: 'Needed a retry', ar: 'احتاج محاولة ثانية' },
  restart:       { en: 'Run again', ar: 'إعادة المحاكاة' },
  printBtn:      { en: 'Print / save as PDF', ar: 'طباعة / حفظ PDF' },

  gradeExcellent:{ en: 'Excellent — safe practice throughout.',
                   ar: 'ممتاز — ممارسة آمنة في جميع الخطوات.' },
  gradeGood:     { en: 'Good — review the checks you retried.',
                   ar: 'جيد — راجع الفحوصات التي احتجت فيها محاولة ثانية.' },
  gradeReview:   { en: 'Needs review — repeat the module before practice.',
                   ar: 'يحتاج مراجعة — أعد الوحدة قبل التطبيق العملي.' },

  vrUnsupported: { en: 'VR not available on this device', ar: 'الواقع الافتراضي غير متاح على هذا الجهاز' },
  enterVR:       { en: 'Enter VR', ar: 'دخول الواقع الافتراضي' },
  exitVR:        { en: 'Exit VR',  ar: 'خروج' }
};

/* ------------------------------------------------------------- the tasks  */

export const TASKS = [

  /* 1 ------------------------------------------------------------------- */
  {
    id: 'hygiene',
    target: 'sanitizer',
    points: 10,
    requires: [],
    label:  { en: 'Hand hygiene', ar: 'نظافة اليدين' },
    prompt: {
      en: 'You are about to enter the patient\'s bed space to give a STAT IV medication. What is the correct action right now?',
      ar: 'أنت على وشك الدخول إلى محيط سرير المريضة لإعطاء دواء وريدي فوري. ما الإجراء الصحيح الآن؟'
    },
    options: [
      { correct: true,
        text: { en: 'Perform hand hygiene before touching the patient or any equipment',
                ar: 'تنظيف اليدين قبل لمس المريضة أو أي جهاز' } },
      { text: { en: 'Put on gloves — gloves replace hand hygiene',
                ar: 'ارتداء القفازات — فالقفازات تُغني عن تنظيف اليدين' },
        feedback: { en: 'Gloves are not a substitute. Hands must be decontaminated before gloving and again after removing them.',
                    ar: 'القفازات ليست بديلاً. يجب تطهير اليدين قبل ارتدائها ومرة أخرى بعد نزعها.' } },
      { text: { en: 'Hand hygiene is only needed when leaving the room',
                ar: 'تنظيف اليدين مطلوب فقط عند مغادرة الغرفة' },
        feedback: { en: 'That is Moment 4 only. Moment 1 — before patient contact — protects the patient from your hands.',
                    ar: 'هذه هي اللحظة الرابعة فقط. اللحظة الأولى — قبل ملامسة المريض — تحمي المريض من يديك.' } },
      { text: { en: 'Only if your hands look visibly dirty',
                ar: 'فقط إذا كانت اليدان متسختين بشكل ظاهر' },
        feedback: { en: 'Most transmission comes from hands that look clean. Visible soiling changes the method (soap and water), not the need.',
                    ar: 'معظم العدوى تنتقل من أيدٍ تبدو نظيفة. الاتساخ الظاهر يغيّر الطريقة (ماء وصابون) لا الحاجة نفسها.' } }
    ],
    rationale: {
      en: 'WHO Moment 1 — before patient contact. Alcohol-based hand rub for 20–30 seconds, or soap and water for 40–60 seconds if hands are visibly soiled or the patient has C. difficile.',
      ar: 'اللحظة الأولى في دليل منظمة الصحة العالمية — قبل ملامسة المريض. فرك كحولي لمدة ٢٠–٣٠ ثانية، أو ماء وصابون ٤٠–٦٠ ثانية إذا كانت اليدان متسختين ظاهرياً أو عند وجود عدوى C. difficile.'
    },
    effect: 'sanitize'
  },

  /* 2 ------------------------------------------------------------------- */
  {
    id: 'patient_id',
    target: 'wristband',
    points: 15,
    requires: ['hygiene'],
    label:  { en: 'Patient identification', ar: 'التحقق من هوية المريض' },
    prompt: {
      en: 'How do you confirm that this is the right patient for the order in your hand?',
      ar: 'كيف تتأكد أن هذه هي المريضة الصحيحة للأمر الطبي الذي بين يديك؟'
    },
    options: [
      { correct: true,
        text: { en: 'Ask her to state her full name and date of birth, then match both against the wristband and the order',
                ar: 'اطلب منها ذكر اسمها الكامل وتاريخ ميلادها، ثم طابقهما مع السوار والأمر الطبي' } },
      { text: { en: 'Confirm the room and bed number',
                ar: 'التأكد من رقم الغرفة والسرير' },
        feedback: { en: 'Room and bed are never acceptable identifiers — patients are moved between beds all the time.',
                    ar: 'رقم الغرفة والسرير ليسا معرّفين مقبولين أبداً — فالمرضى يُنقلون بين الأسرّة باستمرار.' } },
      { text: { en: 'Call out "Hajar?" and see if she responds',
                ar: 'مناداتها باسم «هاجر» ومعرفة إن كانت تستجيب' },
        feedback: { en: 'A leading question. A drowsy, confused, deaf or non-Arabic-speaking patient may answer to any name.',
                    ar: 'هذا سؤال موجِّه. المريض الناعس أو المشوّش أو ضعيف السمع أو الذي لا يتحدث لغتك قد يجيب على أي اسم.' } },
      { text: { en: 'The nurse handing over already identified her at the start of the shift',
                ar: 'الممرضة المسلِّمة تحققت من هويتها في بداية الوردية' },
        feedback: { en: 'Identification is repeated by the person giving the drug, every single time — it is not inherited from handover.',
                    ar: 'التحقق من الهوية يُكرَّر من قِبل من يعطي الدواء في كل مرة — ولا يُورَّث من التسليم.' } }
    ],
    rationale: {
      en: 'Two independent identifiers are required: full name plus date of birth or MRN, verified against the wristband and the medication record. Order: Hajar Tareq Ali, DOB 27/07/1996, MRN 204-88-17.',
      ar: 'مطلوب معرّفان مستقلان: الاسم الكامل مع تاريخ الميلاد أو الرقم الطبي، ويُطابَقان مع السوار وسجل الدواء. الأمر الطبي: هاجر طارق علي، مواليد ٢٧/٠٧/١٩٩٦، الرقم الطبي ٢٠٤-٨٨-١٧.'
    }
  },

  /* 3 ------------------------------------------------------------------- */
  {
    id: 'chart',
    target: 'chart',
    points: 15,
    requires: ['patient_id'],
    label:  { en: 'Chart and allergy check', ar: 'مراجعة الملف والحساسية' },
    prompt: {
      en: 'Before drawing up Perfalgan 1 g IV, what must you check in the chart?',
      ar: 'قبل تحضير بيرفالجان ١ غرام وريدي، ما الذي يجب التحقق منه في الملف؟'
    },
    options: [
      { correct: true,
        text: { en: 'Allergies, the time and size of the last paracetamol dose, the 24-hour total, and the patient\'s weight',
                ar: 'الحساسية، ووقت وحجم آخر جرعة باراسيتامول، والمجموع خلال ٢٤ ساعة، ووزن المريضة' } },
      { text: { en: 'Only that a doctor has signed the order',
                ar: 'فقط التأكد أن الطبيب وقّع على الأمر' },
        feedback: { en: 'A signature makes an order valid, not safe. The nurse giving the drug is the last barrier before harm.',
                    ar: 'التوقيع يجعل الأمر نظامياً لا آمناً. الممرض الذي يعطي الدواء هو آخر حاجز قبل وقوع الضرر.' } },
      { text: { en: 'Only the expiry date printed on the bottle',
                ar: 'فقط تاريخ الانتهاء المطبوع على العبوة' },
        feedback: { en: 'Necessary but nowhere near sufficient — it tells you nothing about cumulative dose or allergy.',
                    ar: 'ضروري لكنه غير كافٍ إطلاقاً — فهو لا يخبرك شيئاً عن الجرعة التراكمية أو الحساسية.' } },
      { text: { en: 'Nothing — it is a STAT order, so give it immediately',
                ar: 'لا شيء — فهو أمر فوري ويجب إعطاؤه حالاً' },
        feedback: { en: 'STAT means urgent, not unchecked. Paracetamol overdose is one of the commonest causes of acute liver failure.',
                    ar: 'كلمة «فوري» تعني عاجل لا «بلا تحقق». الجرعة الزائدة من الباراسيتامول من أكثر أسباب الفشل الكبدي الحاد شيوعاً.' } }
    ],
    rationale: {
      en: 'Adult maximum is 4 g in 24 hours with at least 4 hours between doses. Under 50 kg the dose drops to 15 mg/kg. Here: 58 kg, last dose 1 g at 04:00, total 1 g in 24 h — the STAT dose is safe to give. Her recorded allergy is penicillin, which does not affect paracetamol, but you only know that because you looked.',
      ar: 'الحد الأقصى للبالغين ٤ غرام خلال ٢٤ ساعة مع فاصل ٤ ساعات على الأقل بين الجرعات. تحت ٥٠ كجم تصبح الجرعة ١٥ ملغ/كجم. هنا: الوزن ٥٨ كجم، وآخر جرعة ١ غرام الساعة ٠٤:٠٠، والمجموع ١ غرام خلال ٢٤ ساعة — إذن الجرعة الفورية آمنة. الحساسية المسجلة هي البنسلين ولا تؤثر على الباراسيتامول، لكنك عرفت ذلك لأنك تحققت.'
    }
  },

  /* 4 ------------------------------------------------------------------- */
  {
    id: 'rights',
    target: 'trolley',
    points: 15,
    requires: ['chart'],
    label:  { en: 'The rights of administration', ar: 'حقوق إعطاء الدواء' },
    prompt: {
      en: 'You have the Perfalgan bottle in your hand at the trolley. Which set do you verify at the bedside?',
      ar: 'عبوة البيرفالجان بين يديك عند عربة الأدوية. ما المجموعة التي تتحقق منها عند سرير المريضة؟'
    },
    options: [
      { correct: true,
        text: { en: 'Right patient, right drug, right dose, right route, right time — plus right documentation and the right to refuse',
                ar: 'المريض الصحيح، الدواء الصحيح، الجرعة الصحيحة، طريقة الإعطاء الصحيحة، الوقت الصحيح — إضافة إلى التوثيق الصحيح وحق المريض في الرفض' } },
      { text: { en: 'Right drug and right room',
                ar: 'الدواء الصحيح والغرفة الصحيحة' },
        feedback: { en: 'Two of the rights are missing entirely, and "right room" is not one of them.',
                    ar: 'ينقص هنا معظم الحقوق، و«الغرفة الصحيحة» ليست منها أصلاً.' } },
      { text: { en: 'Right colour of the bag and right shelf in the trolley',
                ar: 'لون الكيس الصحيح والرف الصحيح في العربة' },
        feedback: { en: 'Colour and position are look-alike traps — they are exactly how wrong-drug errors happen. Read the label three times.',
                    ar: 'اللون والموضع من مصائد التشابه — وهما بالضبط كيف تحدث أخطاء الدواء الخاطئ. اقرأ الملصق ثلاث مرات.' } },
      { text: { en: 'Right doctor and right ward',
                ar: 'الطبيب الصحيح والجناح الصحيح' },
        feedback: { en: 'Neither is a right of administration, and neither protects this patient.',
                    ar: 'لا هذا ولا ذاك من حقوق إعطاء الدواء، ولا يحمي أي منهما هذه المريضة.' } }
    ],
    rationale: {
      en: 'The five classic rights are the minimum. Add right documentation, right reason, right response, and the patient\'s right to refuse. Read the label three times: taking it from the trolley, preparing it, and discarding the container.',
      ar: 'الحقوق الخمسة الكلاسيكية هي الحد الأدنى. أضف إليها: التوثيق الصحيح، والسبب الصحيح، ومتابعة الاستجابة، وحق المريض في الرفض. واقرأ الملصق ثلاث مرات: عند أخذه من العربة، وعند التحضير، وعند التخلص من العبوة.'
    }
  },

  /* 5 ------------------------------------------------------------------- */
  {
    id: 'iv_site',
    target: 'ivpole',
    points: 20,
    requires: ['patient_id'],
    label:  { en: 'IV cannula site', ar: 'موقع القنية الوريدية' },
    prompt: {
      en: 'You inspect the cannula. The site is red, swollen and tender, and the infusion is running slowly. What do you do?',
      ar: 'تفحص القنية فتجد الموقع محمراً ومتورماً ومؤلماً، والتسريب يجري ببطء. ماذا تفعل؟'
    },
    options: [
      { correct: true,
        text: { en: 'Stop the infusion, remove the cannula, document the VIP score, and re-site a new cannula before giving the drug',
                ar: 'أوقف التسريب، وانزع القنية، ووثّق درجة VIP، وركّب قنية جديدة في موقع آخر قبل إعطاء الدواء' } },
      { text: { en: 'Flush it firmly to clear the blockage',
                ar: 'دفع السائل بقوة لفتح الانسداد' },
        feedback: { en: 'Never force a flush. You can dislodge an infected clot into the circulation or rupture the vein.',
                    ar: 'لا تدفع السائل بالقوة أبداً. قد تُزيح خثرة ملوّثة إلى الدورة الدموية أو تمزّق الوريد.' } },
      { text: { en: 'Give it anyway — the order is STAT',
                ar: 'أعطِ الدواء على أي حال — فالأمر فوري' },
        feedback: { en: 'Infusing into a phlebitic or infiltrated site delivers the drug into tissue, not blood, and can cause tissue damage.',
                    ar: 'التسريب في موقع ملتهب أو مرتشح يوصل الدواء إلى الأنسجة لا إلى الدم، وقد يسبب تلفاً نسيجياً.' } },
      { text: { en: 'Apply a warm pack and use the same line',
                ar: 'وضع كمادة دافئة واستخدام نفس الخط' },
        feedback: { en: 'A warm pack may be used after removal for comfort. It does not make a compromised line safe to use.',
                    ar: 'الكمادة الدافئة قد تُستخدم بعد النزع للتخفيف، لكنها لا تجعل خطاً متضرراً آمناً للاستخدام.' } }
    ],
    rationale: {
      en: 'Redness, swelling and pain together are a Visual Infusion Phlebitis score of 3 or more: stop immediately and re-site. Cannula sites are assessed at every shift and before every IV drug.',
      ar: 'الاحمرار والتورم والألم معاً يعني درجة VIP ٣ أو أكثر: أوقف فوراً وغيّر الموقع. تُقيَّم مواقع القنيات كل وردية وقبل كل دواء وريدي.'
    },
    effect: 'fixIV'
  },

  /* 6 ------------------------------------------------------------------- */
  {
    id: 'vitals',
    target: 'monitor',
    points: 15,
    requires: ['patient_id'],
    label:  { en: 'Baseline observations', ar: 'العلامات الحيوية الأساسية' },
    prompt: {
      en: 'The monitor shows T 38.9 °C, HR 92, BP 138/84, RR 20, SpO₂ 96 %. What is the priority action around this dose?',
      ar: 'تُظهر الشاشة: حرارة ٣٨٫٩، نبض ٩٢، ضغط ١٣٨/٨٤، تنفس ٢٠، تشبع أكسجين ٩٦٪. ما الإجراء ذو الأولوية حول هذه الجرعة؟'
    },
    options: [
      { correct: true,
        text: { en: 'Record a full set of observations and the early warning score before the dose, and repeat them afterwards',
                ar: 'سجّل مجموعة كاملة من العلامات الحيوية ودرجة الإنذار المبكر قبل الجرعة، ثم أعد قياسها بعدها' } },
      { text: { en: 'Only recheck the temperature, since Perfalgan is an antipyretic',
                ar: 'إعادة قياس الحرارة فقط، لأن البيرفالجان خافض للحرارة' },
        feedback: { en: 'Temperature alone hides deterioration. A rising respiratory rate is the earliest sign of a patient becoming unwell.',
                    ar: 'الحرارة وحدها تُخفي التدهور. ارتفاع معدل التنفس هو أبكر علامة على تدهور حالة المريض.' } },
      { text: { en: 'Skip them — a full set was taken six hours ago',
                ar: 'تخطّيها — فقد أُخذت مجموعة كاملة قبل ست ساعات' },
        feedback: { en: 'Six-hour-old observations cannot tell you whether this dose helped or whether she is deteriorating now.',
                    ar: 'قياسات عمرها ست ساعات لا تخبرك هل نفعت هذه الجرعة أم أن حالتها تتدهور الآن.' } }
    ],
    rationale: {
      en: 'Pre- and post-administration observations are what turn a drug round into a clinical assessment: they show whether the treatment worked and catch deterioration early. Escalate according to your NEWS2 or local early warning protocol.',
      ar: 'قياس العلامات الحيوية قبل الدواء وبعده هو ما يحوّل جولة الأدوية إلى تقييم سريري: فهو يبيّن هل نجح العلاج ويكشف التدهور مبكراً. صعّد الحالة وفق بروتوكول الإنذار المبكر NEWS2 أو المعتمد لديك.'
    }
  },

  /* 7 ------------------------------------------------------------------- */
  {
    id: 'rails',
    target: 'rail',
    points: 15,
    requires: ['hygiene'],
    label:  { en: 'Bed rails and fall risk', ar: 'حواجز السرير وخطر السقوط' },
    prompt: {
      en: 'The far rail is up but the near rail is down, and the patient is drowsy from fever. What is the safe action?',
      ar: 'الحاجز البعيد مرفوع والقريب منخفض، والمريضة ناعسة بسبب الحرارة. ما الإجراء الآمن؟'
    },
    options: [
      { correct: true,
        text: { en: 'Raise the near rail after a fall-risk assessment, keep the bed at its lowest height with the brakes on',
                ar: 'ارفع الحاجز القريب بعد تقييم خطر السقوط، وأبقِ السرير في أوطأ ارتفاع مع تثبيت المكابح' } },
      { text: { en: 'Raise all four rails so she cannot get out at all',
                ar: 'ارفع الحواجز الأربعة كي لا تستطيع الخروج إطلاقاً' },
        feedback: { en: 'Four raised rails count as a physical restraint. Patients climb over them and fall from a greater height, which causes worse injuries.',
                    ar: 'رفع الحواجز الأربعة يُعتبر تقييداً جسدياً. المرضى يتسلقونها فيسقطون من ارتفاع أكبر، مما يسبب إصابات أشد.' } },
      { text: { en: 'Leave it down so she can get out to the toilet easily',
                ar: 'اتركه منخفضاً لتستطيع الذهاب إلى الحمام بسهولة' },
        feedback: { en: 'A drowsy febrile patient getting out unassisted is exactly the fall you are trying to prevent. Offer scheduled toileting instead.',
                    ar: 'نهوض مريضة ناعسة ومحمومة دون مساعدة هو بالضبط السقوط الذي تحاول منعه. قدّم بدلاً من ذلك جولات مساعدة مجدولة للحمام.' } },
      { text: { en: 'Ask a family member to sit and watch her',
                ar: 'اطلب من أحد أفراد العائلة الجلوس لمراقبتها' },
        feedback: { en: 'Family presence is helpful but is not a substitute for an engineering control you are accountable for.',
                    ar: 'وجود العائلة مفيد لكنه ليس بديلاً عن إجراء وقائي أنت المسؤول عنه.' } }
    ],
    rationale: {
      en: 'Inpatient falls are the most frequently reported safety incident in hospitals. The standard safe configuration is two rails up, bed at lowest height, brakes locked, call bell in reach, and adequate lighting. Four rails require a documented restraint assessment.',
      ar: 'السقوط داخل المستشفى هو أكثر حوادث السلامة تبليغاً. الوضع الآمن المعياري: حاجزان مرفوعان، وسرير في أوطأ ارتفاع، ومكابح مثبتة، وجرس النداء في متناول اليد، وإضاءة كافية. رفع الحواجز الأربعة يتطلب تقييم تقييد موثّقاً.'
    },
    effect: 'raiseRail'
  },

  /* 8 ------------------------------------------------------------------- */
  {
    id: 'bed',
    target: 'bedcontrol',
    points: 10,
    requires: ['hygiene'],
    label:  { en: 'Bed height and brakes', ar: 'ارتفاع السرير والمكابح' },
    prompt: {
      en: 'The bed is in the high position and the brake pedal is released. What is correct for an unattended patient?',
      ar: 'السرير في الوضع المرتفع ودواسة المكبح غير مثبتة. ما الوضع الصحيح لمريض يُترك بلا مرافقة؟'
    },
    options: [
      { correct: true,
        text: { en: 'Lowest safe height with the brakes locked — raise it only while you are delivering care, then lower it again',
                ar: 'أوطأ ارتفاع آمن مع تثبيت المكابح — ولا تَرفعه إلا أثناء تقديم الرعاية ثم أعده منخفضاً' } },
      { text: { en: 'Leave it high — it saves the nurses\' backs',
                ar: 'اتركه مرتفعاً — فهذا أرحم لظهور الممرضين' },
        feedback: { en: 'Raise it for the procedure and lower it immediately after. Height is for the nurse only while the nurse is there.',
                    ar: 'ارفعه أثناء الإجراء وأعده فوراً بعده. الارتفاع لراحة الممرض فقط ما دام الممرض موجوداً.' } },
      { text: { en: 'Brakes only matter during a transfer',
                ar: 'المكابح مهمة فقط أثناء نقل المريض' },
        feedback: { en: 'An unbraked bed rolls when a patient pushes off it to stand — a very common fall mechanism.',
                    ar: 'السرير غير المكبوح يتحرك عندما يستند إليه المريض للوقوف — وهي آلية سقوط شائعة جداً.' } }
    ],
    rationale: {
      en: 'Bed at the lowest height reduces the distance of any fall; locked brakes stop the bed moving as a patient transfers. Both are checked at every patient contact and before you leave the bed space.',
      ar: 'إبقاء السرير في أوطأ ارتفاع يقلّل مسافة السقوط، وتثبيت المكابح يمنع تحرّك السرير أثناء انتقال المريض. ويُفحص الأمران عند كل تواصل مع المريض وقبل مغادرة محيط السرير.'
    },
    effect: 'lowerBed'
  },

  /* 9 ------------------------------------------------------------------- */
  {
    id: 'callbell',
    target: 'callbell',
    points: 10,
    requires: ['hygiene'],
    label:  { en: 'Call bell', ar: 'جرس النداء' },
    prompt: {
      en: 'The call bell has slipped onto the floor. What do you do before leaving the bed space?',
      ar: 'جرس النداء سقط على الأرض. ماذا تفعل قبل مغادرة محيط السرير؟'
    },
    options: [
      { correct: true,
        text: { en: 'Place it within reach on her unaffected side and confirm she can actually press it',
                ar: 'ضعه في متناول يدها السليمة وتأكد فعلياً من قدرتها على الضغط عليه' } },
      { text: { en: 'Put it on the bedside table where it is tidy',
                ar: 'ضعه على الطاولة الجانبية ليبقى المكان مرتباً' },
        feedback: { en: 'Tidy is not the same as reachable. A bell the patient has to get up to reach causes the fall it was meant to prevent.',
                    ar: 'الترتيب لا يعني إمكانية الوصول. جرس يضطر المريض للنهوض ليصل إليه يسبب السقوط الذي وُجد لمنعه.' } },
      { text: { en: 'Tell her to call out if she needs anything',
                ar: 'اطلب منها المناداة بصوت عالٍ إن احتاجت شيئاً' },
        feedback: { en: 'A breathless, weak or hoarse patient cannot be heard from the corridor, and nobody is listening for her.',
                    ar: 'المريضة المتعبة أو الضعيفة أو المبحوحة لن يُسمع صوتها من الممر، ولا أحد ينتظر نداءها.' } }
    ],
    rationale: {
      en: 'An unreachable call bell is a repeatedly documented contributing factor in inpatient falls. Placement is not enough — confirm reach and confirm the patient understands how to use it.',
      ar: 'بُعد جرس النداء عن متناول المريض عامل مساهم موثّق بشكل متكرر في حوادث السقوط. لا يكفي وضعه — بل تأكد من إمكانية الوصول إليه ومن فهم المريض لطريقة استخدامه.'
    },
    effect: 'placeBell'
  },

  /* 10 ------------------------------------------------------------------ */
  {
    id: 'documentation',
    target: 'workstation',
    points: 15,
    requires: ['rights'],
    label:  { en: 'Documentation', ar: 'التوثيق' },
    prompt: {
      en: 'When and how do you document the administration?',
      ar: 'متى وكيف توثّق إعطاء الدواء؟'
    },
    options: [
      { correct: true,
        text: { en: 'Immediately after giving it — you sign the record yourself with time, dose, route and site',
                ar: 'مباشرة بعد إعطائه — توقّع السجل بنفسك مع الوقت والجرعة وطريقة الإعطاء والموقع' } },
      { text: { en: 'Before giving it, so you do not forget in a busy shift',
                ar: 'قبل إعطائه حتى لا تنسى في وردية مزدحمة' },
        feedback: { en: 'Pre-documenting is a falsified record and a known cause of double dosing when you are then interrupted.',
                    ar: 'التوثيق المسبق تزوير للسجل، وسبب معروف للجرعة المضاعفة إذا قُوطعت بعده.' } },
      { text: { en: 'At the end of the shift, all the patients together',
                ar: 'في نهاية الوردية، لكل المرضى دفعة واحدة' },
        feedback: { en: 'Batch documenting hours later is unreliable from memory and leaves the next nurse without a current record.',
                    ar: 'التوثيق المجمّع بعد ساعات غير موثوق اعتماداً على الذاكرة، ويترك الممرض التالي بلا سجل محدّث.' } },
      { text: { en: 'Ask a colleague to sign for it while you move on',
                ar: 'اطلب من زميل التوقيع عنك بينما تكمل عملك' },
        feedback: { en: 'Never sign for a drug you did not personally give, and never ask anyone to sign for you.',
                    ar: 'لا توقّع أبداً على دواء لم تعطه بنفسك، ولا تطلب من أحد أن يوقّع عنك.' } }
    ],
    rationale: {
      en: 'Not documented means not done. The record must show drug, dose, route, site, exact time, the effect on the patient, and the signature of the person who gave it.',
      ar: 'ما لا يُوثَّق يُعتبر أنه لم يُنفَّذ. يجب أن يُظهر السجل: الدواء والجرعة وطريقة الإعطاء والموقع والوقت الدقيق وأثره على المريض وتوقيع من أعطاه.'
    }
  },

  /* 11 ------------------------------------------------------------------ */
  {
    id: 'sharps',
    target: 'sharps',
    points: 10,
    requires: ['rights'],
    label:  { en: 'Sharps disposal', ar: 'التخلص من الأدوات الحادة' },
    prompt: {
      en: 'You have finished. How do you deal with the used needle?',
      ar: 'انتهيت من الإجراء. كيف تتعامل مع الإبرة المستعملة؟'
    },
    options: [
      { correct: true,
        text: { en: 'Straight into the sharps bin at the point of use, without recapping',
                ar: 'مباشرة في حاوية الأدوات الحادة عند موقع الاستخدام، دون إعادة الغطاء' } },
      { text: { en: 'Recap it carefully first, then bin it',
                ar: 'أعد الغطاء بعناية أولاً ثم تخلّص منها' },
        feedback: { en: 'Recapping is the single commonest cause of needlestick injury. Do not recap, even one-handed, unless a device requires it.',
                    ar: 'إعادة الغطاء هي السبب الأول لإصابات وخز الإبر. لا تُعِد الغطاء، ولا حتى بيد واحدة، إلا إذا تطلّب الجهاز ذلك.' } },
      { text: { en: 'Put it in the general clinical waste bag',
                ar: 'ضعها في كيس النفايات الطبية العام' },
        feedback: { en: 'A needle in a soft bag will injure the porter or the waste handler who lifts it.',
                    ar: 'إبرة داخل كيس طري ستجرح عامل النقل أو المتعامل مع النفايات عند رفعه.' } },
      { text: { en: 'Leave it on the tray for the assistant to clear away',
                ar: 'اتركها على الصينية ليتخلّص منها المساعد' },
        feedback: { en: 'The person who uses a sharp disposes of it. Passing that risk to someone else is never acceptable.',
                    ar: 'من يستخدم الأداة الحادة هو من يتخلّص منها. نقل هذا الخطر إلى غيرك غير مقبول أبداً.' } }
    ],
    rationale: {
      en: 'Dispose at the point of use, do not recap, never overfill past the marked line, and never push waste down into a bin. If you do sustain a needlestick: wash, encourage bleeding, report immediately and follow post-exposure protocol.',
      ar: 'تخلّص منها عند موقع الاستخدام، ولا تُعِد الغطاء، ولا تتجاوز خط الامتلاء المحدد، ولا تضغط النفايات داخل الحاوية. وإن تعرّضت لوخزة: اغسل الموقع، وشجّع النزف، وبلّغ فوراً، واتبع بروتوكول ما بعد التعرض.'
    }
  }
];
