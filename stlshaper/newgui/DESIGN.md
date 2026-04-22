# STLShaper GUI — Design Documentation

A design exploration for a new GUI for [STLShaper](https://toledoem.github.io/stlshaper/) (repo: [ToledoEM/stlshaper](https://github.com/ToledoEM/stlshaper)) — a real-time STL deformation tool built on Three.js.

The new interface is framed as a **Deformation Workbench**: a scientific-instrument metaphor rather than a typical creative-app dashboard. The intent is to make the tool feel precise and purposeful — a laboratory worksheet for deliberately distorting 3D geometry.

---

## 1. Design System

### 1.1 Aesthetic Direction

- **Metaphor:** Laboratory worksheet / instrument panel. Ruled paper, hairline dividers, tabular readouts, numeric discipline.
- **Tone:** Precise, technical, honest. No decorative fluff, no drop shadows on cards, no rounded SaaS pillows.
- **Theme:** **Light is the default**, with a dark toggle in the top-right and in the Tweaks panel. Both themes are first-class — paper-white for focused daylight work, warm graphite for long sessions.

### 1.2 Color Tokens

All color is declared in `oklch()` for perceptual consistency across themes.

| Token           | Light                       | Dark                         | Purpose                          |
| --------------- | --------------------------- | ---------------------------- | -------------------------------- |
| `--paper`       | `oklch(0.985 0.004 85)`     | `oklch(0.165 0.006 80)`      | Viewport / main background       |
| `--paper-2`     | `oklch(0.965 0.006 85)`     | `oklch(0.195 0.006 80)`      | Rails, status bar                |
| `--paper-3`     | `oklch(0.935 0.008 85)`     | `oklch(0.235 0.008 80)`      | Hover / pressed surfaces         |
| `--rule`        | `oklch(0.86  0.008 80)`     | `oklch(0.32  0.008 80)`      | Primary 1px dividers             |
| `--rule-soft`   | `oklch(0.92  0.006 80)`     | `oklch(0.26  0.006 80)`      | Internal / dashed dividers       |
| `--ink`         | `oklch(0.18  0.012 60)`     | `oklch(0.96  0.006 85)`      | Primary text, active toggles     |
| `--ink-2`       | `oklch(0.36  0.012 60)`     | `oklch(0.78  0.008 80)`      | Secondary text                   |
| `--ink-3`       | `oklch(0.55  0.010 70)`     | `oklch(0.58  0.010 75)`      | Labels, metadata, placeholders   |
| `--accent`      | `oklch(0.52  0.19  25)`     | `oklch(0.70  0.17  25)`      | Single signal color (see below)  |
| `--live`        | `oklch(0.62  0.21  25)`     | `oklch(0.72  0.20  25)`      | LIVE pulse indicator             |

The background is a **warm-cool neutral** (hue ≈ 80°) to avoid a clinical bluish tint and to read more like paper. Saturation stays well below 0.02 in neutrals to keep them truly neutral.

### 1.3 Accent — single signal color

One restrained accent is used for **active deformation state** and the LIVE pulse only. The default is a deep arterial red (`oklch(0.52 0.19 25)`) — an unusual but thematically fitting choice, because STL deformation is ultimately about making geometry *wrong*, and a surgical/anatomical red carries that intent without being decorative.

Accent is swappable via **Tweaks**: `red`, `ink` (monochrome), `blue` (user default), `green`, `amber`. All accent values share similar chroma/lightness envelopes so they remain restrained at any hue.

### 1.4 Typography

Three families, each with a specific role:

- **Instrument Serif** — wordmark and display only. Gives the tool a scientific-publication feel.
- **IBM Plex Sans** — all UI (`--fs`). Neutral, slightly technical, excellent at small sizes.
- **IBM Plex Mono** — all numeric values, axis labels, codes, status bar (`--fm`). Tabular numerals are enabled globally so sliding values don't jitter.

Font feature settings `ss01` and `cv11` are on for Plex's single-storey "a" and alternate "g", which reduce visual noise at 10–11px.

### 1.5 Spacing, Rule, Rhythm

- Base unit: **4px**. All padding is a multiple (4 / 8 / 10 / 12 / 14 / 16).
- Dividers are **1px hairlines**, never 2px. Internal group dividers use `--rule-soft` (dashed where appropriate) to reduce visual weight.
- No rounded corners anywhere except the 2px chip on keyboard shortcut hints — the whole design is orthogonal on purpose.
- **No shadows** inside the app shell. Only the Tweaks panel lifts with a shadow because it floats over the chrome.

### 1.6 Density

Two modes exposed as Tweaks:

- **Cozy** (default) — 13px base, comfortable for 1440px workstations.
- **Compact** — 12px base, tuned for laptop screens where vertical real estate is scarce.

---

## 2. Layout

The app uses a three-column CSS Grid:

```
+---------------------------- top (44px) ----------------------------+
|  brand | menubar ............................ | actions           |
+--------+---------------------------+----------+-------------------+
|        |                           |                              |
|  left  |          main             |           right              |
| 296px  |         viewport          |          332px               |
|        |                           |                              |
+--------+---------------------------+------------------------------+
|                       status bar (26px)                           |
+-------------------------------------------------------------------+
```

This split is chosen because STLShaper has three distinct concerns: **what** is being deformed (left), **the result** (center), **how** to deform (right).

---

## 3. Top Bar

### 3.1 Brand Mark
A small square mark made of crossed diagonals and a rotated inner square — an abstraction of the "pivot/deformation point" that sits at the heart of every effect in the repo (every deformation is applied around a point or along an axis). Paired with a two-tier wordmark: **stl*shaper*** in Instrument Serif (the italic half picks up the accent color), and an uppercase mono subtitle "DEFORMATION WORKBENCH · v0.7".

### 3.2 Menubar
Six top-level menus — **File, Edit, View, Preset, Workers, Help**. `Workers` is promoted to a top-level menu because the repo leans heavily on Web Workers for parallel IDW/tessellation solves; users will want an obvious place to manage them.

### 3.3 Theme Toggle
A two-cell `LT / DK` toggle immediately left of the primary actions. It's *not* a sunny-icon → moony-icon affair — it's a labeled segmented control, because the tool is aimed at technical users who prefer explicit controls. The toggle is wired to both CSS variables and the Tweaks system, so the choice persists across reloads.

### 3.4 Actions
- **Import STL** (secondary, ⌘O) — the primary entry point for the user's source geometry.
- **Export STL** (primary, ⌘E, filled ink button) — the single most important destructive/final action, so it gets the loudest weight in the chrome.

---

## 4. Left Rail — Specimen, Presets, Post-process

### 4.1 Specimen Card
The loaded STL is presented as a **specimen** — a term borrowed from lab work. The card contains:

- A **viewport thumbnail** with a subtle 14px graph-paper background and a simple wireframe polyhedron silhouette (placeholder — in the real build this becomes a rendered preview of the loaded mesh).
- A monospace tag `STL · BINARY` indicating file format.
- File name + truncated path in mono.
- A 2×2 **stats grid** showing the four numbers the repo actually reports: **Vertices**, **Triangles**, **Bounds (mm)**, **File size**. These map directly to the Stats HUD referenced in the README.

Below the card are three row actions — **Reload** (re-read the file from disk), **Swap** (open a new STL), **Center** (re-center the camera on the geometry).

### 4.2 Presets
A stacked list of saved presets. Each row shows a colored dot (accent dot marks the active preset), the preset name, and a small mono metadata chip (here used to suggest file size / complexity). Below the list are two actions — **Import .json** and **Save Preset** — matching the repo's v0.6.0 "importable deformation settings" feature.

### 4.3 Post-process Checklist
The README calls out three required Meshlab post-processing steps. Rather than bury that in docs, the GUI surfaces it as a live checklist the user works through, with two items pre-marked as done (auto-executed by the tool on export) and one manual step remaining. Each item has a checkbox mark, a primary label, and a mono sub-line giving the specific Meshlab filter path.

---

## 5. Main Viewport

The heart of the tool.

### 5.1 Background
A double-layered grid: 48px major squares over 12px minor squares, with a soft radial gradient darkening toward center-bottom to imply a stage/ground. The grid is **toggleable** via Tweaks for users who want a clean canvas.

### 5.2 Corner Brackets
Four small L-shaped brackets at the inner corners — a photographer's framing cue. They reinforce the "specimen under inspection" metaphor without drawing attention to themselves.

### 5.3 3D Specimen Placeholder
An animated SVG wireframe of an ellipsoid being deformed by a sine wave in real time (redrawn every 120ms). In a production build this is replaced by the actual Three.js canvas. The wireframe has:

- **34×18 grid lines** drawn as two orthogonal polyline sets.
- **Opacity falloff** toward mesh edges — a trick that creates depth without needing real lighting.
- **Annotation callouts** in mono: control-point markers (`CP·03`, `CP·08 · w 0.42`) and an aggregate delta readout (`Δ 0.84 mm avg · 3.21 mm max`). These mimic what the IDW Shepard deformer exposes in the source code.

### 5.4 HUD Elements

All HUD panels share the same visual treatment: semi-transparent `paper` background with `backdrop-filter: blur(6px)` and a 1px `rule` border. This keeps them legible without punching holes through the scene.

- **Viewport toolbar (top-left)** — Orbit / Pan / Zoom / Home / Wireframe toggle. Icons are 14px line-art SVGs (no emoji).
- **Shading mode (top-right)** — `SHADED · WIRE · POINTS · X-RAY` segmented control, mono caps. These are the standard Three.js material modes exposed simply.
- **LIVE pill (top-center)** — a pulsing red dot plus the current deformation summary (`Sine · driver Y · displ XZ`). Updates instantly when the user flips any parameter. This is the at-a-glance confirmation that the GUI is tracking the scene.
- **Axis gizmo (bottom-left)** — the "on-screen X/Y/Z labels for orientation" mentioned in the v0.6.0 changelog. Rendered as a small SVG with R/G/B color-coded axes (following the 3D convention) and mono labels.
- **Live readout (bottom-right)** — 4-cell tabular data strip: FPS · Solve time · Workers active · Camera FOV. Solve time is colored with the accent so the user can immediately see when a change is expensive.
- **Crosshair (center)** — 1px tick at the exact viewport center, 40% opacity. A quiet reference for the camera pivot.

---

## 6. Right Rail — Deformation Controls

### 6.1 Family Tabs
The repo exposes **13 deformations**. Cramming all 13 into one list is overwhelming, so they're grouped into three families that match the README's own prose:

- **Base** — Sine Wave, Noise, Pixelate, IDW Shepard.
- **Surface** — Inflate, Twist, Bend, Ripple, Warp, Hyperbolic Stretch.
- **Topology** — Tessellate, Boundary Disruption, Menger Sponge.

The active family is underlined with a 2px accent bar (a common instrument-panel tab convention).

### 6.2 Effects Grid
Within a family, effects are listed as a 2-column grid. Each cell shows the effect name and a mono code (`B · 02`, `S · 04`…) — the code is cosmetic but reinforces the instrument feel and gives users a quick shorthand when referencing a specific effect in notes. The active cell is marked with a 3px accent bar on its inset left edge.

### 6.3 Parameters Section
Each parameter is a single row with three columns:

```
[label (92px)]  [slider (flex)]  [value readout (58px)]
```

- Labels are plain sans-serif at `ink-2` weight.
- Sliders are a **1px center rule** with 4–5 major ticks, a 2px ink fill, and a 12px hollow square thumb with a 1.5px stroke. This is deliberately flat — it reads as a measurement instrument, not a web toy. Clicking or dragging updates the fill, thumb, and the numeric readout live.
- The value readout is a tight monospace field with a 1px border, so users can tell it's editable without any affordance clutter.

The section header reads `PARAMETERS · <EFFECT NAME>` with an `Adaptive` chip on the right — the repo makes a big deal of adaptive parameter ranges, and the chip is a quiet promise that the ranges are scaling to the model.

### 6.4 Axis Pills
Effects with an axis dimension (Sine, Noise, Twist, Bend, Ripple, Hyperbolic) expose axis selectors as three mono pills — **X / Y / Z** — that can be toggled independently, matching the repo's v0.6.0 "multi-axis selection" feature. Sine specifically has **two** axis rows: **DRIVER** (the input axis to the sin function) and **DISPLACE** (which axes the output displaces) — this is one of the few places where the naming from the source code is technical enough that the label has to be precise rather than friendly.

### 6.5 Toggles
Simple 30×16 switches for the boolean flags:

- **Real-time update** (on) — live recompute as sliders move.
- **Show control points** — the wireframe spheres the IDW deformer draws.

### 6.6 Preprocess Block
A separate section (with its own `PREPROCESS · OPTIONAL` header) for the two cleanup options the README describes:

- **Decimate** (keep 80%) — reduces triangle count before deformation for faster iteration.
- **Vertex merge · ε 0.001** (on) — collapses near-identical vertices within an epsilon to stabilize the mesh.

Pre-process settings are exported with the preset, per the v0.6.0 changelog.

### 6.7 Generate Bar
A sticky bottom action strip with **Reset** (revert parameters) and **Generate Deformation** (accent-filled, dominant). The primary action deliberately gets the loudest color weight in the whole UI — because in a real-time tool with preview, the actual "commit" moment still matters.

---

## 7. Status Bar

A single-line 26px mono strip at the bottom:

```
READY  |  falcon_millennium.stl · loaded  |  Workers ● 4 / 8 active  |  Last solve 142 ms  ...  mm · right-handed · Z-up  |  v0.7 · build 2026.04.21
```

Designed to answer four questions at a glance: **what state is the app in**, **what's loaded**, **how is compute doing**, and **what coordinate conventions am I in** (mm, right-handed, Z-up — important when exporting for slicers that may assume Y-up).

---

## 8. Tweaks Panel

An inline tweak surface in the bottom-right, toggled from the toolbar's Tweaks switch. Contains four controls that persist to disk:

1. **Theme** — Light (default) / Dark.
2. **Accent** — 5 swatches: red (default signal), ink (monochrome), blue, green, amber.
3. **Density** — Cozy / Compact.
4. **Viewport grid** — On / Off.

State is written via `postMessage({type:"__edit_mode_set_keys", edits: {...}})` to the host, and the `TWEAK_DEFAULTS` JSON block at the top of the file is rewritten on disk, so preferences survive reloads.

---

## 9. Intentional Non-Choices

A few things the design deliberately **doesn't** do, because they'd betray the tone:

- **No emoji** anywhere. Technical tools don't need them, and they'd clash with Instrument Serif.
- **No gradients on buttons or cards** (only one very subtle radial on the viewport stage).
- **No iconography on effect tiles** — the effect names are short and descriptive, and drawing unique icons for 13 distortion algorithms would be an arms race toward decorative noise.
- **No skeuomorphic 3D knobs.** Sliders are 1D rules with a square thumb. Precision beats playfulness for a tool about math.
- **No hand-drawn SVG imagery of the geometry itself** — the specimen thumbnail and viewport use only gridded wireframes, which is honest about what the placeholder represents.

---

## 10. File Map

- `STLShaper GUI.html` — the single self-contained design file. Contains CSS tokens, layout, all HUD components, the Tweaks panel, the animated SVG specimen, and all interactive wiring.
- `DESIGN.md` — this document.
