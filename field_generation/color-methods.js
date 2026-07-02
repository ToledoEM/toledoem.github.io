/**
 * color-methods.js
 * Palette-based color mapping for flow field paths.
 *
 * All methods compute t ∈ [0,1] per path, then:
 *   t_mapped = frac((t * scale) + offset)
 *   color    = palette[floor(t_mapped * n)]
 *
 * context passed to assignPath:
 *   { startX, startY, pathLength, pathIndex, pathCount,
 *     field, columns, rows, STEP_SIZE, noise, seed, params }
 */

(function initColorMethods(root) {

  // Mulberry32 seeded RNG — same PRNG used by the rest of the app
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Smooth noise helper (no p5 dependency)
  function smoothNoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const fx = fade(xf), fy = fade(yf);
    const hash = (a, b) => Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
    const frac = v => v - Math.floor(v);
    const grad = (ix, iy, px, py) => {
      const h = frac(Math.abs(hash(ix, iy)));
      const angle = h * Math.PI * 2;
      return Math.cos(angle) * (px - ix) + Math.sin(angle) * (py - iy);
    };
    return (
      grad(xi,     yi,     x, y) * (1 - fx) * (1 - fy) +
      grad(xi + 1, yi,     x, y) *      fx  * (1 - fy) +
      grad(xi,     yi + 1, x, y) * (1 - fx) *      fy  +
      grad(xi + 1, yi + 1, x, y) *      fx  *      fy
    ) * 0.5 + 0.5; // remap from [-1,1] to [0,1]
  }

  // Apply scale + offset to t, wrapping in [0,1]
  function mapT(t, scale, offset) {
    const v = (t * scale + offset) % 1.0;
    return v < 0 ? v + 1 : v;
  }

  // Pick palette color from t ∈ [0,1]
  function pickColor(colors, t) {
    const n = colors.length;
    const idx = Math.min(n - 1, Math.floor(t * n));
    return colors[idx];
  }

  // Resolve the active palette colors array from FIELD_PALETTES
  function resolveColors(params) {
    const id = params && params.paletteId;
    if (id && typeof FIELD_PALETTES !== "undefined") {
      const entry = FIELD_PALETTES.getById(id);
      if (entry && entry.colors.length) return entry.colors;
    }
    return null;
  }

  const COLOR_METHODS = {

    random: {
      name: "Random",
      // Each path draws a seeded-random t. Coverage controls what fraction of
      // paths receive color (uncovered paths return null → drawn in default black).
      assignPath(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const rng = mulberry32((ctx.params.seed ^ (ctx.pathIndex * 2654435761)) >>> 0);
        if (rng() > (ctx.params.coverage ?? 1.0)) return null;
        const t = mapT(rng(), ctx.params.scale, ctx.params.offset);
        return pickColor(colors, t);
      },
      assignPoint(ctx) {
        // Per-point: same base color as path, shifted slightly by position along path
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const rng = mulberry32((ctx.params.seed ^ (ctx.pathIndex * 2654435761)) >>> 0);
        if (rng() > (ctx.params.coverage ?? 1.0)) return null;
        const tBase = rng();
        const t = mapT(tBase + ctx.pointT * 0.15, ctx.params.scale, ctx.params.offset);
        return pickColor(colors, t);
      },
    },

    fieldAngle: {
      name: "Field Angle",
      // Maps the flow-field vector angle at the path's start cell to t.
      assignPath(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const { startX, startY, field, columns, rows, STEP_SIZE } = ctx;
        if (!field || !columns || !rows) return colors[0];
        const col = Math.max(0, Math.min(columns - 1, Math.floor(startX / (STEP_SIZE || 4))));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(startY / (STEP_SIZE || 4))));
        const v = field[col + row * columns];
        if (!v) return colors[0];
        const angle = Math.atan2(v.y, v.x); // -PI..PI
        const raw = (angle + Math.PI) / (2 * Math.PI); // 0..1
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
      assignPoint(ctx) {
        // Per-point: look up field angle at each point's position
        const colors = resolveColors(ctx.params);
        if (!colors) return colors ? colors[0] : null;
        const { x, y, field, columns, rows, STEP_SIZE } = ctx;
        if (!field || !columns || !rows) return colors[0];
        const col = Math.max(0, Math.min(columns - 1, Math.floor(x / (STEP_SIZE || 4))));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(y / (STEP_SIZE || 4))));
        const v = field[col + row * columns];
        if (!v) return colors[0];
        const angle = Math.atan2(v.y, v.x);
        const raw = (angle + Math.PI) / (2 * Math.PI);
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
    },

    fieldMagnitude: {
      name: "Field Magnitude",
      // Maps field vector magnitude at path start to t (normalized over all paths).
      assignPath(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const { startX, startY, field, columns, rows, STEP_SIZE } = ctx;
        if (!field || !columns || !rows) return colors[0];
        const col = Math.max(0, Math.min(columns - 1, Math.floor(startX / (STEP_SIZE || 4))));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(startY / (STEP_SIZE || 4))));
        const v = field[col + row * columns];
        if (!v) return colors[0];
        const mag = Math.sqrt(v.x * v.x + v.y * v.y);
        // Normalize against the max field magnitude stored in ctx
        const raw = ctx.maxMag > 0 ? Math.min(mag / ctx.maxMag, 1) : 0;
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
      assignPoint(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const { x, y, field, columns, rows, STEP_SIZE } = ctx;
        if (!field || !columns || !rows) return colors[0];
        const col = Math.max(0, Math.min(columns - 1, Math.floor(x / (STEP_SIZE || 4))));
        const row = Math.max(0, Math.min(rows - 1, Math.floor(y / (STEP_SIZE || 4))));
        const v = field[col + row * columns];
        if (!v) return colors[0];
        const mag = Math.sqrt(v.x * v.x + v.y * v.y);
        const raw = ctx.maxMag > 0 ? Math.min(mag / ctx.maxMag, 1) : 0;
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
    },

    perlinNoise: {
      name: "Perlin Noise",
      // Samples smooth noise at the path's canvas position for spatial coherence.
      assignPath(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const nx = ctx.startX / (ctx.canvasW || 800);
        const ny = ctx.startY / (ctx.canvasH || 800);
        const raw = smoothNoise(nx * 4, ny * 4); // 4 = noise frequency
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
      assignPoint(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const nx = ctx.x / (ctx.canvasW || 800);
        const ny = ctx.y / (ctx.canvasH || 800);
        const raw = smoothNoise(nx * 4, ny * 4);
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
    },

    pathLength: {
      name: "Path Length",
      // Longer paths get a higher t. Normalized against the longest path.
      assignPath(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const raw = ctx.maxPathLen > 0 ? Math.min(ctx.pathLength / ctx.maxPathLen, 1) : 0;
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
      assignPoint(ctx) {
        // t advances linearly from path start to end
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const t = mapT(ctx.pointT, ctx.params.scale, ctx.params.offset);
        return pickColor(colors, t);
      },
    },

    index: {
      name: "Index",
      // t = draw order / total paths — sweeps the palette sequentially.
      assignPath(ctx) {
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const raw = ctx.pathIndex / Math.max(ctx.pathCount - 1, 1);
        return pickColor(colors, mapT(raw, ctx.params.scale, ctx.params.offset));
      },
      assignPoint(ctx) {
        // Per-point: blend path-index color toward end of palette as t advances
        const colors = resolveColors(ctx.params);
        if (!colors) return null;
        const pathRaw = ctx.pathIndex / Math.max(ctx.pathCount - 1, 1);
        const t = mapT(pathRaw + ctx.pointT * 0.2, ctx.params.scale, ctx.params.offset);
        return pickColor(colors, t);
      },
    },

  };

  root.COLOR_METHODS = COLOR_METHODS;

})(typeof globalThis !== "undefined" ? globalThis : this);
