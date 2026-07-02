/**
 * perturbation-methods.js
 * Registry of field perturbation methods (post-generation, pre-trace).
 * Each method: { name, timing: "postField", apply(typedField, cols, rows, config) }
 * typedField: Float32Array of interleaved [vx, vy] pairs, row-major: index = (col + row*cols)*2
 */

(function initPerturbationMethods(root) {

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function getVec(typedField, col, row, cols, rows) {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return [0, 0];
    const idx = (col + row * cols) * 2;
    return [typedField[idx], typedField[idx + 1]];
  }

  function setVec(typedField, col, row, cols, rows, vx, vy) {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    // Normalize to unit vector
    const len = Math.sqrt(vx * vx + vy * vy);
    const idx = (col + row * cols) * 2;
    if (len > 0.0001) {
      typedField[idx]     = vx / len;
      typedField[idx + 1] = vy / len;
    }
  }

  const PERTURBATION_METHODS = {

    radialImpulse: {
      name: "Radial Impulse",
      timing: "postField",
      // Injects a Gaussian radial push from (cx, cy) into the field.
      // cx, cy are fractions [0,1] of canvas dimensions.
      // radius is a fraction [0,1] of the smaller canvas dimension.
      apply(typedField, cols, rows, cfg) {
        const cx   = clamp(cfg.cx   || 0.5, 0, 1) * cols;
        const cy   = clamp(cfg.cy   || 0.5, 0, 1) * rows;
        const str  = cfg.strength || 1.5;
        const r    = (cfg.radius   || 0.25) * Math.min(cols, rows);
        const r2   = r * r * 2;

        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            const dx = col - cx;
            const dy = row - cy;
            const d2 = dx * dx + dy * dy;
            const d  = Math.sqrt(d2);
            if (d < 0.001) continue;
            const influence = str * Math.exp(-d2 / r2);
            const nx = dx / d;
            const ny = dy / d;
            const [vx, vy] = getVec(typedField, col, row, cols, rows);
            // Blend current vector toward radial push direction
            const newVx = vx + nx * influence;
            const newVy = vy + ny * influence;
            setVec(typedField, col, row, cols, rows, newVx, newVy);
          }
        }
      },
    },

    gravityWell: {
      name: "Gravity Well",
      timing: "postField",
      // Inverse-square attraction toward (cx, cy).
      // minDist prevents singularity at the centre.
      apply(typedField, cols, rows, cfg) {
        const cx      = clamp(cfg.cx   || 0.5, 0, 1) * cols;
        const cy      = clamp(cfg.cy   || 0.5, 0, 1) * rows;
        const str     = cfg.strength || 1.0;
        const minD2   = Math.pow((cfg.minDist || 0.01) * Math.min(cols, rows), 2);

        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            const dx  = cx - col;
            const dy  = cy - row;
            const d2  = Math.max(dx * dx + dy * dy, minD2);
            const force = str / d2;
            const [vx, vy] = getVec(typedField, col, row, cols, rows);
            setVec(typedField, col, row, cols, rows, vx + dx * force, vy + dy * force);
          }
        }
      },
    },

    rollingBall: {
      name: "Rolling Ball",
      timing: "postField",
      // Compresses vectors inside a circular region toward the tangential direction,
      // with spring-like falloff at the edge.
      apply(typedField, cols, rows, cfg) {
        const cx = clamp(cfg.cx || 0.5, 0, 1) * cols;
        const cy = clamp(cfg.cy || 0.5, 0, 1) * rows;
        const r  = (cfg.radius || 0.15) * Math.min(cols, rows);
        const k  = clamp(cfg.springK || 0.4, 0, 1);

        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            const dx = col - cx;
            const dy = row - cy;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d > r || d < 0.001) continue;
            // overlap ranges 0 (edge) → 1 (centre)
            const overlap = 1 - d / r;
            const blend   = overlap * k;
            // Tangential direction (perpendicular to radial, clockwise)
            const tx = -dy / d;
            const ty =  dx / d;
            const [vx, vy] = getVec(typedField, col, row, cols, rows);
            const newVx = vx * (1 - blend) + tx * blend;
            const newVy = vy * (1 - blend) + ty * blend;
            setVec(typedField, col, row, cols, rows, newVx, newVy);
          }
        }
      },
    },

    freezeZone: {
      name: "Freeze Zone",
      timing: "perStep",
      // Locks particle direction to a fixed angle inside a circular region.
      // cx, cy: centre [0,1]; radius: fraction of smaller dimension [0,1];
      // angle: fixed heading in radians; edgeWidth: soft blend width [0,1].
      applyStep(x, y, fx, fy, canvasW, canvasH, cfg) {
        const cx  = (cfg.cx     || 0.5) * canvasW;
        const cy  = (cfg.cy     || 0.5) * canvasH;
        const r   = (cfg.radius || 0.2) * Math.min(canvasW, canvasH);
        const ew  = (cfg.edgeWidth || 0.1) * r;
        const ang = cfg.angle || 0;
        const dx  = x - cx, dy = y - cy;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d >= r) return { fx, fy };
        const blend = ew > 0 ? Math.min(1, (r - d) / ew) : 1;
        const frozenFx = Math.cos(ang);
        const frozenFy = Math.sin(ang);
        return {
          fx: fx * (1 - blend) + frozenFx * blend,
          fy: fy * (1 - blend) + frozenFy * blend,
        };
      },
    },

    obstacleDeflection: {
      name: "Obstacle Deflection",
      timing: "perStep",
      // Deflects flow tangentially around a circular obstacle using potential-flow doublet.
      // cx, cy: centre [0,1]; radius: fraction [0,1]; strength: doublet magnitude.
      applyStep(x, y, fx, fy, canvasW, canvasH, cfg) {
        const cx  = (cfg.cx       || 0.5) * canvasW;
        const cy  = (cfg.cy       || 0.5) * canvasH;
        const r   = (cfg.radius   || 0.15) * Math.min(canvasW, canvasH);
        const str = cfg.strength  || 1.0;
        const ddx = x - cx, ddy = y - cy;
        const r2  = ddx * ddx + ddy * ddy;
        if (r2 < 0.001) return { fx, fy };
        // Inside obstacle: redirect to tangential direction
        if (r2 < r * r) {
          const d   = Math.sqrt(r2);
          const tx  = -ddy / d;
          const ty  =  ddx / d;
          return { fx: tx, fy: ty };
        }
        // Outside: doublet potential flow perturbation
        const r4 = r2 * r2;
        const dFx = (ddx * ddx - ddy * ddy) / r4 * str;
        const dFy = (2 * ddx * ddy) / r4 * str;
        return { fx: fx + dFx, fy: fy + dFy };
      },
    },

  };

  root.PERTURBATION_METHODS = PERTURBATION_METHODS;

})(typeof globalThis !== "undefined" ? globalThis : this);
