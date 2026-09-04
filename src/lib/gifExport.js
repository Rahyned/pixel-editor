// ============================================================
// EXPORT GIF ANIMADO
// Usa gifenc (ESM, sin workers externos). Respeta la duración
// individual de cada frame (fallback: fps global) y un
// multiplicador de velocidad. Codifica en chunks con `await`
// para no bloquear la UI.
// ============================================================

import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { composeFrame } from "./composite.js";

function renderRgba(frame, width, height, palette, ctx) {
  ctx.clearRect(0, 0, width, height);
  const { colors } = composeFrame(frame, width, height, palette);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = colors[y * width + x];
      if (!c || c[3] === 0) continue;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return ctx.getImageData(0, 0, width, height).data;
}

// Exporta un GIF con loop infinito.
// speed: 0.5 = lento (doble de duración), 1 = normal, 2 = rápido.
// Devuelve un Uint8Array con el GIF codificado.
export async function exportGif(project, { speed = 1, fps = 6, onProgress } = {}) {
  const { width, height, frames } = project;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const gif = GIFEncoder();
  const defaultMs = Math.round(1000 / (fps || 6));

  for (let i = 0; i < frames.length; i++) {
    const rgba = renderRgba(frames[i], width, height, project.palette, ctx);
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);
    const ms = (frames[i].duration ?? defaultMs) / speed;
    gif.writeFrame(index, width, height, {
      palette,
      delay: Math.max(1, Math.round(ms / 10)), // décimas de segundo
    });
    if (onProgress) onProgress(i + 1, frames.length);
    // dejar respirar a la UI entre frames
    await new Promise((r) => setTimeout(r, 0));
  }
  gif.finish();
  return gif.bytes();
}