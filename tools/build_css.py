"""Regenerate docs/assets/page_design.css from design-system/tokens.json + design-system/components/bundle.css.
Run from anywhere: python3 tools/build_css.py"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DS = os.path.join(ROOT, "design-system")
tok = json.load(open(f"{DS}/tokens.json"))
bundle = open(f"{DS}/components/bundle.css").read()

# ── tokens -> css ────────────────────────────────────────────
def color_block(theme):
    out = []
    for t in tok["color"]["tokens"]:
        v = t["value"]; v = v if isinstance(v, str) else v.get(theme, v["light"])
        out.append(f"  --{t['name']}: {v};")
    for t in tok["shadow"]["tokens"]:
        v = t["value"]; v = v if isinstance(v, str) else v.get(theme, v["light"])
        out.append(f"  --{t['name']}: {v};")
    return "\n".join(out)

static = []
for fam in ("spacing", "radius", "layout"):
    for t in tok[fam]["tokens"]:
        static.append(f"  --{t['name']}: {t['value']};")
for k, v in tok["type"]["families"].items():
    static.append(f"  --font-{k}: {v};")

tokens_css = f"""/* ── Tokens (from tokens.json) ── */
:root, [data-theme="light"] {{
{color_block('light')}
}}
/* light theme only: the dark palette is intentionally not emitted */
:root {{ color-scheme: light; }}
:root {{
{chr(10).join(static)}
}}
"""

bridge = """
/* ── Zensical bridge ──────────────────────────────────────────
   Map the theme's own variables to ours so anything outside .tm-root
   (other pages, search, admonitions) follows the same palette. */
:root, [data-md-color-scheme] {
  --md-default-bg-color: var(--paper);
  --md-default-fg-color: var(--ink);
  --md-default-fg-color--light: var(--ink-2);
  --md-default-fg-color--lighter: var(--ink-3);
  --md-default-fg-color--lightest: var(--line);
  --md-primary-fg-color: var(--accent);
  --md-primary-bg-color: var(--on-accent);
  --md-accent-fg-color: var(--accent-strong);
  --md-typeset-a-color: var(--accent);
  --md-code-bg-color: var(--sunken);
  --md-code-fg-color: var(--ink);
  --md-text-font: "Geist";
  --md-code-font: "Geist Mono";
}
body { background: var(--paper); }

/* The monopage brings its own nav and footer: hide the theme chrome
   on any page that contains .tm-root, and let it run full-bleed. */
body:has(.tm-root) .md-header,
body:has(.tm-root) .md-tabs,
body:has(.tm-root) .md-footer,
body:has(.tm-root) .md-sidebar { display: none; }
body:has(.tm-root) .md-main__inner,
body:has(.tm-root) .md-grid { max-width: none; margin: 0; }
body:has(.tm-root) .md-content { max-width: none; margin: 0; }
body:has(.tm-root) .md-content__inner { margin: 0; padding: 0; }
body:has(.tm-root) .md-content__inner::before { display: none; }
body:has(.tm-root) .md-content__button { display: none; }

/* Neutralise .md-typeset defaults inside the monopage. */
.md-typeset .tm-root { font-size: 17px; line-height: 28px; }
.md-typeset .tm-root :is(h1, h2, h3, p) { margin-top: 0; }
[dir] .md-typeset .tm-root :is(ul, ol) { margin: 0; }
[dir] .md-typeset .tm-root li { margin: 0; }
.md-typeset .tm-root img { max-width: 100%; }
"""

# ── prefix every component selector with .md-typeset (beats theme rules) ──
def prefix_sel(sel):
    sel = sel.strip()
    if sel.startswith(":root") or sel.startswith("@") or not sel:
        return sel
    if sel.startswith(".tm-js "):
        return ".tm-js .md-typeset .tm-root " + sel[len(".tm-js "):]
    if sel.startswith(".tm-root"):
        return ".md-typeset " + sel
    return ".md-typeset .tm-root " + sel

def prefix_css(css):
    out, i = [], 0
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"@import url\([^)]*\)\s*;", "", css)
    # tokenise into top-level blocks, recursing into @media
    def walk(s):
        res, pos = [], 0
        while True:
            m = re.search(r"([^{}]+)\{", s[pos:])
            if not m: break
            head = m.group(1).strip()
            start = pos + m.end()
            depth, j = 1, start
            while depth:
                if s[j] == "{": depth += 1
                elif s[j] == "}": depth -= 1
                j += 1
            body = s[start:j - 1]
            if head.startswith("@media") or head.startswith("@supports"):
                res.append(f"{head} {{\n{walk(body)}\n}}")
            elif head.startswith("@"):
                res.append(f"{head} {{{body}}}")
            else:
                sels = ", ".join(prefix_sel(x) for x in head.split(","))
                res.append(f"{sels} {{{body.strip()}}}")
            pos = j
        return "\n".join(res)
    return walk(css)

font_import = re.search(r"@import url\([^)]*\)\s*;", bundle).group(0)
kit_css = (f"{font_import}\n/* Toledo for Zensical — generated from tokens.json + components/bundle.css. Edit those, not this. */\n"
           + tokens_css + bridge + "\n/* ── Components ── */\n" + prefix_css(bundle) + "\n")
open(os.path.join(ROOT, "docs/assets/page_design.css"), "w").write(kit_css)
print("wrote docs/assets/page_design.css")

