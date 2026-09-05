import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LayersPanel from "./LayersPanel.jsx";

function renderPanel(overrides = {}) {
  const props = {
    frame: {
      layers: [
        { name: "Fondo", visible: true, opacity: 1, blendMode: "normal", grid: [] },
        { name: "Personaje", visible: true, opacity: 1, blendMode: "normal", grid: [] },
      ],
    },
    activeLayer: 0,
    palette: { K: "#000000" },
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onUpdate: vi.fn(),
    onMove: vi.fn(),
    ...overrides,
  };
  return { ...render(<LayersPanel {...props} />), props };
}

describe("LayersPanel", () => {
  it("lista las capas", () => {
    renderPanel();
    expect(screen.getByDisplayValue("Fondo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Personaje")).toBeInTheDocument();
  });

  it("agrega y elimina capas", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Nueva capa" }));
    expect(props.onAdd).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Eliminar capa" }));
    expect(props.onRemove).toHaveBeenCalled();
  });

  it("renombra la capa correcta", () => {
    const { props } = renderPanel();
    fireEvent.change(screen.getByDisplayValue("Personaje"), { target: { value: "Heroe" } });
    expect(props.onUpdate).toHaveBeenCalledWith({ name: "Heroe" }, 1);
  });

  it("cambia el blend mode de la capa indicada", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    const selects = document.querySelectorAll(".blend-row select");
    await user.selectOptions(selects[1], "multiply");
    expect(props.onUpdate).toHaveBeenCalledWith({ blendMode: "multiply" }, 1);
  });

  it("alterna la visibilidad", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();
    await user.click(screen.getByRole("button", { name: "Ocultar capa Fondo" }));
    expect(props.onUpdate).toHaveBeenCalledWith({ visible: false }, 0);
  });
});