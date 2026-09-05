import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toolbar from "./Toolbar.jsx";

function renderToolbar(overrides = {}) {
  const props = {
    tool: "pencil",
    onToolChange: vi.fn(),
    width: 16,
    height: 16,
    onWidthChange: vi.fn(),
    onHeightChange: vi.fn(),
    sizes: [8, 16],
    onRotateCW: vi.fn(),
    onRotateCCW: vi.fn(),
    onFlipH: vi.fn(),
    onFlipV: vi.fn(),
    onClearLayer: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    canUndo: false,
    canRedo: false,
    onReset: vi.fn(),
    fillShapes: false,
    onFillShapesChange: vi.fn(),
    symmetry: false,
    onSymmetryChange: vi.fn(),
    snap: { enabled: false, step: 4 },
    onSnapChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<Toolbar {...props} />), props };
}

describe("Toolbar", () => {
  it("cambia de herramienta", async () => {
    const user = userEvent.setup();
    const { props } = renderToolbar();
    await user.click(screen.getByRole("button", { name: "Relleno" }));
    expect(props.onToolChange).toHaveBeenCalledWith("fill");
  });

  it("la herramienta activa tiene aria-pressed", () => {
    renderToolbar({ tool: "rect" });
    expect(screen.getByRole("button", { name: "Rectángulo" })).toHaveAttribute("aria-pressed", "true");
  });

  it("alterna simetría", async () => {
    const user = userEvent.setup();
    const { props } = renderToolbar();
    await user.click(screen.getByRole("button", { name: "Alternar simetría vertical" }));
    expect(props.onSymmetryChange).toHaveBeenCalled();
  });

  it("alterna snap y cambia el paso", async () => {
    const user = userEvent.setup();
    const { props } = renderToolbar();
    await user.click(screen.getByRole("button", { name: "Alternar snap a grilla" }));
    expect(props.onSnapChange).toHaveBeenCalledWith({ enabled: true, step: 4 });
    await user.selectOptions(screen.getByLabelText("Paso del snap a grilla"), "8");
    expect(props.onSnapChange).toHaveBeenCalledWith({ enabled: false, step: 8 });
  });

  it("deshabilita undo/redo sin histórico", () => {
    renderToolbar();
    expect(screen.getByRole("button", { name: /deshacer/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /rehacer/i })).toBeDisabled();
  });
});