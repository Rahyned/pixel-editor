import { describe, it, expect } from "vitest";
import { projectToJson } from "./export.js";

const PROJECT = {
  fps: 8,
  width: 8,
  height: 8,
  activeFrame: 0,
  activeLayer: 0,
  palette: { K: "#000000" },
  frames: [
    { duration: null, layers: [{ grid: ["K"] }] },
    { duration: 200, layers: [{ grid: [".K"] }] },
  ],
};

describe("projectToJson", () => {
  it("incluye fps y duración por frame", () => {
    const data = JSON.parse(projectToJson(PROJECT, 8));
    expect(data.fps).toBe(8);
    expect(data.frames[0].duration).toBeNull();
    expect(data.frames[1].duration).toBe(200);
  });

  it("serializa frames, capas, paleta y tamaño", () => {
    const data = JSON.parse(projectToJson(PROJECT, 8));
    expect(data.width).toBe(8);
    expect(data.height).toBe(8);
    expect(data.frames.length).toBe(2);
    expect(data.palette.K).toBe("#000000");
  });

  it("el resultado vuelve a parsearse con parseProjectJson sin perder datos", async () => {
    const { parseProjectJson } = await import("./import.js");
    const json = projectToJson(PROJECT, 8);
    const p = parseProjectJson(json);
    expect(p.fps).toBe(8);
    expect(p.frames[1].duration).toBe(200);
  });
});