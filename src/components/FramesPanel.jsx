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
}) {
  return (
    <div className="panel frames-panel">
      <div className="panel-head">
        <h2>Frames · Animación</h2>
        <div className="panel-actions">
          <button className="btn mini" onClick={() => onAdd(false)} title="Nuevo frame">
            +
          </button>
          <button className="btn mini" onClick={() => onAdd(true)} title="Duplicar frame">
            ⧉
          </button>
          <button className="btn mini danger" onClick={onRemove} disabled={project.frames.length <= 1} title="Eliminar frame">
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
            <FrameThumb frame={frame} size={project.size} />
            <span>{i + 1}</span>
          </div>
        ))}
      </div>
      {project.frames.length > 1 && (
        <div className="anim-controls">
          <button className="btn mini" onClick={onTogglePlay} title={playing ? "Pausar" : "Reproducir"}>
            {playing ? "⏸" : "▶"}
          </button>
          <span className="fps-label">{fps} fps</span>
          <input
            type="range"
            min="1"
            max="24"
            value={fps}
            onChange={(e) => onFpsChange(Number(e.target.value))}
            title="Velocidad"
          />
          <button className="btn mini" disabled={project.activeFrame === 0} onClick={() => onMove(-1)} title="Mover frame a la izquierda">
            ◀
          </button>
          <button className="btn mini" disabled={project.activeFrame === project.frames.length - 1} onClick={() => onMove(1)} title="Mover frame a la derecha">
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

function FrameThumb({ frame, size }) {
  const ref = useRef(null);
  const s = 4;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    const { colors } = composeFrame(frame, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = colors[y * size + x];
        if (!c || c[3] === 0) continue;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
  }, [frame, size]);
  return <canvas ref={ref} className="frame-thumb" width={size * s} height={size * s} />;
}