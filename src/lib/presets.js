// ============================================================
// PALETAS PRESET (Pico-8, C64, Grayscale, Sweetie-16, db32)
// Cada preset se mapea a las primeras N claves de PX_ORDER.
// El resto de la paleta queda igual al default.
// ============================================================

import { PX_ORDER, PX, clonePalette } from "./palette.js";

export const PRESETS = {
  "pico-8": [
    "#000000", "#1d2b53", "#7e2553", "#008751",
    "#ab5236", "#5f574d", "#c2c3c7", "#fff1e8",
    "#ff004d", "#ffa300", "#ffec27", "#00e436",
    "#29adff", "#83769c", "#ff77a8", "#ffccaa",
  ],
  c64: [
    "#000000", "#ffffff", "#813338", "#75cec0",
    "#8e3c97", "#56ac4d", "#2e2c9b", "#edf171",
    "#8e5029", "#c1812e", "#b1464b", "#505050",
    "#787878", "#a6fa57", "#94e089", "#b0b0b0",
  ],
  grayscale: [
    "#000000", "#1a1a1a", "#333333", "#4d4d4d",
    "#666666", "#808080", "#999999", "#b3b3b3",
    "#cccccc", "#e6e6e6", "#ffffff",
  ],
  "sweetie-16": [
    "#1a1c2c", "#16213e", "#0f3460", "#533483",
    "#c7417b", "#f39c12", "#f1c40f", "#ecf0f1",
    "#95a5a6", "#34495e", "#2c3e50", "#e74c3c",
    "#e67e22", "#3498db", "#2ecc71", "#9b59b6",
  ],
  db32: [
    "#000000", "#222034", "#45283c", "#663931",
    "#8f563b", "#cd5e58", "#f18e8e", "#f8b88b",
    "#fdbf69", "#f2cc8f", "#e0ac69", "#cc8b86",
    "#b5975a", "#8b7f47", "#6f8f47", "#596e41",
    "#4d653b", "#3d5941", "#234d20", "#0d2b0d",
    "#051a05", "#37946e", "#6bbe30", "#a4e857",
    "#37795e", "#5f675d", "#8c8c74", "#bfbfbf",
    "#dfdfdf", "#848fa3", "#626e88", "#2c2e8b",
    "#0f7595", "#0d47a1", "#ef7d57", "#f4978e",
  ],
};

export const PRESET_NAMES = Object.keys(PRESETS);

// Construye un objeto de paleta (clave -> hex) aplicando el preset
// a las primeras N claves de PX_ORDER. Devuelve null si no existe.
export function presetToPalette(name) {
  const colors = PRESETS[name];
  if (!colors) return null;
  const palette = clonePalette(PX);
  colors.forEach((hex, i) => {
    const key = PX_ORDER[i];
    if (key) palette[key] = hex;
  });
  return palette;
}