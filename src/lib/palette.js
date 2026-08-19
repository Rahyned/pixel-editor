// ============================================================
// PALETA DE PÍXELES para sprites
// Cada sprite es un array de strings; cada char es una clave de
// color. "." = transparente.
// ============================================================

export const PX = {
  ".": "#00000000", // transparente
  K: "#1B1B2F", // negro / tinta
  W: "#FFFFFF", // blanco
  R: "#E63946", // rojo
  O: "#F8961E", // naranja
  G: "#FFD166", // dorado
  Y: "#FFE66D", // amarillo
  N: "#2A9D8F", // verde
  L: "#7BD389", // verde claro
  B: "#3A86FF", // azul
  C: "#90CAF9", // azul claro
  P: "#FF7BAC", // rosa
  V: "#9B5DE5", // violeta
  T: "#8B5A2B", // marrón
  H: "#C68958", // marrón claro
  E: "#6C757D", // gris
  F: "#B0B8C0", // gris claro
  A: "#00C2C7", // cian
  // --- colores adicionales ---
  D: "#722F37", // rojo vino / burdeos
  I: "#FF0000", // rojo puro
  J: "#FF8C00", // naranja oscuro
  Q: "#FFD700", // dorado brillante
  U: "#9ACD32", // verde oliva
  M: "#228B22", // verde bosque
  X: "#00BFFF", // azul cielo
  Z: "#4169E1", // azul real
  S: "#FF69B4", // rosa caliente
  "%": "#800080", // púrpura
  "!": "#FF00FF", // magenta
  "$": "#A0522D", // sienna / marrón rojizo
  "&": "#F5DEB3", // trigo / crema
  "#": "#555555", // gris medio
  "@": "#C0C0C0", // plata
  // --- escala de grises (claves 0-4) ---
  "0": "#2B2B33", // gris muy oscuro
  "1": "#3D3D47", // gris oscuro
  "2": "#4F4F5C", // gris medio-oscuro
  "3": "#7C7C8C", // gris medio
  "4": "#A6A6B4", // gris claro
  // --- azules medios (claves 5-8) ---
  "5": "#34517A", // azul medio oscuro
  "6": "#3E5E8C", // azul medio
  "7": "#54769F", // azul medio claro
  "8": "#6B8CB5", // azul medio claro 2
};

// Orden de la paleta visual (excluye transparente)
export const PX_ORDER = [
  "K", "W", "R", "O", "G", "Y", "N", "L", "B", "C", "P", "V", "T", "H", "E", "F", "A",
  "D", "I", "J", "Q", "U", "M", "X", "Z", "S", "%", "!", "$", "&", "#", "@",
  "0", "1", "2", "3", "4", "5", "6", "7", "8",
];

export const DEFAULT_PALETTE = PX_ORDER.reduce((acc, k) => ((acc[k] = PX[k]), acc), {});

export function isDefaultPalette(palette) {
  return PX_ORDER.every((k) => palette[k] === PX[k]);
}

export function clonePalette(palette) {
  const out = {};
  for (const k of Object.keys(palette)) out[k] = palette[k];
  return out;
}

// Convierte un array de filas de texto en una grilla de claves plana.
export const rowsToGrid = (rows, w) => {
  const grid = Array(w * rows.length).fill(".");
  rows.forEach((row, y) => {
    for (let x = 0; x < w && x < row.length; x++) {
      grid[y * w + x] = row[x];
    }
  });
  return grid;
};

// Convierte una grilla plana en array de filas de texto.
export const gridToRows = (grid, w) => {
  const h = grid.length / w;
  const rows = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      row += grid[y * w + x] || ".";
    }
    rows.push(row);
  }
  return rows;
};