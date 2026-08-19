// ============================================================
// COMPOSICIÓN DE CAPAS
// Fusiona las capas visibles de un frame en una grilla plana de
// claves, aplicando opacidad. Devuelve { grid, colors } donde
// colors guarda el color RGBA resultante por píxel.
// ============================================================

import { PX } from "./palette.js";

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b, Math.round((alpha ?? 1) * 255)];
}

// Combina color src sobre dst (compositing "source-over").
function blend(src, dst) {
  const [sr, sg, sb, sa] = src;
  if (sa === 0) return dst;
  if (dst[3] === 0) return src;
  const da = dst[3];
  const outA = sa + da * (1 - sa / 255);
  if (outA === 0) return [0, 0, 0, 0];
  const outR = (sr * sa + dst[0] * da * (1 - sa / 255)) / outA;
  const outG = (sg * sa + dst[1] * da * (1 - sa / 255)) / outA;
  const outB = (sb * sa + dst[2] * da * (1 - sa / 255)) / outA;
  return [outR, outG, outB, outA];
}

/**
 * Compone todas las capas visibles de un frame.
 * Devuelve { grid, colors }:
 *  - grid: clave del color más opaco que define el píxel (para P([...]))
 *  - colors: [r,g,b,a] compuesto, para export PNG/SVG con opacidad.
 */
export function composeFrame(frame, width, height) {
  const grid = Array(width * height).fill(".");
  const colors = Array(width * height).fill(null);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = [0, 0, 0, 0];
      let topKey = ".";
      // capas de abajo hacia arriba
      for (const layer of frame.layers) {
        if (!layer.visible || layer.opacity <= 0) continue;
        const key = layer.grid[y * width + x];
        if (!key || key === ".") continue;
        const base = PX[key] || "#000000";
        acc = blend(hexToRgba(base, layer.opacity), acc);
        topKey = key;
      }
      if (acc[3] > 0) {
        grid[y * width + x] = topKey;
        colors[y * width + x] = acc;
      }
    }
  }
  return { grid, colors };
}

// Compone un solo píxel (para cuentagotas y preview).
export function composePixel(frame, width, index) {
  let acc = [0, 0, 0, 0];
  let topKey = ".";
  for (const layer of frame.layers) {
    if (!layer.visible || layer.opacity <= 0) continue;
    const key = layer.grid[index];
    if (!key || key === ".") continue;
    const base = PX[key] || "#000000";
    acc = blend(hexToRgba(base, layer.opacity), acc);
    topKey = key;
  }
  return acc[3] > 0 ? { key: topKey, rgba: acc } : null;
}