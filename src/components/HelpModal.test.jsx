import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpModal from "./HelpModal.jsx";
import GuideModal from "./GuideModal.jsx";

describe("HelpModal", () => {
  it("lista los atajos", () => {
    render(<HelpModal onClose={() => {}} />);
    expect(screen.getByText("Atajos")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+A")).toBeInTheDocument();
    expect(screen.getByText("Simetría vertical on/off")).toBeInTheDocument();
  });

  it("cierra con Escape", () => {
    const onClose = vi.fn();
    render(<HelpModal onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});

describe("GuideModal", () => {
  it("muestra las secciones de la guía", () => {
    render(<GuideModal onClose={() => {}} />);
    expect(screen.getByText("Guía de uso")).toBeInTheDocument();
    expect(screen.getByText("Empezar")).toBeInTheDocument();
    expect(screen.getByText("Frames y animación")).toBeInTheDocument();
    expect(screen.getByText("Problemas comunes")).toBeInTheDocument();
  });

  it("cierra con Escape", () => {
    const onClose = vi.fn();
    render(<GuideModal onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});