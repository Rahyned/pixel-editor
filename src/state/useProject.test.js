import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProject } from "./useProject.js";

function setup(project = null) {
  return renderHook(() => useProject(16, 16, project));
}

describe("useProject", () => {
  it("inicializa un frame con duración null y capa normal", () => {
    const { result } = setup();
    expect(result.current.project.frames.length).toBe(1);
    expect(result.current.project.frames[0].duration).toBeNull();
    expect(result.current.project.frames[0].layers[0].blendMode).toBe("normal");
  });

  it("usa el proyecto inicial (autosave) si se pasa", () => {
    const saved = {
      width: 8,
      height: 8,
      activeFrame: 0,
      activeLayer: 0,
      palette: { K: "#000000" },
      frames: [{ duration: null, layers: [{ name: "c", visible: true, opacity: 1, blendMode: "normal", grid: ["K", "."] }] }],
    };
    const { result } = setup(saved);
    expect(result.current.project.width).toBe(8);
    expect(result.current.project.frames[0].layers[0].grid[0]).toBe("K");
  });

  it("setCell commitea y undo restaura", () => {
    const { result } = setup();
    act(() => result.current.setCell(0, "K"));
    expect(result.current.project.frames[0].layers[0].grid[0]).toBe("K");
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.project.frames[0].layers[0].grid[0]).toBe(".");
    act(() => result.current.redo());
    expect(result.current.project.frames[0].layers[0].grid[0]).toBe("K");
  });

  it("agregar frame: duración null; duplicar conserva la duración", () => {
    const { result } = setup();
    act(() => result.current.updateFrameDuration(0, 150));
    act(() => result.current.addFrame(false));
    expect(result.current.project.frames[1].duration).toBeNull();
    act(() => result.current.setActiveFrame(0));
    act(() => result.current.addFrame(true));
    expect(result.current.project.frames[2].duration).toBe(150);
  });

  it("updateFrameDuration es deshacible", () => {
    const { result } = setup();
    act(() => result.current.updateFrameDuration(0, 300));
    expect(result.current.project.frames[0].duration).toBe(300);
    act(() => result.current.undo());
    expect(result.current.project.frames[0].duration).toBeNull();
  });

  it("setPalette genera una sola entrada de histórico", () => {
    const { result } = setup();
    act(() => result.current.setPalette({ K: "#123456", W: "#FFFFFF" }));
    expect(result.current.project.palette.K).toBe("#123456");
    act(() => result.current.undo());
    expect(result.current.project.palette.K).not.toBe("#123456");
  });

  it("updateLayerAt modifica la capa indicada, no la activa", () => {
    const { result } = setup();
    act(() => result.current.addLayer());
    act(() => result.current.updateLayerAt({ name: "Fondo" }, 1));
    const layers = result.current.project.frames[0].layers;
    expect(layers[1].name).toBe("Fondo");
    expect(layers[0].name).toBe("Capa 1");
  });

  it("setDimensions conserva el contenido arriba-izquierda", () => {
    const { result } = setup();
    act(() => result.current.setCell(0, "K"));
    act(() => result.current.setDimensions(8, 8));
    expect(result.current.project.width).toBe(8);
    expect(result.current.project.frames[0].layers[0].grid[0]).toBe("K");
  });
});