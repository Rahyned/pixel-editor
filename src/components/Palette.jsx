import { PX, PX_ORDER } from "../sprites/palette.js";

export default function Palette({ currentColor, onSelect }) {
  return (
    <div id="palette">
      <div
        className={"swatch transparent" + (currentColor === "." ? " active" : "")}
        title="Transparente (.)"
        onClick={() => onSelect(".")}
      >
        ·
      </div>
      {PX_ORDER.map((k, i) => (
        <div
          key={k}
          className={"swatch" + (currentColor === k ? " active" : "")}
          style={{ background: PX[k] }}
          title={k + " · atajo " + (i + 1)}
          onClick={() => onSelect(k)}
        >
          {k}
        </div>
      ))}
    </div>
  );
}