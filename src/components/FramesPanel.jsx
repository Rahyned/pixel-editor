import { useEffect, useRef } from "react";
import { composeFrame } from "../lib/composite.js";

export default function FramesPanel({
  project,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  playing,
  onTogglePlay,
  fps,
  onFpsChange,
  onion,
  onOnionChange,
  onDurationChange,
}) {
  const defaultMs = Math.round(1000 / (fps || 6));
  return (
    <div className="panel frames-panel">
      <div className="panel-head">
        <h2>Frames · Animación</h2>
        <div className="panel-actions">
          <button className="btn mini" onClick={() => onAdd(false)} title="Nuevo frame" aria-label="Nuevo frame">
            +
          </button>
          <button className="btn mini" onClick={() => onAdd(true)} title="Duplicar frame" aria-label="Duplicar frame">
            ⧉
          </button>
          <button
            className="btn mini danger"
            onClick={onRemove}
            disabled={project.frames.length <= 1}
            title="Eliminar frame"
            aria-label="Eliminar frame"
          >
            −
          </button>
        </div>
      </div>
      <div className="frame-strip">
        {project.frames.map((frame, i) => (
          <div
            key={i}
            className={"frame-cell" + (i === project.activeFrame ? " active" : "")}
            onClick={() => onSelect(i)}
            title={`Frame ${i + 1}`}
          >
            <FrameThumb frame={frame} width={project.width} height={project.height} palette={project.palette} />
            <span>{i + 1}</span>
            <label className="frame-duration" title="Duración del frame en ms">
              <input
                type="number"
                min="1"
                max="10000"
                step="10"
                value={frame.duration ?? defaultMs}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  onDurationChange(i, Math.max(1, Math.round(Number(e.target.value) || defaultMs)))
                }
                aria-label={`Duración del frame ${i + 1} en milisegundos`}
              />
              ms
            </label>
          </div>
        ))}
      </div>
      {project.frames.length > 1 && (
        <div className="anim-controls">
          <button
            className="btn mini"
            onClick={onTogglePlay}
            title={playing ? "Pausar" : "Reproducir"}
            aria-label={playing ? "Pausar animación" : "Reproducir animación"}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <span className="fps-label">{fps} fps</span>
          <input
            type="range"
            min="1"
            max="24"
            value={fps}
            onChange={(e) => onFpsChange(Number(e.target.value))}
            title="Velocidad global por defecto"
            aria-label="Velocidad global de animación (fps)"
          />
          <button
            className="btn mini"
            disabled={project.activeFrame === 0}
            onClick={() => onMove(-1)}
            title="Mover frame a la izquierda"
            aria-label="Mover frame a la izquierda"
          >
            ◀
          </button>
          <button
            className="btn mini"
            disabled={project.activeFrame === project.frames.length - 1}
            onClick={() => onMove(1)}
            title="Mover frame a la derecha"
            aria-label="Mover frame a la derecha"
          >
            ▶
          </button>
        </div>
      )}

      {project.frames.length > 1 && (
        <div className="onion-box">
          <div className="onion-head">
            <span className="onion-title">🧅 Onion skin</span>
            <button
              className="switch"
              role="switch"
              aria-checked={onion.enabled}
              aria-label="Activar onion skin"
              title="Ver frames anteriores/siguientes fantasma (O)"
              onClick={() => onOnionChange({ ...onion, enabled: !onion.enabled })}
            >
              <span className="knob" />
            </button>
          </div>
          {onion.enabled && (
            <>
              <div className="onion-mode" role="group" aria-label="Modo onion skin">
                <button
                  className={"btn mini" + (onion.mode === "prev" ? " active" : "")}
                  aria-pressed={onion.mode === "prev"}
                  onClick={() => onOnionChange({ ...onion, mode: "prev" })}
                  title="Frame anterior + actual"
                >
                  Prev
                </button>
                <button
                  className={"btn mini" + (onion.mode === "both" ? " active" : "")}
                  aria-pressed={onion.mode === "both"}
                  onClick={() => onOnionChange({ ...onion, mode: "both" })}
                  title="Prev + actual + siguiente"
                >
                  Prev + Next
                </button>
              </div>
              <div className="onion-opacity">
                <span className="fps-label">{onion.opacity}%</span>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={onion.opacity}
                  onChange={(e) => onOnionChange({ ...onion, opacity: Number(e.target.value) })}
                  title="Opacidad del fantasma"
                  aria-label="Opacidad del onion skin"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function FrameThumb({ frame, width, height, palette }) {
  const ref = useRef(null);
  const s = Math.min(4, Math.floor(48 / Math.max(width, height)));
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    const { colors } = composeFrame(frame, width, height, palette);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = colors[y * width + x];
        if (!c || c[3] === 0) continue;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
  }, [frame, width, height, s, palette]);
  return <canvas ref={ref} className="frame-thumb" width={width * s} height={height * s} />;
}