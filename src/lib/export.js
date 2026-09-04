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
export function drawFrameToCanvas(frame, width, height, scale, palette) {
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  const { colors } = composeFrame(frame, width, height, palette);
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

// Dibuja una región recortada de un frame compuesto a la escala dada.
export function drawRegionToCanvas(frame, width, height, region, scale, palette) {
  const { x, y, w, h } = region;
  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  const { colors } = composeFrame(frame, width, height, palette);
  for (let ry = 0; ry < h; ry++) {
    for (let rx = 0; rx < w; rx++) {
      const gx = x + rx;
      const gy = y + ry;
      if (gx < 0 || gx >= width || gy < 0 || gy >= height) continue;
      const c = colors[gy * width + gx];
      if (!c || c[3] === 0) continue;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
      ctx.fillRect(rx * scale, ry * scale, scale, scale);
    }
  }
  return canvas;
}

// PNG de un frame.
export function exportPng(project, scale, name) {
  const frame = project.frames[project.activeFrame];
  const canvas = drawFrameToCanvas(frame, project.width, project.height, scale, project.palette);
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-f${project.activeFrame + 1}.png`);
  }, "image/png");
}

// PNG de la selección (región recortada).
export function exportPngSelection(project, scale, name, selection) {
  if (!selection || selection.w <= 0 || selection.h <= 0) return;
  const frame = project.frames[project.activeFrame];
  const canvas = drawRegionToCanvas(frame, project.width, project.height, selection, scale, project.palette);
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-sel-${selection.w}x${selection.h}.png`);
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
    const fc = drawFrameToCanvas(frame, width, height, scale, project.palette);
    ctx.drawImage(fc, fi * width * scale, 0);
  });
  canvas.toBlob((blob) => {
    download(blob, `${safeName(name)}-sheet.png`);
  }, "image/png");
}

// Color hex + opacidad separada: rgba() no es soportado por muchos
// visores de SVG fuera del navegador (se ve transparente/vacío).
function fillAttr(c) {
  const hex = "#" + [c[0], c[1], c[2]]
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("");
  return c[3] === 255 ? `fill="${hex}"` : `fill="${hex}" fill-opacity="${(c[3] / 255).toFixed(3)}"`;
}

// SVG vectorial del frame activo (respetando opacidad de capas).
export function exportSvg(project, name) {
  const frame = project.frames[project.activeFrame];
  const { width, height } = project;
  const { colors } = composeFrame(frame, width, height, project.palette);
  const rects = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = colors[y * width + x];
      if (!c || c[3] === 0) continue;
      rects.push(
        `<rect x="${x}" y="${y}" width="1" height="1" ${fillAttr(c)}/>`
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="crispEdges" viewBox="0 0 ${width} ${height}">${rects.join("")}</svg>`;
  download(new Blob([svg], { type: "image/svg+xml" }), `${safeName(name)}-f${project.activeFrame + 1}.svg`);
}

// SVG vectorial de la selección (región recortada).
export function exportSvgSelection(project, name, selection) {
  if (!selection || selection.w <= 0 || selection.h <= 0) return;
  const frame = project.frames[project.activeFrame];
  const { width, height } = project;
  const { x, y, w, h } = selection;
  const { colors } = composeFrame(frame, width, height, project.palette);
  const rects = [];
  for (let ry = 0; ry < h; ry++) {
    for (let rx = 0; rx < w; rx++) {
      const gx = x + rx;
      const gy = y + ry;
      if (gx < 0 || gx >= width || gy < 0 || gy >= height) continue;
      const c = colors[gy * width + gx];
      if (!c || c[3] === 0) continue;
      rects.push(`<rect x="${rx}" y="${ry}" width="1" height="1" ${fillAttr(c)}/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges" viewBox="0 0 ${w} ${h}">${rects.join("")}</svg>`;
  download(new Blob([svg], { type: "image/svg+xml" }), `${safeName(name)}-sel-${w}x${h}.svg`);
}

// JSON de proyecto completo (fps + frames + capas + paleta + tamaño).
// Cada frame exporta su duración en ms (null = sigue el fps global).
export function projectToJson(project, fps) {
  const { width, height, palette, frames, activeFrame, activeLayer } = project;
  const cleanFrames = frames.map((f) => ({ ...f, duration: f.duration ?? null }));
  return JSON.stringify(
    { fps, width, height, palette, activeFrame, activeLayer, frames: cleanFrames },
    null,
    2
  );
}

export function exportProjectJson(project, fps, name) {
  download(
    new Blob([projectToJson(project, fps)], { type: "application/json" }),
    `${safeName(name)}.pix.json`
  );
}