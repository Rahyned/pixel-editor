import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FramesPanel from "./FramesPanel.jsx";

const makeProject = (n) => ({
  width: 16,
  height: 16,
  palette: { K: "#000000" },
  activeFrame: 0,
  frames: Array.from({ length: n }, (_, i) => ({
    duration: i === 1 ? 200 : null,
    layers: [{ name: "Capa 1", visible: true, opacity: 1, grid: [] }],
  })),
});

function renderPanel(overrides = {}) {
  const props = {
    project: makeProject(2),
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onMove: vi.fn(),
    playing: false,
    onTogglePlay: vi.fn(),
    fps: 6,
    onFpsChange: vi.fn(),
    onion: { enabled: false, mode: "prev", opacity: 30 },
    onOnionChange: vi.fn(),
    onDurationChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<FramesPanel {...props} />), props };
}

describe("FramesPanel", () => {
  it("muestra una miniatura por frame", () => {
    renderPanel();
    expect(document.querySelectorAll(".frame-cell").length).toBe(2);
  });

  it("el input de duración muestra el valor efectivo y edita", () => {
    const { props } = renderPanel({ fps: 10 });
    // frame 0: duration null -> 1000/10 = 100ms; frame 1: 200ms
    const inputs = document.querySelectorAll(".frame-duration input");
    expect(inputs[0].value).toBe("100");
    expect(inputs[1].value).toBe("200");
    fireEvent.change(inputs[0], { target: { value: "50" } });
    expect(props.onDurationChange).toHaveBeenCalledWith(0, 50);
  });

  it("agrega, duplica y elimina frames", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Nuevo frame" }));
    expect(props.onAdd).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole("button", { name: "Duplicar frame" }));
    expect(props.onAdd).toHaveBeenCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Eliminar frame" }));
    expect(props.onRemove).toHaveBeenCalled();
  });

  it("toca play con 2+ frames", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Reproducir animación" }));
    expect(props.onTogglePlay).toHaveBeenCalled();
  });

  it("selecciona el frame al tocarlo", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    const cells = document.querySelectorAll(".frame-cell");
    await user.click(cells[1]);
    expect(props.onSelect).toHaveBeenCalledWith(1);
  });

  it("alterna el onion skin", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    await user.click(screen.getByRole("switch", { name: "Activar onion skin" }));
    expect(props.onOnionChange).toHaveBeenCalledWith({ enabled: true, mode: "prev", opacity: 30 });
  });
});