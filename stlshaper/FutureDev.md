# FutureDev

## Priority Metric
Priority is assigned by a simple weighted score:
`Score = Impact (1-5) + Risk (1-5) + Frequency (1-5) - Effort (1-5)`

- Impact: user-visible severity (crash, broken output, major UX hit)
- Risk: likelihood of data loss/corruption or unusable models
- Frequency: how often normal usage hits the issue
- Effort: relative engineering cost to fix or implement

Priority bands:
- `P0`: Score 12-15 (must fix immediately)
- `P1`: Score 9-11
- `P2`: Score 6-8
- `P3`: Score 3-5

## Consolidated Priority Table
| Priority | Score | Method / Area | Description | Logic Behind | Bugs / Repairs Needed | Notes / Output |
| --- | --- | --- | --- | --- | --- | --- |
| P0 [solved] | 12 | Memory / Rendering | Stop GPU memory leaks by disposing or reusing meshes/materials on every scene update. | Rebuilding meshes without disposal steadily increases GPU memory and degrades performance until the page is unusable. | Ensure `geometry.dispose()` and `material.dispose()` or reuse a single mesh with updated geometry. | Prevents crashes and runaway slowdown. |
| DEPRECATED [solved] | 11 | IDW Fallback | Fix IDW fallback deformation so it does not reference undefined variables and matches worker behavior. | Fallback path is a crash path in unsupported worker environments. | Replace `pointX/pointY/pointZ` with control point data and align algorithm with worker implementation. | Consistent results across worker and non-worker paths. |
| P1 [solved] | 10 | Bounds / Centering | Recompute bounds after centering geometry so parameter ranges and control-point generation are correct. | Centering invalidates precomputed bounds, which breaks adaptive ranges and point placement. | After `center()`, recompute `boundingBox` and `boundingSphere`. | Stabilizes IDW ranges and visualization. |
| P1 [solved] | 9 | Camera UX | Scale camera min/max distance to model size and add a “Reset View” action. | Fixed limits make large/small models hard to navigate. | Set limits from bounding sphere radius and add a reset method. | Consistent navigation across model scales. |
| P1 [solved] | 9 | Rendering Perf | Avoid recreating meshes on every update; update geometry/materials in place. | Frequent full rebuilds cause GC churn and frame drops. | Keep one mesh, swap geometry, update material params. | Smoother interaction on slider changes. |
| P2 [solved] | 8 | Architecture | Add a deformation registry (params, UI, worker handler) to standardize new methods. | Current additions require scattered edits and increase errors. | Define a single source of truth for each method. | Implemented via `deformationRegistry` and shared params/UI bindings. |
| P2 [solved] | 8 | IDW UI / Logic | Align IDW behavior with UI: support single-point mode and multi-point control points editor. | `future` spec expects explicit control points; current code auto-generates only. | Add list-based control point editor; keep optional auto-generate. | Manual control points + optional auto-generate now supported. |
| P2 [solved] | 7 | New Methods | Implement: Inflate, Twist, Bend, Ripple, Warp, Hyperbolic Stretch. | These are contained deformations that validate the registry/worker pipeline. | Add parameterized transforms in worker and main thread. | Implemented in worker + main thread paths. |
| P2 [solved] | 7 | Topology Methods | Implement: Tessellation/Facet Splitting, Boundary Disruption, Menger Sponge. | Larger feature set but higher complexity and performance impact. | Requires new geometry generation and careful normals/bounds. | Implemented with bounds/normal recompute. |
| P2 [solved] | 7 | Performance | Add lightweight decimation or vertex merge option. | Large STLs bottleneck deformation costs. | Optional pre-processing step before deformation. | Preprocess supports decimation + merge. |
| P2 | 6 | Sampling | Accelerate IDW inside-mesh sampling with faster spatial test or fewer adaptive rays. | Current raycasting per candidate is expensive. | Use BVH, caching, or fewer test directions. | Cuts IDW setup time. |
| P2 [solved] | 6 | Pixelate Safety | Guard pixelation against empty geometry and ensure bounds valid after attribute replacement. | Degenerate meshes cause invalid bounds and render errors. | Skip bounding computations for empty geometry; update `needsUpdate` properly. | Guarded against empty mesh collapse. |
| P2 [solved] | 6 | Stats UX | Show model and deformation stats (verts, tris, deformation time). | Users can’t gauge performance cost or model size. | Track time in worker pipeline and show counts. | Stats HUD now live. |
| P2 | 6 | Lib Versions | Align library versions to avoid subtle render/control issues. | Mismatched versions can break controls or loaders. | Use matching Three.js + OrbitControls builds. | Reduces intermittent issues. |
| P3 | 5 | Help Text | Add tooltips or inline parameter help. | Reduces confusion for first-time users. | Small UI labels per control. | Faster onboarding. |
| P3 | 5 | Drag & Drop | Add STL drag-and-drop. | Convenience improvement. | Add drop zone and file handling. | Better UX. |
| P3 | 4 | State Restore | Persist UI state in local storage. | Small UX polish that saves time. | Store/restore last parameters. | Smoother return sessions. |
| P3 | 4 | Presets | Add compact preset picker (Subtle/Medium/Extreme/Organic/Crystalline). | Faster exploration. | Map presets to parameter sets. | Instant visual iteration. |
| P3 | 4 | Shortcuts | Add keyboard shortcuts for generate/export/toggle view. | Faster repeated actions. | Keyboard listener with guard on inputs. | Power-user benefit. |
| P3 | 4 | Accessibility | Add labels and visible focus states. | Improves usability for keyboard users. | Add `aria-label`, focus outlines. | Basic a11y improvement. |
| P3 | 3 | UI Throttling | Debounce progress/status updates to reduce layout thrash. | Minor optimization on large meshes. | Debounce progress UI updates. | Small perf win. |
| P3 | 3 | Help Modal | Add an optional help modal with examples. | Nice-to-have discovery tool. | Simple modal with screenshots/tips. | Non-critical polish. |
