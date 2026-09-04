import { useEffect, useRef, useState } from "react";
import { composeFrame } from "../lib/composite.js";
import Collapsible from "./Collapsible.jsx";

export default function Preview({ project, scale }) {
  const largeRef = useRef(null);
  const [playFrame, setPlayFrame] = useState(project.activeFrame || 0);

  const isMulti = project.frames.length > 1;

  // loop de animación (solo cuando playing y hay 2+ frames).
  // Cada frame respeta su duración individual en ms; si no tiene, usa 1000/fps.
  useEffect(() => {
    if (project.frames.length <= 1 || !project.playing) return;
    let cancelled = false;
    let timer = null;
    const defaultMs = Math.round(1000 / (project.playingFps || 6));
    const step = () => {
      if (cancelled) return;
      setPlayFrame((prev) => {
        const next = (prev + 1) % project.frames.length;
        const f = project.frames[next];
        const d = f?.duration ?? defaultMs;
        timer = setTimeout(step, Math.max(1, d));
        return next;
      });
    };
    step();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [project.frames, project.playing, project.playingFps]);

  // frame manual cuando no se está reproduciendo
  useEffect(() => {
    if (!project.playing) setPlayFrame(project.activeFrame || 0);
  }, [project.activeFrame, project.playing]);

  useEffect(() => {
    const cv = largeRef.current;
    if (!cv) return;
    const frame = project.frames[playFrame];
    if (!frame) return;
    const { width, height } = project;
    const s = scale;
    cv.width = width * s;
    cv.height = height * s;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    const { colors } = composeFrame(frame, width, height, project.palette);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = colors[y * width + x];
        if (!c || c[3] === 0) continue;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
        ctx.fillRect(x * s, y * s, s, s);
      }
    }
  }, [project, playFrame, scale]);

  return (
    <Collapsible
      title={isMulti ? `Vista previa · frame ${playFrame + 1}/${project.frames.length}` : "Vista previa"}
    >
      <div className="preview-wrap">
        <figure className="preview-item">
          <canvas ref={largeRef} />
          <figcaption>{isMulti ? "animación" : "sprite"} · {scale}px/px</figcaption>
        </figure>
      </div>
    </Collapsible>
  );
}