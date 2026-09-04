const TOOLS = [
  { id: "pencil", label: "Pincel", icon: "✏️", key: "B" },
  { id: "eraser", label: "Borrador", icon: "◻️", key: "E" },
  { id: "fill", label: "Relleno", icon: "🪣", key: "G" },
  { id: "pipette", label: "Cuentagotas", icon: "💧", key: "I" },
  { id: "line", label: "Línea", icon: "╱", key: "L" },
  { id: "rect", label: "Rectángulo", icon: "▭", key: "R" },
  { id: "ellipse", label: "Elipse", icon: "◯", key: "" },
  { id: "select", label: "Selección", icon: "⌗", key: "S" },
];

export default function Toolbar({
  tool,
  onToolChange,
  width,
  height,
  onWidthChange,
  onHeightChange,
  sizes,
  onRotateCW,
  onRotateCCW,
  onFlipH,
  onFlipV,
  onClearLayer,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onReset,
  fillShapes,
  onFillShapesChange,
  symmetry,
  onSymmetryChange,
  snap,
  onSnapChange,
}) {
  const sizeOptions = (current) => {
    const opts = sizes.includes(current) ? sizes : [...sizes, current].sort((a, b) => a - b);
    return opts;
  };
  return (
    <div className="panel toolbar-panel">
      <div className="toolbar-row">
        <div className="tool-group">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={"btn tool" + (tool === t.id ? " active" : "")}
              onClick={() => onToolChange(t.id)}
              title={`${t.label}${t.key ? ` (${t.key})` : ""}`}
              aria-label={t.label}
              aria-pressed={tool === t.id}
            >
              <span className="tool-icon">{t.icon}</span>
              <span className="tool-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="tool-group size-group">
          <label>Ancho</label>
          <select value={width} onChange={(e) => onWidthChange(Number(e.target.value))}>
            {sizeOptions(width).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label>× Alto</label>
          <select value={height} onChange={(e) => onHeightChange(Number(e.target.value))}>
            {sizeOptions(height).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="tool-group">
          <label>
            <input type="checkbox" checked={fillShapes} onChange={(e) => onFillShapesChange(e.target.checked)} />
            Relleno formas
          </label>
        </div>
      </div>

      <div className="toolbar-row">
        <button className="btn mini" onClick={onRotateCW} title="Rotar 90° →">
          ⟳ 90°
        </button>
        <button className="btn mini" onClick={onRotateCCW} title="Rotar 90° ←">
          ⟲ 90°
        </button>
        <button className="btn mini" onClick={onFlipH} title="Voltear horizontal">
          ↔ voltear
        </button>
        <button className="btn mini" onClick={onFlipV} title="Voltear vertical">
          ↕ voltear
        </button>
        <span className="sep" />
        <button
          className={"btn mini" + (symmetry ? " active" : "")}
          onClick={onSymmetryChange}
          title="Simetría vertical (M)"
          aria-label="Alternar simetría vertical"
          aria-pressed={symmetry}
        >
          🔄 Simetría
        </button>
        <div className="tool-group snap-group">
          <button
            className={"btn mini" + (snap.enabled ? " active" : "")}
            onClick={() => onSnapChange({ ...snap, enabled: !snap.enabled })}
            title="Snap a sub-grilla (Alt+S)"
            aria-label="Alternar snap a grilla"
            aria-pressed={snap.enabled}
          >
            ⌗ Snap
          </button>
          <select
            value={snap.step}
            onChange={(e) => onSnapChange({ ...snap, step: Number(e.target.value) })}
            title="Paso del snap"
            aria-label="Paso del snap a grilla"
          >
            <option value={2}>×2</option>
            <option value={4}>×4</option>
            <option value={8}>×8</option>
          </select>
        </div>
        <span className="sep" />
        <button className="btn mini" onClick={onUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)">
          ↩ Deshacer
        </button>
        <button className="btn mini" onClick={onRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)">
          ↪ Rehacer
        </button>
        <button className="btn mini danger" onClick={onClearLayer} title="Limpiar capa activa">
          🗑 Capa
        </button>
        <button className="btn mini danger" onClick={onReset} title="Nuevo proyecto">
          ✕ Nuevo
        </button>
      </div>
    </div>
  );
}