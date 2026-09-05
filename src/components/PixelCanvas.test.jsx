import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import PixelCanvas from "./PixelCanvas.jsx";

function renderCanvas(overrides = {}) {
  const props = {
    width: 16,
    height: 16,
    frame: { layers: [{ name: "Capa 1", visible: true, opacity: 1, grid: [] }] },
    frames: [{ layers: [{ name: "Capa 1", visible: true, opacity: 1, grid: [] }] }],
    activeFrameIndex: 0,
    activeLayerGrid: [],
    tool: "pencil",
    currentColor: "K",
    palette: { K: "#000000", W: "#FFFFFF" },
    zoom: 1,
    setZoom: vi.fn(),
    showGrid: true,
    onToggleGrid: vi.fn(),
    symmetry: false,
    onion: { enabled: false, mode: "prev", opacity: 30 },
    snap: { enabled: false, step: 4 },
    selection: null,
    onSelectionChange: vi.fn(),
    onSelectionMove: vi.fn(),
    beginStroke: vi.fn(),
    paintCells: vi.fn(),
    endStroke: vi.fn(),
    onFill: vi.fn(),
    onPick: vi.fn(),
    onApplyCells: vi.fn(),
    fillShapes: false,
    onHoverChange: vi.fn(),
    ...overrides,
  };
  const { container, ...rest } = render(<PixelCanvas {...props} />);
  return { canvas: container.querySelector("canvas"), props, ...rest };
}

const pt = (x, y, extra = {}) => ({ pointerId: 1, button: 0, clientX: x * 16 + 8, clientY: y * 16 + 8, ...extra });

describe("PixelCanvas", () => {
  it("pinta una celda con el pincel", () => {
    const { canvas, props } = renderCanvas();
    fireEvent.pointerDown(canvas, pt(0, 0));
    expect(props.paintCells).toHaveBeenCalledWith([0], "K");
  });

  it("con simetría pinta también el espejo", () => {
    const { canvas, props } = renderCanvas({ symmetry: true });
    fireEvent.pointerDown(canvas, pt(0, 0));
    expect(props.paintCells).toHaveBeenCalledWith([0, 15], "K");
  });

  it("con simetría y ancho par espeja en el eje X", () => {
    const { canvas, props } = renderCanvas({ symmetry: true });
    fireEvent.pointerDown(canvas, pt(3, 5));
    expect(props.paintCells).toHaveBeenCalledWith([83, 92], "K");
  });

  it("el borrador pinta transparente", () => {
    const { canvas, props } = renderCanvas({ tool: "eraser" });
    fireEvent.pointerDown(canvas, pt(2, 2));
    expect(props.paintCells).toHaveBeenCalledWith([34], ".");
  });

  it("el relleno llama onFill con la celda", () => {
    const { canvas, props } = renderCanvas({ tool: "fill" });
    fireEvent.pointerDown(canvas, pt(1, 1));
    expect(props.onFill).toHaveBeenCalledWith(17);
  });

  it("el cuentagotas llama onPick", () => {
    const { canvas, props } = renderCanvas({ tool: "pipette" });
    fireEvent.pointerDown(canvas, pt(4, 4));
    expect(props.onPick).toHaveBeenCalledWith(68);
  });

  it("snap alinea un rectángulo a la sub-grilla", () => {
    const { canvas, props } = renderCanvas({ tool: "rect", snap: { enabled: true, step: 4 } });
    fireEvent.pointerDown(canvas, pt(5, 5));
    fireEvent.pointerMove(canvas, pt(7, 7));
    fireEvent.pointerUp(canvas, pt(7, 7));
    expect(props.onApplyCells).toHaveBeenCalledTimes(1);
    const cells = props.onApplyCells.mock.calls[0][0];
    expect(cells).toContain(4 * 16 + 4); // esquina ancla (4,4)
    expect(cells).toContain(8 * 16 + 8); // esquina final (8,8)
  });
});