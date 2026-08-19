export default function Toolbar({ size, onSizeChange, onClear, onMirrorH, onMirrorV, onUndo, onRedo, canUndo, canRedo }) {
  return (
    <div className="toolbar">
      <div className="row">
        <label>
          Tamaño
          <select value={size} onChange={(e) => onSizeChange(Number(e.target.value))}>
            {[16, 32, 48, 64].map((s) => (
              <option key={s} value={s}>
                {s}×{s}
              </option>
            ))}
          </select>
        </label>
        <button className="btn secondary" onClick={onMirrorH} disabled={!canUndo}>
          ↕ espejo vertical
        </button>
        <button className="btn secondary" onClick={onMirrorV} disabled={!canUndo}>
          ↔ espejo horizontal
        </button>
        <button className="btn" onClick={onClear}>
          Limpiar
        </button>
        <button className="btn secondary" onClick={onUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)">
          ↩ Deshacer
        </button>
        <button className="btn secondary" onClick={onRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)">
          ↪ Rehacer
        </button>
      </div>
    </div>
  );
}