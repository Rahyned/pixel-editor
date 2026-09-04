import { PX_ORDER } from "../lib/palette.js";
import { PRESETS } from "../lib/presets.js";

export default function Palette({
  palette,
  currentColor,
  onSelect,
  onEdit,
  onReset,
  isCustom,
  onApplyPreset,
  history,
  onHistorySelect,
}) {
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
      <div className="preset-row">
        <select
          value="custom"
          onChange={(e) => {
            if (e.target.value !== "custom") onApplyPreset(e.target.value);
          }}
          aria-label="Cargar paleta preset"
          title="Paletas clásicas listas para usar"
        >
          <option value="custom">Custom Palette</option>
          <optgroup label="Presets">
            {Object.keys(PRESETS).map((k) => (
              <option key={k} value={k}>
                {k.toUpperCase()}
              </option>
            ))}
          </optgroup>
        </select>
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
      {history.length > 0 && (
        <div className="color-history">
          <span className="history-label">Usados:</span>
          <div className="history-colors">
            {history.map((k) => (
              <button
                type="button"
                key={k}
                className="history-color"
                style={{ background: palette[k] || "#000000" }}
                onClick={() => onHistorySelect(k)}
                title={`Usar ${k}`}
                aria-label={`Usar color ${k}`}
              >
                <span>{k === "." ? "·" : k}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
