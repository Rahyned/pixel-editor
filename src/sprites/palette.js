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
};

// Orden de la paleta visual (excluye transparente)
export const PX_ORDER = ["K", "W", "R", "O", "G", "Y", "N", "L", "B", "C", "P", "V", "T", "H", "E", "F", "A"];

// Convierte un array de filas de texto en una grilla de claves plana.
export const rowsToGrid = (rows, size) => {
  const grid = Array(size * size).fill(".");
  rows.forEach((row, y) => {
    for (let x = 0; x < size && x < row.length; x++) {
      grid[y * size + x] = row[x];
    }
  });
  return grid;
};

// Convierte una grilla plana en array de filas de texto.
export const gridToRows = (grid, size) => {
  const rows = [];
  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size; x++) {
      row += grid[y * size + x] || ".";
    }
    rows.push(row);
  }
  return rows;
};