import { useEffect, useRef, useCallback } from "react";
import { PX } from "../sprites/palette.js";

export default function PixelCanvas({ size, grid, currentColor, onPaintLine }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastCellRef = useRef(-1);
  const currentColorRef = useRef(currentColor);

  useEffect(() => {
    currentColorRef.current = currentColor;
  }, [currentColor]);

  // Zoom: aplicar escala CSS al canvas via estilo inline
  const zoomRef = useRef(1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const px = canvas.width / size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const col = grid[y * size + x];
        if (col && col !== ".") {
          ctx.fillStyle = PX[col];
          ctx.fillRect(x * px, y * px, px, px);
        }
      }
    }
    // grilla fina
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * px, 0);
      ctx.lineTo(i * px, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * px);
      ctx.lineTo(canvas.width, i * px);
      ctx.stroke();
    }
  }, [grid, size]);

  useEffect(() => {
    draw();
  }, [draw]);

  const cellFromEvent = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (rect.width / size));
      const y = Math.floor((e.clientY - rect.top) / (rect.height / size));
      if (x < 0 || x >= size || y < 0 || y >= size) return -1;
      return y * size + x;
    },
    [size]
  );

  const handleMove = useCallback(
    (e) => {
      if (!drawingRef.current) return;
      const idx = cellFromEvent(e);
      if (idx === -1 || idx === lastCellRef.current) return;
      lastCellRef.current = idx;
      onPaintLine([idx], currentColorRef.current);
    },
    [cellFromEvent, onPaintLine]
  );

  return (
    <canvas
      ref={canvasRef}
      id="editor"
      width={size * 20}
      height={size * 20}
      style={{ zoom: zoomRef.current }}
      onMouseDown={(e) => {
        if (e.button === 2) {
          drawingRef.current = true;
          lastCellRef.current = -1;
          onPaintLine([cellFromEvent(e)], ".");
          e.preventDefault();
          return;
        }
        drawingRef.current = true;
        lastCellRef.current = -1;
        handleMove(e);
      }}
      onMouseMove={handleMove}
      onMouseUp={() => (drawingRef.current = false)}
      onMouseLeave={() => (drawingRef.current = false)}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        // zoom centrado en el cursor
        const ox = (e.clientX - rect.left) / rect.width;
        const oy = (e.clientY - rect.top) / rect.height;
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const next = Math.min(8, Math.max(0.5, zoomRef.current * factor));
        zoomRef.current = next;
        canvas.style.zoom = next;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const nx = ox * w;
        const ny = oy * h;
        canvas.style.transformOrigin = `${nx}px ${ny}px`;
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        drawingRef.current = true;
        lastCellRef.current = -1;
        handleMove({ clientX: t.clientX, clientY: t.clientY });
        e.preventDefault();
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        handleMove({ clientX: t.clientX, clientY: t.clientY });
        e.preventDefault();
      }}
      onTouchEnd={() => (drawingRef.current = false)}
    />
  );
}