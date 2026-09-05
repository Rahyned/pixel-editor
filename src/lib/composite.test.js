import { describe, it, expect } from "vitest";
import { composeFrame, composePixel, BLEND_ORDER } from "./composite.js";

const PALETTE = {
  R: "#FF0000",
  G: "#00FF00",
  B: "#0000FF",
  K: "#000000",
  W: "#FFFFFF",
  Y: "#FFFF00",
};

function layer(key, opts = {}) {
  return {
    name: "l",
    visible: true,
    opacity: 1,
    blendMode: "normal",
    grid: [key],
    ...opts,
  };
}

describe("composeFrame", () => {
  it("devuelve el color RGBA de un píxel sólido", () => {
    const { colors } = composeFrame({ layers: [layer("R")] }, 1, 1, PALETTE);
    expect(colors[0]).toEqual([255, 0, 0, 255]);
  });

  it("aplica opacidad de capa", () => {
    const { colors } = composeFrame({ layers: [layer("R", { opacity: 0.5 })] }, 1, 1, PALETTE);
    expect(colors[0][3]).toBe(128);
  });

  it("ignora capas ocultas", () => {
    const { colors } = composeFrame({ layers: [layer("R", { visible: false })] }, 1, 1, PALETTE);
    expect(colors[0]).toBeNull();
  });

  it("compone dos capas en orden", () => {
    const { colors } = composeFrame({ layers: [layer("G"), layer("R")] }, 1, 1, PALETTE);
    expect(colors[0]).toEqual([255, 0, 0, 255]);
  });
});

describe("blend modes por capa", () => {
  it("multiply oscurece: blanco * negro = negro", () => {
    const { colors } = composeFrame(
      { layers: [layer("W"), layer("K", { blendMode: "multiply" })] },
      1,
      1,
      PALETTE
    );
    expect(colors[0][0]).toBeLessThan(10);
    expect(colors[0][1]).toBeLessThan(10);
    expect(colors[0][2]).toBeLessThan(10);
  });

  it("multiply no cambia el color sobre blanco", () => {
    const { colors } = composeFrame(
      { layers: [layer("W"), layer("R", { blendMode: "multiply" })] },
      1,
      1,
      PALETTE
    );
    expect(colors[0][0]).toBeGreaterThan(250);
    expect(colors[0][1]).toBeLessThan(10);
  });

  it("screen aclara: negro sobre blanco da blanco", () => {
    const { colors } = composeFrame(
      { layers: [layer("W"), layer("K", { blendMode: "screen" })] },
      1,
      1,
      PALETTE
    );
    expect(colors[0][0]).toBeGreaterThan(250);
  });

  it("darken toma el mínimo y lighten el máximo", () => {
    const darken = composeFrame(
      { layers: [layer("W"), layer("R", { blendMode: "darken" })] },
      1,
      1,
      PALETTE
    ).colors[0];
    expect(darken[0]).toBe(255); // R(255,0,0) vs W(255,255,255)

    const lighten = composeFrame(
      { layers: [layer("K"), layer("R", { blendMode: "lighten" })] },
      1,
      1,
      PALETTE
    ).colors[0];
    expect(lighten[0]).toBe(255);
  });

  it("todos los modos de BLEND_ORDER son válidos y no tiran", () => {
    for (const mode of BLEND_ORDER) {
      const { colors } = composeFrame(
        { layers: [layer("K"), layer("Y", { blendMode: mode })] },
        1,
        1,
        PALETTE
      );
      expect(colors[0]).not.toBeNull();
    }
  });
});

describe("composePixel", () => {
  it("devuelve la clave superior y su RGBA", () => {
    const p = composePixel({ layers: [layer("G"), layer("B")] }, 1, 0, PALETTE);
    expect(p.key).toBe("B");
    expect(p.rgba[2]).toBe(255);
  });
});