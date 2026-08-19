// ============================================================
// IMPORTACIÓN: sprites P([...]) y proyectos JSON completos
// ============================================================

import { PX, clonePalette, rowsToGrid } from "./palette.js";

// Parsea un sprite de texto tipo ["...", "..."] a array de filas.
export function parseSpriteText(text) {
  const m = text.match(/\[([\s\S]*?)\]/);
  if (!m) throw new Error("No encontré el array de filas [ ... ].");
  const inner = m[1];
  const strings = [];
  const re = /"([^"]*)"/g;
  let match;
  while ((match = re.exec(inner)) !== null) strings.push(match[1]);
  if (strings.length === 0) {
    const re2 = /'([^']*)'/g;
    while ((match = re2.exec(inner)) !== null) strings.push(match[1]);
  }
  if (strings.length === 0) throw new Error("No hay filas con comillas.");
  return strings;
}

// Convierte filas de texto a grilla del tamaño dado (valida paleta).
export function rowsToSpriteGrid(rows, size) {
  const valid = new Set(Object.keys(PX));
  for (const row of rows) {
    if (row.length !== size) {
      throw new Error(`Cada fila debe tener ${size} chars (una fila tiene ${row.length}).`);
    }
    for (const ch of row) {
      if (!valid.has(ch)) throw new Error(`Carácter inválido: '${ch}'. ¿Es de la paleta?`);
    }
  }
  return rowsToGrid(rows, size);
}

// Carga un proyecto completo desde JSON. Devuelve objeto validado.
export function parseProjectJson(text) {
  const data = JSON.parse(text);
  if (typeof data !== "object" || data === null) throw new Error("JSON inválido.");
  const size = Number(data.size) || 16;
  if (![8, 16, 24, 32, 48, 64].includes(size)) throw new Error(`Tamaño inválido: ${size}.`);
  const palette = { ...clonePalette(PX) };
  if (data.palette && typeof data.palette === "object") {
    for (const k of Object.keys(data.palette)) {
      if (/^[A-Z]$/.test(k)) palette[k] = String(data.palette[k]);
    }
  }
  const frames = Array.isArray(data.frames) && data.frames.length > 0 ? data.frames : null;
  if (!frames) throw new Error("El proyecto no tiene frames.");
  const clean = frames.map((f) => ({
    layers: (Array.isArray(f.layers) && f.layers.length > 0 ? f.layers : [{ grid: [] }]).map((l, li) => ({
      name: l.name || `Capa ${li + 1}`,
      visible: l.visible !== false,
      opacity: Number(l.opacity) || 1,
      grid: sanitizeGrid(l.grid, size),
    })),
  }));
  return {
    size,
    palette,
    activeFrame: Math.min(Number(data.activeFrame) || 0, clean.length - 1),
    activeLayer: 0,
    frames: clean,
  };
}

function sanitizeGrid(grid, size) {
  const flat = Array(size * size).fill(".");
  if (Array.isArray(grid)) {
    grid.forEach((row, y) => {
      if (Array.isArray(row)) {
        row.forEach((ch, x) => {
          if (x < size && y < size && Object.keys(PX).includes(ch)) flat[y * size + x] = ch;
        });
      } else if (typeof row === "string") {
        [...row].forEach((ch, x) => {
          if (x < size && y < size && Object.keys(PX).includes(ch)) flat[y * size + x] = ch;
        });
      }
    });
  }
  return flat;
}