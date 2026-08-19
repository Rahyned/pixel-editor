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

// ============================================================
// IMPORTACIÓN DE IMAGEN (PNG / cualquier formato soportado)
// Redimensiona la imagen al tamaño del lienzo y mapea cada
// píxel al color de paleta más cercano (o usa el color exacto
// si el usuario elige "colores exactos").
// ============================================================

// Convierte un archivo de imagen en un Image.
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

// Encuentra la clave de paleta más cercana a un color RGBA.
export function nearestPaletteKey(r, g, b, a, palette) {
  if (a < 128) return ".";
  let best = null;
  let bestDist = Infinity;
  for (const k of Object.keys(palette)) {
    const hex = palette[k];
    const pr = parseInt(hex.slice(1, 3), 16);
    const pg = parseInt(hex.slice(3, 5), 16);
    const pb = parseInt(hex.slice(5, 7), 16);
    const dr = pr - r;
    const dg = pg - g;
    const db = pb - b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = k;
    }
  }
  return best;
}

// Mapea una imagen a una grilla de claves de paleta de size×size.
export function imageToGrid(img, size, palette, exactColors = false) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  // escalar (con filtro) y luego muestrear
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const grid = Array(size * size).fill(".");

  // Para modo exacto: mapa de color exacto -> clave
  const exactMap = new Map();
  for (const k of Object.keys(palette)) {
    exactMap.set(palette[k].toUpperCase(), k);
  }

  for (let i = 0; i < size * size; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    if (a < 128) {
      grid[i] = ".";
      continue;
    }
    if (exactColors) {
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
      const k = exactMap.get(hex);
      if (k && k !== ".") {
        grid[i] = k;
        continue;
      }
      grid[i] = nearestPaletteKey(r, g, b, a, palette);
    } else {
      grid[i] = nearestPaletteKey(r, g, b, a, palette);
    }
  }
  return grid;
}