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

// Lee la imagen en un canvas de su tamaño nativo.
function loadImageToCanvas(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

// Detecta el bounding box del contenido no transparente.
export function findContentBox(canvas, alphaThreshold = 128) {
  const { width, height } = canvas;
  const data = canvas.getContext("2d").getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a >= alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

// Detecta figuras separadas (sprites individuales) en una imagen.
// Divide por columnas sin píxeles opacos (para sprites en fila horizontal).
// Devuelve array de { x, y, w, h, name }.
export function detectSprites(img, alphaThreshold = 128) {
  const canvas = img.getContext ? img : loadImageToCanvas(img);
  const { width, height } = canvas;
  const data = canvas.getContext("2d").getImageData(0, 0, width, height).data;

  // columna x es "ocupada" si tiene >=1 píxel opaco
  const colOcc = Array.from({ length: width }, () => false);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * 4 + 3] >= alphaThreshold) {
        colOcc[x] = true;
        break;
      }
    }
  }
  // agrupar columnas ocupadas consecutivas
  const groups = [];
  let start = -1;
  for (let x = 0; x <= width; x++) {
    const occupied = x < width && colOcc[x];
    if (occupied && start === -1) start = x;
    else if (!occupied && start !== -1) {
      groups.push({ start, end: x - 1 });
      start = -1;
    }
  }
  // para cada grupo, encontrar el bounding box vertical real
  return groups.map((g, i) => {
    let minY = height, maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = g.start; x <= g.end; x++) {
        if (data[(y * width + x) * 4 + 3] >= alphaThreshold) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return {
      x: g.start,
      y: minY,
      w: g.end - g.start + 1,
      h: maxY - minY + 1,
      name: `Figura ${i + 1}`,
    };
  });
}

// Dibuja una región específica de una imagen escalada al target (sin distorsión, centrada).
export function drawRegionScaled(ctx, srcCanvas, region, targetW, targetH) {
  const scale = Math.min(targetW / region.w, targetH / region.h);
  const drawW = Math.round(region.w * scale);
  const drawH = Math.round(region.h * scale);
  const ox = Math.round((targetW - drawW) / 2);
  const oy = Math.round((targetH - drawH) / 2);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(srcCanvas, region.x, region.y, region.w, region.h, ox, oy, drawW, drawH);
}

// Escala un contenido recortado al tamaño del lienzo (sin distorsionar, encaja en el centro).
function drawScaledInto(ctx, srcCanvas, targetW, targetH) {
  const box = findContentBox(srcCanvas);
  if (!box) return;
  drawRegionScaled(ctx, srcCanvas, box, targetW, targetH);
}

// Mapea una imagen a una grilla de claves de paleta de size×size.
// - autoCrop: recorta bordes transparentes y ajusta
// - region: si se pasa {x,y,w,h}, importa solo esa región (recorte de una figura)
export function imageToGrid(img, size, palette, exactColors = false, autoCrop = true, region = null) {
  const src = loadImageToCanvas(img);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (region) {
    drawRegionScaled(ctx, src, region, size, size);
  } else if (autoCrop) {
    drawScaledInto(ctx, src, size, size);
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(src, 0, 0, size, size);
  }
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