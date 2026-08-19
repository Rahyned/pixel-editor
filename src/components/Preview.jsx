import { useEffect, useRef, useState } from "react";
import { composeFrame } from "../lib/composite.js";

export default function Preview({ project, scale }) {
  const largeRef = useRef(null);
  const [playFrame, setPlayFrame] = useState(project.activeFrame || 0);

  // loop de animación (solo cuando playing y hay 2+ frames)
  useEffect(() => {
    if (project.frames.length <= 1 || !project.playing) return;
    const id = setInterval(() => {
      setPlayFrame((p) => (p + 1) % project.frames.length);
    }, 1000 / (project.playingFps || 6));
    return () => clearInterval(id);
  }, [project.frames.length, project.playing, project.playingFps]);

  // frame manual cuando no se está reproduciendo
  useEffect(() => {
    if (!project.playing) setPlayFrame(project.activeFrame || 0);
  }, [project.activeFrame, project.playing]);

  useEffect(() => {
    const cv = largeRef.current;
    if (!cv) return;
    const frame = project.frames[playFrame];
    if (!frame) return;
    const { size } = project;
    const s = scale;
    cv.width = size * s;
    cv.height = size * s;
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
  }, [project, playFrame, scale]);

  const isMulti = project.frames.length > 1;

  return (
    <div className="panel preview-panel">
      <h2>Vista previa {isMulti ? `· frame ${playFrame + 1}/${project.frames.length}` : ""}</h2>
      <div className="preview-wrap">
        <figure className="preview-item">
          <canvas ref={largeRef} />
          <figcaption>{isMulti ? "animación" : "sprite"} · {scale}px/px</figcaption>
        </figure>
      </div>
    </div>
  );
}