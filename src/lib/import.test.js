import { describe, it, expect } from "vitest";
import { parseProjectJson, rowsToSpriteGrid, parseSpriteText } from "./import.js";

describe("parseProjectJson", () => {
  const valid = JSON.stringify({
    fps: 12,
    width: 8,
    height: 8,
    palette: { K: "#111111" },
    activeFrame: 1,
    frames: [
      { duration: 100, layers: [{ grid: [["K", ".", "K", ".", ".", ".", ".", "."]] }] },
      { duration: 250, layers: [{ grid: ["K........"] }] },
    ],
  });

  it("lee fps, duración por frame y grid", () => {
    const p = parseProjectJson(valid);
    expect(p.fps).toBe(12);
    expect(p.frames[0].duration).toBe(100);
    expect(p.frames[1].duration).toBe(250);
    expect(p.frames[0].layers[0].grid[0]).toBe("K");
  });

  it("usa fps 6 por defecto si no viene", () => {
    const p = parseProjectJson(JSON.stringify({ width: 8, height: 8, frames: [{ layers: [{ grid: [] }] }] }));
    expect(p.fps).toBe(6);
  });

  it("duración inválida cae a null (usa fps global)", () => {
    const p = parseProjectJson(
      JSON.stringify({ width: 8, height: 8, frames: [{ duration: -5, layers: [{ grid: [] }] }] })
    );
    expect(p.frames[0].duration).toBeNull();
  });

  it("lanza error con JSON inválido", () => {
    expect(() => parseProjectJson("no-json")).toThrow();
  });

  it("lanza error si no hay frames", () => {
    expect(() => parseProjectJson(JSON.stringify({ width: 8, height: 8 }))).toThrow();
  });

  it("acepta grillas como array de strings", () => {
    const p = parseProjectJson(
      JSON.stringify({ width: 8, height: 8, frames: [{ layers: [{ grid: ["K........"] }] }] })
    );
    expect(p.frames[0].layers[0].grid[0]).toBe("K");
  });

  it("acepta grillas planas (formato que guarda el autosave)", () => {
    const grid = Array(256).fill(".");
    grid[5 * 16 + 5] = "K";
    const p = parseProjectJson(JSON.stringify({ width: 16, height: 16, frames: [{ layers: [{ grid }] }] }));
    const flat = p.frames[0].layers[0].grid;
    expect(flat[5 * 16 + 5]).toBe("K");
    expect(flat[0]).toBe(".");
  });

  it("descarta caracteres fuera de la paleta en grilla plana", () => {
    const grid = Array(64).fill(".");
    grid[1] = "x";
    const p = parseProjectJson(JSON.stringify({ width: 8, height: 8, frames: [{ layers: [{ grid }] }] }));
    expect(p.frames[0].layers[0].grid[1]).toBe(".");
  });
});

describe("parseSpriteText / rowsToSpriteGrid", () => {
  it("parsea filas con comillas dobles", () => {
    const rows = parseSpriteText('["K....", "....K"]');
    expect(rows).toEqual(["K....", "....K"]);
  });

  it("convierte a grilla y valida tamaño uniforme", () => {
    const { grid, width, height } = rowsToSpriteGrid(["K.W", "...", "R.."]);
    expect(width).toBe(3);
    expect(height).toBe(3);
    expect(grid[0]).toBe("K");
    expect(grid[2]).toBe("W");
  });

  it("lanza error si las filas tienen largo distinto", () => {
    expect(() => rowsToSpriteGrid(["K...", ".."])).toThrow();
  });

  it("lanza error con carácter fuera de la paleta", () => {
    expect(() => rowsToSpriteGrid(["a.."])).toThrow();
  });
});