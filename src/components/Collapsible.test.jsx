import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Collapsible from "./Collapsible.jsx";

describe("Collapsible", () => {
  it("muestra el título y oculta el cuerpo por defecto", () => {
    render(
      <Collapsible title="Panel">
        <p>Contenido secreto</p>
      </Collapsible>
    );
    expect(screen.getByText("Panel")).toBeInTheDocument();
    expect(screen.queryByText("Contenido secreto")).not.toBeInTheDocument();
  });

  it("abre y cierra al hacer clic", async () => {
    const user = userEvent.setup();
    render(
      <Collapsible title="Panel">
        <p>Contenido</p>
      </Collapsible>
    );
    const toggle = screen.getByRole("button", { name: /mostrar panel/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByText("Contenido")).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("acepta un badge en el título", () => {
    render(
      <Collapsible title="Panel" badge="sel">
        <p>x</p>
      </Collapsible>
    );
    expect(screen.getByText("sel")).toBeInTheDocument();
  });

  it("muestra acciones en el header", () => {
    render(
      <Collapsible title="Panel" actions={<button>Acción</button>}>
        <p>x</p>
      </Collapsible>
    );
    expect(screen.getByRole("button", { name: "Acción" })).toBeInTheDocument();
  });
});