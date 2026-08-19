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
export function drawFrameToCanvas(frame, width, height, scale) {
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  const { colors } = composeFrame(frame, width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = colors[y * width + x];
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
  const canvas = drawFrameToCanvas(frame, project.width, project.height, scale);
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-f${project.activeFrame + 1}.png`);
  }, "image/png");
}

// PNG sprite-sheet: todos los frames en una tira horizontal.
export function exportSpriteSheet(project, scale, name) {
  const { width, height, frames } = project;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale * frames.length;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  frames.forEach((frame, fi) => {
    const fc = drawFrameToCanvas(frame, width, height, scale);
    ctx.drawImage(fc, fi * width * scale, 0);
  });
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-sheet.png`);
  }, "image/png");
}

// SVG vectorial del frame activo (respetando opacidad de capas).
export function exportSvg(project, name) {
  const frame = project.frames[project.activeFrame];
  const { width, height } = project;
  const { colors } = composeFrame(frame, width, height);
  const rects = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = colors[y * width + x];
      if (!c || c[3] === 0) continue;
      const fill = `rgba(${c[0]},${c[1]},${c[2]},${(c[3] / 255).toFixed(3)})`;
      rects.push(
        `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="crispEdges" viewBox="0 0 ${width} ${height}">${rects.join("")}</svg>`;
  download(new Blob([svg], { type: "image/svg+xml" }), `${safeName(name)}-f${project.activeFrame + 1}.svg`);
}

// JSON de proyecto completo (frames + capas + paleta + tamaño).
export function projectToJson(project) {
  const { width, height, palette, frames, activeFrame, activeLayer } = project;
  return JSON.stringify(
    { width, height, palette, activeFrame, activeLayer, frames },
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