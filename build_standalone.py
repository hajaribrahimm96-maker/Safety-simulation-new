#!/usr/bin/env python3
"""
Builds ONE self-contained HTML file: Three.js, the simulation code and the
web font all inlined, so the demo opens by double-click with no server and
no internet.

يبني ملفاً واحداً مستقلاً يحتوي كل شيء ويعمل بالنقر المزدوج بدون إنترنت.
"""

import base64, pathlib, re, sys, io

ROOT   = pathlib.Path('/tmp/claude-0/-home-claude/02ab11b2-0436-5cb4-827b-47271d2e83de/scratchpad')
SRC    = ROOT / 'build'
THREE  = ROOT / 'threejs'
FONTS  = ROOT / 'gfonts/ofl'
OUT    = ROOT / 'dist'
OUT.mkdir(exist_ok=True)

FONT_FAMILY = sys.argv[1] if len(sys.argv) > 1 else 'Cairo'

# which files make up each family (variable fonts cover every weight)
FONT_FILES = {
    'Cairo':      [('cairo/Cairo[slnt,wght].ttf', '100 900')],
    'Tajawal':    [('tajawal/Tajawal-Regular.ttf', '400'), ('tajawal/Tajawal-Bold.ttf', '700')],
    'Almarai':    [('almarai/Almarai-Regular.ttf', '400'), ('almarai/Almarai-Bold.ttf', '700')],
    'ReadexPro':  [('readexpro/ReadexPro[HEXP,wght].ttf', '100 900')],
    'NotoKufi':   [('notokufiarabic/NotoKufiArabic[wght].ttf', '100 900')],
    'Alexandria': [('alexandria/Alexandria[wght].ttf', '100 900')],
    'Plex':       [('ibmplexsansarabic/IBMPlexSansArabic-Regular.ttf', '400'),
                   ('ibmplexsansarabic/IBMPlexSansArabic-Bold.ttf', '700')],
}

# ---------------------------------------------------------------- javascript

def read(p):
    return pathlib.Path(p).read_text(encoding='utf-8')

def names_in(clause):
    """'A, B as C, D' -> local names usable in scope."""
    out = []
    for part in clause.split(','):
        part = part.strip()
        if not part:
            continue
        if ' as ' in part:
            part = part.split(' as ')[-1].strip()
        out.append(part)
    return out


def bundle_js():
    core = read(THREE / 'build/three.core.js')
    mod  = read(THREE / 'build/three.module.js')
    orb  = read(THREE / 'examples/jsm/controls/OrbitControls.js')
    vrb  = read(THREE / 'examples/jsm/webxr/VRButton.js')
    rbg  = read(THREE / 'examples/jsm/geometries/RoundedBoxGeometry.js')
    env  = read(THREE / 'examples/jsm/environments/RoomEnvironment.js')

    # --- three.core.js: one trailing export list
    m = re.search(r'\nexport \{([^}]*)\};?\s*$', core, re.S)
    assert m, 'core export list not found'
    core_exports = names_in(m.group(1))
    core_body = core[:m.start()]

    # --- three.module.js: import from core, re-export from core, own export
    m_imp = re.search(r'^import \{([^}]*)\} from \'\./three\.core\.js\';\s*$', mod, re.M | re.S)
    m_re  = re.search(r'^export \{([^}]*)\} from \'\./three\.core\.js\';\s*$', mod, re.M | re.S)
    m_own = re.search(r'\nexport \{([^}]*)\};?\s*$', mod, re.S)
    assert m_imp and m_re and m_own, 'module export/import lists not found'
    mod_imports    = names_in(m_imp.group(1))
    mod_reexports  = names_in(m_re.group(1))
    mod_own        = names_in(m_own.group(1))

    mod_body = mod[:m_own.start()]
    mod_body = mod_body.replace(m_imp.group(0), '')
    mod_body = mod_body.replace(m_re.group(0), '')

    # --- OrbitControls / VRButton
    def addon(text):
        t = re.sub(r'^import \{[^}]*\} from \'three\';\s*', '', text, flags=re.M | re.S)
        return re.sub(r'\nexport \{[^}]*\};?\s*$', '\n', t, flags=re.S)

    orb_body = addon(orb)
    vrb_body = addon(vrb)
    rbg_body = addon(rbg)
    env_body = addon(env)

    # --- our own modules: strip import/export syntax, keep the code
    def strip_module(text):
        text = re.sub(r'^import[^;]*?;\s*$', '', text, flags=re.M | re.S)
        text = re.sub(r'^export (const|let|var|function|class) ', r'\1 ', text, flags=re.M)
        return text

    content = strip_module(read(SRC / 'js/content.js'))
    scene   = strip_module(read(SRC / 'js/scene.js'))
    app     = strip_module(read(SRC / 'js/app.js'))

    three_namespace = sorted(set(mod_reexports) | set(mod_own))

    return f"""/* =====================================================================
   Patient Safety Simulation — single-file build
   محاكاة سلامة المريض — نسخة الملف الواحد
   Bundled: three.js r180 (MIT) + simulation code + font.
   ===================================================================== */
(function () {{
'use strict';

/* ---------------------------------------------------- three.js core ---- */
const __core = (function () {{
{core_body}
return {{ {', '.join(core_exports)} }};
}})();

/* every core export in scope — three.module and the add-ons expect them */
const {{ {', '.join(core_exports)} }} = __core;

/* -------------------------------------------------- three.js renderer -- */
const __mod = (function () {{
{mod_body}
return {{ {', '.join(mod_own)} }};
}})();

const THREE = Object.freeze(Object.assign({{}}, __core, __mod));

/* --------------------------------------------------------- addons ----- */
const OrbitControls = (function () {{
{orb_body}
return OrbitControls;
}})();

const VRButton = (function () {{
{vrb_body}
return VRButton;
}})();

const RoundedBoxGeometry = (function () {{
{rbg_body}
return RoundedBoxGeometry;
}})();

const RoomEnvironment = (function () {{
{env_body}
return RoomEnvironment;
}})();

/* -------------------------------------------------- simulation code --- */
const __content = (function () {{
{content}
return {{ PATIENT, UI, TASKS }};
}})();
const {{ PATIENT, UI, TASKS }} = __content;

const __scene = (function () {{
{scene}
return {{ buildRoom, STATE_COLOR }};
}})();
const {{ buildRoom, STATE_COLOR }} = __scene;

(function () {{
{app}
}})();

}})();
"""


# ------------------------------------------------------------------- font

def build_font_css(family):
    """Subset to Arabic + Latin, pack as WOFF (zlib — no brotli needed),
       and return @font-face rules with the file embedded as base64."""
    from fontTools import subset
    from fontTools.ttLib import TTFont

    # everything the interface can show: Latin, Arabic, Arabic-Indic digits,
    # punctuation, the arrows and ticks used in the UI
    unicodes = (
        'U+0020-007E,'          # basic Latin
        'U+00A0-00FF,'          # latin-1 supplement (°, ×, é …)
        'U+0600-06FF,'          # Arabic
        'U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,'   # Arabic forms
        'U+2000-206F,'          # general punctuation (— · … ‎ ‏)
        'U+2070-209F,U+20A0-20BF,'
        'U+2190-21FF,U+2200-22FF,U+2460-24FF,U+25A0-25FF,U+2600-26FF,'
        'U+2713,U+2714,U+2717,U+00B7'
    )

    rules = []
    total = 0
    for rel, weight in FONT_FILES[family]:
        src = FONTS / rel
        font = TTFont(str(src))
        options = subset.Options()
        options.layout_features = ['*']          # Arabic shaping must survive
        options.name_IDs = ['*']
        options.notdef_outline = True
        options.recalc_bounds = True
        options.drop_tables = ['DSIG']
        options.flavor = 'woff'                  # zlib, no brotli required
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=subset.parse_unicodes(unicodes))
        subsetter.subset(font)
        font.flavor = 'woff'
        buf = io.BytesIO()
        font.save(buf)
        data = buf.getvalue()
        total += len(data)
        b64 = base64.b64encode(data).decode('ascii')
        rules.append(
            "@font-face{font-family:'PSIM';font-style:normal;font-weight:%s;"
            "font-display:swap;src:url(data:font/woff;base64,%s) format('woff')}"
            % (weight, b64))
    print(f'  font {family}: {total/1024:.0f} KB subsetted')
    return '\n'.join(rules)


# ------------------------------------------------------------------ build

def main():
    html = read(SRC / 'index.html')
    js = bundle_js()
    css = build_font_css(FONT_FAMILY)

    # replace the Google Fonts links with the embedded face
    html = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', html)
    html = re.sub(r'<link href="https://fonts\.googleapis[^>]*>\s*',
                  '<style>\n' + css + '\n</style>\n', html)

    # point the stylesheet at the embedded family
    html = html.replace(
        "--font:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;",
        "--font:'PSIM',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;")
    html = html.replace(
        "--font-ar:'IBM Plex Sans Arabic','Inter',system-ui,sans-serif;",
        "--font-ar:'PSIM',system-ui,sans-serif;")
    html = html.replace('font-family:var(--font-ar)', 'font-family:var(--font)')
    html = re.sub(r"'IBM Plex Sans Arabic', sans-serif", "'PSIM', sans-serif", html)
    html = re.sub(r"Inter, system-ui, sans-serif", "'PSIM', system-ui, sans-serif", html)

    # drop the import map and swap the module script for the bundle
    html = re.sub(r'<script type="importmap">.*?</script>\s*', '', html, flags=re.S)
    html = html.replace('<script type="module" src="js/app.js"></script>',
                        '<script>\n' + js + '\n</script>')

    out = OUT / 'patient-safety-simulation.html'
    out.write_text(html, encoding='utf-8')
    print(f'  built {out}  ({out.stat().st_size/1024/1024:.2f} MB)')


if __name__ == '__main__':
    main()
