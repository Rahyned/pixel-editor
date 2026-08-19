// ============================================================
// MATEMÁTICA DE HERRAMIENTAS
// Devuelven listas de índices (celdas) dentro de una grilla size×size.
// ============================================================

import { rowsToGrid } from "./palette.js";

// Línea de Bresenham entre dos celdas.
export function lineCells(x0, y0, x1, y1, size) {
  const cells = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (x >= 0 && x < size && y >= 0 && y < size) cells.push(y * size + x);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return cells;
}

// Rectángulo (contorno o relleno) entre dos celdas.
export function rectCells(x0, y0, x1, y1, size, fill) {
  const xMin = Math.min(x0, x1);
  const xMax = Math.max(x0, x1);
  const yMin = Math.min(y0, y1);
  const yMax = Math.max(y0, y1);
  const cells = [];
  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      if (!fill && x !== xMin && x !== xMax && y !== yMin && y !== yMax) continue;
      if (x >= 0 && x < size && y >= 0 && y < size) cells.push(y * size + x);
    }
  }
  return cells;
}

// Elipse (contorno o relleno) dentro del bounding box.
export function ellipseCells(x0, y0, x1, y1, size, fill) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = Math.abs(x1 - x0) / 2;
  const ry = Math.abs(y1 - y0) / 2;
  const cells = [];
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / Math.max(rx, 0.0001);
      const dy = (y - cy) / Math.max(ry, 0.0001);
      const d = dx * dx + dy * dy;
      if (fill ? d <= 1 : Math.abs(d - 1) <= 1 / Math.max(rx, ry, 1)) {
        if (x >= 0 && x < size && y >= 0 && y < size) cells.push(y * size + x);
      }
    }
  }
  return cells;
}

// Relleno por inundación (flood fill) sobre una grilla de claves.
// Devuelve la NUEVA grilla.
export function floodFillGrid(grid, size, startIndex, newKey) {
  const target = grid[startIndex];
  if (target === newKey) return grid;
  const result = grid.slice();
  const stack = [startIndex];
  const seen = new Set([startIndex]);
  while (stack.length) {
    const idx = stack.pop();
    result[idx] = newKey;
    const x = idx % size;
    const y = (idx - x) / size;
    const neighbors = [];
    if (x > 0) neighbors.push(idx - 1);
    if (x < size - 1) neighbors.push(idx + 1);
    if (y > 0) neighbors.push(idx - size);
    if (y < size - 1) neighbors.push(idx + size);
    for (const n of neighbors) {
      if (!seen.has(n) && result[n] === target) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return result;
}

// Convierte un rect de selección en índices.
export function rectToCells(rect, size) {
  const cells = [];
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) cells.push(y * size + x);
    }
  }
  return cells;
}

// Copia la región de un rect desde una grilla (devuelve sub-grilla + desplazamiento).
export function copyRegion(grid, size, rect) {
  const w = Math.min(rect.w, size - rect.x);
  const h = Math.min(rect.h, size - rect.y);
  if (w <= 0 || h <= 0) return null;
  const rows = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      const gx = Math.max(0, Math.min(size - 1, rect.x + x));
      const gy = Math.max(0, Math.min(size - 1, rect.y + y));
      row += grid[gy * size + gx] || ".";
    }
    rows.push(row);
  }
  return rowsToGrid(rows, w);
}

// Pega una sub-grilla en un rect destino (devuelve nueva grilla).
export function pasteRegion(grid, size, sub, rect) {
  const result = grid.slice();
  for (let y = 0; y < sub.height; y++) {
    for (let x = 0; x < sub.width; x++) {
      const gx = rect.x + x;
      const gy = rect.y + y;
      if (gx < 0 || gx >= size || gy < 0 || gy >= size) continue;
      result[gy * size + gx] = sub.grid[y * sub.width + x];
    }
  }
  return result;
}

// Normaliza un rect (coordenadas negativas y 0×0).
export function normalizeRect(x0, y0, x1, y1) {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const w = Math.abs(x1 - x0) + 1;
  const h = Math.abs(y1 - y0) + 1;
  return { x, y, w, h };
}

// Volteos y rotaciones sobre una grilla cuadrada.
export function flipGridH(grid, size) {
  const out = Array.from({ length: grid.length });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[y * size + (size - 1 - x)] = grid[y * size + x];
    }
  }
  return out;
}

export function flipGridV(grid, size) {
  const out = Array.from({ length: grid.length });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[(size - 1 - y) * size + x] = grid[y * size + x];
    }
  }
  return out;
}

export function rotateGridCW(grid, size) {
  const out = Array.from({ length: grid.length });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[x * size + (size - 1 - y)] = grid[y * size + x];
    }
  }
  return out;
}

export function rotateGridCCW(grid, size) {
  const out = Array.from({ length: grid.length });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[(size - 1 - x) * size + y] = grid[y * size + x];
    }
  }
  return out;
}

// Redimensiona conservando el contenido desde la esquina superior izquierda.
export function resizeGrid(grid, oldSize, newSize) {
  const out = Array(newSize * newSize).fill(".");
  const copy = Math.min(oldSize, newSize);
  for (let y = 0; y < copy; y++) {
    for (let x = 0; x < copy; x++) {
      out[y * newSize + x] = grid[y * oldSize + x];
    }
  }
  return out;
}