import { describe, it, expect } from "vitest";
import {
  lineCells,
  rectCells,
  ellipseCells,
  floodFillGrid,
  normalizeRect,
  flipGridH,
  flipGridV,
  rotateGridCW,
  rotateGridCCW,
  resizeGrid,
  copyRegion,
  pasteRegion,
} from "./tools.js";

describe("lineCells", () => {
  it("traza una línea horizontal", () => {
    expect(lineCells(0, 0, 3, 0, 4, 4)).toEqual([0, 1, 2, 3]);
  });

  it("traza una línea vertical", () => {
    expect(lineCells(1, 0, 1, 3, 4, 4)).toEqual([1, 5, 9, 13]);
  });

  it("traza una diagonal", () => {
    expect(lineCells(0, 0, 3, 3, 4, 4)).toEqual([0, 5, 10, 15]);
  });

  it("no sale de los límites", () => {
    const cells = lineCells(-1, -1, 2, 2, 4, 4);
    expect(cells.every((c) => c >= 0 && c < 16)).toBe(true);
  });
});

describe("rectCells", () => {
  it("contorno: solo el perímetro", () => {
    const cells = rectCells(0, 0, 2, 2, 4, 4, false);
    expect(cells.sort((a, b) => a - b)).toEqual([0, 1, 2, 4, 6, 8, 9, 10]);
  });

  it("relleno: todas las celdas", () => {
    const cells = rectCells(0, 0, 2, 2, 4, 4, true);
    expect(cells.length).toBe(9);
  });
});

describe("ellipseCells", () => {
  it("genera celdas dentro del bounding box", () => {
    const cells = ellipseCells(0, 0, 3, 3, 4, 4, true);
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((c) => c >= 0 && c < 16)).toBe(true);
  });
});

describe("floodFillGrid", () => {
  it("rellena la zona conectada del mismo color", () => {
    // 3x3: . K . / . K . / . K .  (columna central conectada)
    const grid = Array(9).fill(".");
    grid[1] = grid[4] = grid[7] = "K";
    const filled = floodFillGrid(grid, 3, 3, 4, "R");
    expect(filled[1]).toBe("R");
    expect(filled[4]).toBe("R");
    expect(filled[7]).toBe("R");
    expect(filled.filter((c) => c === "R").length).toBe(3);
  });

  it("no pinta zonas del mismo color no conectadas", () => {
    // 3x3: K . . / . K . / . . K  (tres Ks separadas)
    const grid = Array(9).fill(".");
    grid[0] = grid[4] = grid[8] = "K";
    const filled = floodFillGrid(grid, 3, 3, 4, "R");
    expect(filled[4]).toBe("R");
    expect(filled[0]).toBe("K");
    expect(filled[8]).toBe("K");
  });

  it("no cambia nada si el color ya es el mismo", () => {
    const grid = Array(9).fill("K");
    expect(floodFillGrid(grid, 3, 3, 0, "K")).toBe(grid);
  });
});

describe("normalizeRect", () => {
  it("normaliza coordenadas invertidas", () => {
    expect(normalizeRect(3, 3, 1, 1)).toEqual({ x: 1, y: 1, w: 3, h: 3 });
  });
});

describe("volteos y rotaciones", () => {
  it("flipGridH invierte el eje X", () => {
    // 2x2: A B / C D
    expect(flipGridH(["A", "B", "C", "D"], 2, 2)).toEqual(["B", "A", "D", "C"]);
  });

  it("flipGridV invierte el eje Y", () => {
    expect(flipGridV(["A", "B", "C", "D"], 2, 2)).toEqual(["C", "D", "A", "B"]);
  });

  it("rotateGridCW", () => {
    expect(rotateGridCW(["A", "B", "C", "D"], 2, 2)).toEqual(["C", "A", "D", "B"]);
  });

  it("rotateGridCCW", () => {
    expect(rotateGridCCW(["A", "B", "C", "D"], 2, 2)).toEqual(["B", "D", "A", "C"]);
  });
});

describe("resizeGrid", () => {
  it("conserva el contenido desde arriba-izquierda", () => {
    const grid = ["A", "B", "C", "D"]; // 2x2
    const out = resizeGrid(grid, 2, 2, 3, 3);
    expect(out[0]).toBe("A");
    expect(out[1]).toBe("B");
    expect(out[3]).toBe("C");
    expect(out[4]).toBe("D");
    expect(out[8]).toBe(".");
  });
});

describe("copyRegion / pasteRegion", () => {
  it("copia y pega una sub-región", () => {
    const grid = Array(16).fill(".");
    grid[5] = "R"; // (1,1)
    const sub = copyRegion(grid, 4, 4, { x: 1, y: 1, w: 2, h: 2 });
    expect(sub).toContain("R");
    const pasted = pasteRegion(Array(16).fill("."), 4, 4, { grid: sub, width: 2, height: 2 }, { x: 2, y: 2 });
    expect(pasted[2 * 4 + 2]).toBe("R");
  });
});