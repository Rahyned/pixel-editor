import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CodeOutput from "./CodeOutput.jsx";

const makeProject = (rows) => ({
  width: rows[0].length,
  height: rows.length,
  activeFrame: 0,
  palette: { K: "#000000", W: "#FFFFFF", R: "#FF0000", O: "#FF8800", G: "#FFD166", Y: "#FFE66D", N: "#2A9D8F", L: "#7BD389", B: "#3A86FF", C: "#90CAF9", P: "#FF7BAC", V: "#9B5DE5", T: "#8B5A2B", H: "#C68958", E: "#6C757D", F: "#B0B8C0", A: "#00C2C7", D: "#722F37", I: "#FF0000", J: "#FF8C00", Q: "#FFD700", U: "#9ACD32", M: "#228B22", X: "#00BFFF", Z: "#4169E1", S: "#FF69B4", "%": "#800080", "!": "#FF00FF", "$": "#A0522D", "&": "#F5DEB3", "#": "#555555", "@": "#C0C0C0", "0": "#2B2B33", "1": "#3D3D47", "2": "#4F4F5C", "3": "#7C7C8C", "4": "#A6A6B4", "5": "#34517A", "6": "#3E5E8C", "7": "#54769F", "8": "#6B8CB5", "^": "#D2D2E6", "+": "#BBBAD6", "=": "#8282A8", "9": "#000101" },
  frames: [{ layers: [{ name: "Capa 1", visible: true, opacity: 1, grid: rows.join("").split("") }] }],
});

describe("CodeOutput", () => {
  const open = () => fireEvent.click(screen.getByRole("button", { name: "Mostrar Código JS" }));
  const codeText = () => document.querySelector(".code-block pre").textContent;

  it("genera el código con el nombre y el emoji", () => {
    render(
      <CodeOutput
        project={makeProject(["K.", ".."])}
        name="MUNECO"
        emoji="x"
        onNameChange={() => {}}
        onEmojiChange={() => {}}
        selection={null}
      />
    );
    open();
    expect(codeText()).toContain("export const MUNECO = P([");
    expect(codeText()).toContain('"K."');
    expect(codeText()).toContain('".."');
  });

  it("avisa si la paleta es custom", () => {
    const p = makeProject(["K.", ".."]);
    p.palette.K = "#123456";
    render(
      <CodeOutput project={p} name="X" emoji="" onNameChange={() => {}} onEmojiChange={() => {}} selection={null} />
    );
    open();
    expect(codeText()).toContain("Paleta personalizada usada");
  });

  it("recorta solo la selección", () => {
    render(
      <CodeOutput
        project={makeProject(["KR", ".."])}
        name="X"
        emoji=""
        onNameChange={() => {}}
        onEmojiChange={() => {}}
        selection={{ x: 0, y: 0, w: 2, h: 1 }}
      />
    );
    open();
    expect(codeText()).toContain('"KR"');
    expect(codeText()).not.toContain('".."');
  });
});