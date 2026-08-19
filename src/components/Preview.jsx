import { useEffect, useRef } from "react";
import { PX } from "../sprites/palette.js";

export default function Preview({ size, grid, scale }) {
  const smallRef = useRef(null);
  const largeRef = useRef(null);

  useEffect(() => {
    const ps = 13;
    const sctx = smallRef.current.getContext("2d");
    sctx.clearRect(0, 0, smallRef.current.width, smallRef.current.height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const col = grid[y * size + x];
        if (col && col !== ".") {
          sctx.fillStyle = PX[col];
          sctx.fillRect(x * ps, y * ps, ps, ps);
        }
      }
    }

    const lc = largeRef.current;
    const s = scale;
    lc.width = size * s;
    lc.height = size * s;
    const g = lc.getContext("2d");
    g.clearRect(0, 0, lc.width, lc.height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const col = grid[y * size + x];
        if (col && col !== ".") {
          g.fillStyle = PX[col];
          g.fillRect(x * s, y * s, s, s);
        }
      }
    }
  }, [grid, size, scale]);

  return (
    <div id="preview">
      <figure className="preview-item">
        <canvas ref={smallRef} width={13 * size} height={13 * size} />
        <figcaption>grilla (13px/px)</figcaption>
      </figure>
      <figure className="preview-item">
        <canvas ref={largeRef} width={16 * size} height={16 * size} />
        <figcaption>grande</figcaption>
      </figure>
    </div>
  );
}