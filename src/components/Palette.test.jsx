import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Palette from "./Palette.jsx";
import { PX_ORDER } from "../lib/palette.js";

const PALETTE = { K: "#000000", W: "#FFFFFF", R: "#FF0000" };

function renderPalette(overrides = {}) {
  const props = {
    palette: PALETTE,
    currentColor: "K",
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onReset: vi.fn(),
    isCustom: false,
    onApplyPreset: vi.fn(),
    history: [],
    onHistorySelect: vi.fn(),
    ...overrides,
  };
  return { ...render(<Palette {...props} />), props };
}

describe("Palette", () => {
  it("muestra el color actual y sus swatches", () => {
    renderPalette();
    expect(screen.getByRole("button", { name: "Seleccionar color K" })).toBeInTheDocument();
    // PX_ORDER de swatches + el de transparente
    expect(document.querySelectorAll(".swatch-wrap").length).toBe(PX_ORDER.length);
  });

  it("selecciona un color al tocar el swatch", async () => {
    const user = userEvent.setup();
    const { props } = renderPalette();
    await user.click(screen.getByRole("button", { name: "Seleccionar color R" }));
    expect(props.onSelect).toHaveBeenCalledWith("R");
  });

  it("aplica un preset desde el menú", async () => {
    const user = userEvent.setup();
    const { props } = renderPalette();
    await user.selectOptions(screen.getByLabelText("Cargar paleta preset"), "pico-8");
    expect(props.onApplyPreset).toHaveBeenCalledWith("pico-8");
  });

  it("el historial muestra y selecciona los últimos colores", async () => {
    const user = userEvent.setup();
    const { props } = renderPalette({ history: ["R", "W"] });
    expect(screen.getByText("Usados:")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Usar color R" }));
    expect(props.onHistorySelect).toHaveBeenCalledWith("R");
  });

  it("el botón de restaurar está deshabilitado sin paleta custom", () => {
    renderPalette();
    expect(screen.getByTitle("Restaurar paleta original")).toBeDisabled();
  });
});