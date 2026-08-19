import { PX_ORDER } from "../lib/palette.js";

export default function Palette({ palette, currentColor, onSelect, onEdit, onReset, isCustom }) {
  return (
    <div className="panel palette-panel">
      <div className="panel-head">
        <h2>Paleta {isCustom ? <span className="custom-badge">custom</span> : ""}</h2>
        <div className="panel-actions">
          <button className="btn mini" onClick={onReset} disabled={!isCustom} title="Restaurar paleta original">
            ↺
          </button>
        </div>
      </div>
      <div id="palette">
        <div
          className={"swatch transparent" + (currentColor === "." ? " active" : "")}
          title="Transparente (.)"
          onClick={() => onSelect(".")}
        >
          ·
        </div>
        {PX_ORDER.map((k, i) => {
          const active = currentColor === k;
          const hex = palette[k] || "#000000";
          return (
            <label
              key={k}
              className={"swatch-wrap" + (active ? " active" : "")}
              style={{ background: hex }}
              title={k + " · atajo " + (i + 1)}
            >
              <input
                className="swatch-input"
                type="color"
                value={hex}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(k);
                }}
                onChange={(e) => onEdit(k, e.target.value)}
              />
              <span className="swatch-key">{k}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}