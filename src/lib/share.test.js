import { describe, it, expect } from "vitest";
import { buildShareParam, readShareParam } from "./share.js";

const SAMPLE = {
  fps: 6,
  width: 16,
  height: 16,
  activeFrame: 0,
  activeLayer: 0,
  palette: { K: "#000000", W: "#FFFFFF" },
  frames: [
    { duration: null, layers: [{ name: "Capa 1", visible: true, opacity: 1, grid: ["K", ".", "W"] }] },
  ],
};

describe("share.js", () => {
  it("genera un parámetro URL-safe", () => {
    const param = buildShareParam(SAMPLE, 6);
    expect(param).not.toMatch(/[+/=]/);
    expect(param.length).toBeGreaterThan(0);
  });

  it("round-trip: descomprime y devuelve el mismo proyecto", () => {
    const param = buildShareParam(SAMPLE, 6);
    const json = readShareParam(param);
    const parsed = JSON.parse(json);
    expect(parsed.fps).toBe(6);
    expect(parsed.frames[0].layers[0].grid).toEqual(["K", ".", "W"]);
    expect(parsed.frames[0].duration).toBeNull();
  });

  it("reproduce un proyecto con varios frames", () => {
    const multi = { ...SAMPLE, frames: [SAMPLE.frames[0], SAMPLE.frames[0]] };
    const param = buildShareParam(multi, 12);
    const parsed = JSON.parse(readShareParam(param));
    expect(parsed.frames.length).toBe(2);
    expect(parsed.fps).toBe(12);
  });

  it("lanza error si el parámetro es inválido", () => {
    expect(() => readShareParam("no-es-base64-!!!")).toThrow();
  });
});