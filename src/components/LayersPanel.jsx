import { useEffect, useRef } from "react";
import { PX } from "../lib/palette.js";

export default function LayersPanel({ frame, activeLayer, onSelect, onAdd, onRemove, onUpdate, onMove }) {
  return (
    <div className="panel layers-panel">
      <div className="panel-head">
        <h2>Capas</h2>
        <div className="panel-actions">
          <button className="btn mini" onClick={onAdd} title="Nueva capa">
            +
          </button>
          <button className="btn mini danger" onClick={onRemove} disabled={frame.layers.length <= 1} title="Eliminar capa">
            −
          </button>
        </div>
      </div>
      <div className="layer-list">
        {frame.layers.map((layer, i) => (
          <div
            key={i}
            className={"layer-row" + (i === activeLayer ? " active" : "")}
            onClick={() => onSelect(i)}
          >
            <LayerThumb layer={layer} />
            <div className="layer-info">
              <input
                className="layer-name"
                value={layer.name}
                spellCheck={false}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onUpdate({ name: e.target.value }, i)}
              />
              <div className="opacity-row">
                <span className="opacity-label">{Math.round((layer.opacity ?? 1) * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((layer.opacity ?? 1) * 100)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdate({ opacity: Number(e.target.value) / 100 }, i)}
                  title="Opacidad"
                />
              </div>
            </div>
            <div className="layer-tools">
              <button
                className={"btn mini" + (layer.visible ? "" : " muted")}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ visible: !layer.visible }, i);
                }}
                title={layer.visible ? "Ocultar" : "Mostrar"}
              >
                {layer.visible ? "👁" : "🚫"}
              </button>
              <button
                className="btn mini"
                disabled={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(-1, i);
                }}
                title="Subir"
              >
                ↑
              </button>
              <button
                className="btn mini"
                disabled={i === frame.layers.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(1, i);
                }}
                title="Bajar"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayerThumb({ layer }) {
  const ref = useRef(null);
  const gridSize = Math.round(Math.sqrt(layer.grid.length));
  const s = 6;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!layer.visible) return;
    ctx.globalAlpha = layer.opacity ?? 1;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = layer.grid[y * gridSize + x];
        if (!key || key === ".") continue;
        ctx.fillStyle = PX[key] || "#000";
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
  }, [layer, gridSize]);
  return <canvas ref={ref} className="layer-thumb" width={gridSize * s} height={gridSize * s} />;
}