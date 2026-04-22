# STLShaper New GUI — POC Plan

## Goal
Turn `newgui/STLShaper GUI.html` from a static design mockup into a working
proof-of-concept: real STL load, real Three.js viewport, one live deformation.

## Files touched
- `newgui/STLShaper GUI.html` — only file changed
- `../libraries/` — vendor Three.js + STLLoader already exist, link from here

---

## Steps

### 1. Import STL button
- Add hidden `<input type="file" accept=".stl">` wired to "Import STL" btn
- Parse binary/ASCII STL (reuse STLLoader from `../libraries/`)
- On load: update specimen card (filename, path, vertices, triangles, bounds mm, file size)
- On load: auto-scale camera to fit model (see feedback item 4)

### 2. Real Three.js viewport
- Remove animated SVG mesh placeholder
- Add `<canvas>` inside `.specimen-3d` div
- Bootstrap Three.js scene (PerspectiveCamera, WebGLRenderer, ambient + dir lights)
- Load parsed geometry into MeshPhongMaterial, add to scene
- Render loop: requestAnimationFrame, update FPS readout

### 3. Orbit controls
- Vendor `OrbitControls.js` from `../libraries/` (already present)
- Connect vp-toolbar buttons:
  - Orbit → enable rotate
  - Pan → enable pan only
  - Zoom → enable zoom only
  - Home → reset camera to fit model
  - Wireframe → toggle material wireframe

### 4. Shading modes
- Shaded → MeshPhongMaterial, normal lighting
- Wire → wireframe overlay
- Points → PointsMaterial
- X-ray → MeshPhongMaterial + transparent + depthWrite false + opacity 0.3

### 5. Auto-scale on load (feedback item 4)
- After STL load compute bounding box
- If model larger than camera frustum: fit camera to bbox
- Status bar shows model bounds in mm

### 6. Live readout
- FPS: count frames in render loop
- Solve time: placeholder "—" until deformation runs
- Workers: hardcode 0 / 8 until WorkerPool wired
- Camera FOV: read from camera.fov

### 7. Sine Wave deformation (one deformation, prove the pattern)
- Copy sine wave algo from `../worker.js` into a `<script>` block in the HTML
- Connect right-rail sliders (Amplitude, Frequency, Phase) to deformParams object
- Driver axis pills → deformParams.sineAxis
- Displace axis pills → deformParams.sineDisplace
- "Generate Deformation" btn → run sine on geometry vertices → update BufferGeometry
- Measure solve time → update readout
- "Reset" btn → reload original geometry

### 8. Export STL
- Wire "Export STL" btn to binary STL serializer (copy from `../main.js`)
- Use FileSaver from `../libraries/` → download file

---

## Out of scope for POC
- All other deformations (Noise, Pixelate, IDW, Twist, Bend, Ripple…)
- Real WorkerPool (deformation runs on main thread in POC)
- Presets (import/save)
- IDW control point widgets
- Status bar coord system toggle
- Tweaks persistence to disk
- Meshlab checklist automation

---

## Order of work
1 → 2 → 3 → 5 → 4 → 6 → 7 → 8

Validate STL loads and renders before touching deformation.

---

## Risk
main.js loads as ES module — silent errors kill app.
POC is self-contained in one HTML file, no module system, so this risk is isolated.
Test incrementally after each step.
