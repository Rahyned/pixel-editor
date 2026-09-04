import { PX_ORDER } from "../lib/palette.js";

export default function Palette({ palette, currentColor, onSelect, onEdit, onReset, isCustom }) {
  const hex = currentColor === "." ? null : palette[currentColor] || "#000000";
  const canEdit = currentColor !== ".";
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
      <div className="current-chip" aria-live="polite">
        <span
          className={"chip-swatch" + (currentColor === "." ? " transparent" : "")}
          style={currentColor === "." ? undefined : { background: hex }}
          aria-hidden="true"
        >
          {currentColor === "." ? "·" : currentColor}
        </span>
        <span className="chip-info">
          <b>{currentColor === "." ? "Transparente" : currentColor}</b>
          <small>{currentColor === "." ? "(borrador)" : hex}</small>
        </span>
        <label
          className={"chip-edit" + (canEdit ? "" : " disabled")}
          title={canEdit ? "Editar el color seleccionado" : "Elegí un color para editarlo"}
        >
          <input
            type="color"
            value={canEdit ? hex : "#000000"}
            disabled={!canEdit}
            aria-label="Editar color seleccionado"
            onChange={(e) => onEdit(currentColor, e.target.value)}
          />
        </label>
      </div>
      <div id="palette">
        <button
          type="button"
          className={"swatch transparent" + (currentColor === "." ? " active" : "")}
          title="Transparente (.)"
          onClick={() => onSelect(".")}
          aria-label="Seleccionar transparente"
          aria-pressed={currentColor === "."}
        >
          ·
        </button>
        {PX_ORDER.map((k, i) => {
          const active = currentColor === k;
          return (
            <button
              type="button"
              key={k}
              className={"swatch-wrap" + (active ? " active" : "")}
              style={{ background: palette[k] || "#000000" }}
              title={k + (i < 9 ? " · atajo " + (i + 1) : "")}
              onClick={() => onSelect(k)}
              aria-label={`Seleccionar color ${k}`}
              aria-pressed={active}
            >
              <span className="swatch-key">{k}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
