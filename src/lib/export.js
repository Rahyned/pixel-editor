// ============================================================
// EXPORTACIÓN: PNG (frame o sprite-sheet), SVG y JSON
// ============================================================

import { composeFrame } from "./composite.js";

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(name) {
  return (name || "sprite").toLowerCase().replace(/[^a-z0-9_]/g, "_") || "sprite";
}

// Dibuja un frame compuesto en un canvas a la escala dada.
export function drawFrameToCanvas(frame, size, scale) {
  const canvas = document.createElement("canvas");
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext("2d");
  const { colors } = composeFrame(frame, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = colors[y * size + x];
      if (!c || c[3] === 0) continue;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return canvas;
}

// PNG de un frame.
export function exportPng(project, scale, name) {
  const frame = project.frames[project.activeFrame];
  const canvas = drawFrameToCanvas(frame, project.size, scale);
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-f${project.activeFrame + 1}.png`);
  }, "image/png");
}

// PNG sprite-sheet: todos los frames en una tira horizontal.
export function exportSpriteSheet(project, scale, name) {
  const { size, frames } = project;
  const canvas = document.createElement("canvas");
  canvas.width = size * scale * frames.length;
  canvas.height = size * scale;
  const ctx = canvas.getContext("2d");
  frames.forEach((frame, fi) => {
    const fc = drawFrameToCanvas(frame, size, scale);
    ctx.drawImage(fc, fi * size * scale, 0);
  });
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-sheet.png`);
  }, "image/png");
}

// SVG vectorial del frame activo (respetando opacidad de capas).
export function exportSvg(project, name) {
  const frame = project.frames[project.activeFrame];
  const { size } = project;
  const { colors } = composeFrame(frame, size);
  const rects = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = colors[y * size + x];
      if (!c || c[3] === 0) continue;
      const fill = `rgba(${c[0]},${c[1]},${c[2]},${(c[3] / 255).toFixed(3)})`;
      rects.push(
        `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" shape-rendering="crispEdges" viewBox="0 0 ${size} ${size}">${rects.join("")}</svg>`;
  download(new Blob([svg], { type: "image/svg+xml" }), `${safeName(name)}-f${project.activeFrame + 1}.svg`);
}

// JSON de proyecto completo (frames + capas + paleta + tamaño).
export function projectToJson(project) {
  const { size, palette, frames, activeFrame, activeLayer } = project;
  return JSON.stringify(
    { size, palette, activeFrame, activeLayer, frames },
    null,
    2
  );
}

export function exportProjectJson(project, name) {
  download(
    new Blob([projectToJson(project)], { type: "application/json" }),
    `${safeName(name)}.pix.json`
  );
}