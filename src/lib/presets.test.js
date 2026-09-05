import { describe, it, expect } from "vitest";
import { PRESETS, PRESET_NAMES, presetToPalette } from "./presets.js";
import { PX, PX_ORDER } from "./palette.js";

describe("PRESETS", () => {
  it("contiene las paletas esperadas", () => {
    expect(PRESET_NAMES.sort()).toEqual(["c64", "db32", "grayscale", "pico-8", "sweetie-16"]);
  });

  it("ningún preset supera la cantidad de claves disponibles", () => {
    for (const name of PRESET_NAMES) {
      expect(PRESETS[name].length).toBeLessThanOrEqual(PX_ORDER.length);
    }
  });

  it("los colores están en formato hex", () => {
    for (const name of PRESET_NAMES) {
      for (const c of PRESETS[name]) {
        expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});

describe("presetToPalette", () => {
  it("mapea el preset a las primeras claves", () => {
    const pal = presetToPalette("pico-8");
    expect(pal.K).toBe("#000000");
    expect(pal.W).toBe("#1d2b53");
  });

  it("no pisa las claves fuera del preset", () => {
    const pal = presetToPalette("grayscale");
    // grayscale tiene 11 colores: el resto de las claves quedan como el default
    const beyond = PX_ORDER[11];
    expect(pal[beyond]).toBe(PX[beyond]);
  });

  it("devuelve null para un preset inexistente", () => {
    expect(presetToPalette("nope")).toBeNull();
  });
});