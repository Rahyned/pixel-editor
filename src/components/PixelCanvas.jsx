import { useCallback, useEffect, useRef, useState } from "react";
import { composeFrame } from "../lib/composite.js";
import { PX } from "../lib/palette.js";
import { ellipseCells, lineCells, normalizeRect, rectCells } from "../lib/tools.js";

const CELL = 16;

export default function PixelCanvas({
  size,
  frame,
  activeLayerGrid,
  tool,
  currentColor,
  zoom,
  setZoom,
  selection,
  onSelectionChange,
  onSelectionMove,
  beginStroke,
  paintCells,
  endStroke,
  onFill,
  onPick,
  onApplyCells,
  fillShapes,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const dragRef = useRef(null);
  const shapeCellsRef = useRef([]);
  const [shapePreview, setShapePreview] = useState([]);
  const [dragRect, setDragRect] = useState(null);
  const [floatRegion, setFloatRegion] = useState(null);
  const colorRef = useRef(currentColor);
  useEffect(() => {
    colorRef.current = currentColor;
  }, [currentColor]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const px = canvas.width / size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // composición de capas visibles (respeta opacidad)
    const { colors } = composeFrame(frame, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = colors[y * size + x];
        if (!c || c[3] === 0) continue;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
        ctx.fillRect(x * px, y * px, px, px);
      }
    }

    // región flotante (mover selección)
    if (floatRegion) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      for (let y = 0; y < floatRegion.h; y++) {
        for (let x = 0; x < floatRegion.w; x++) {
          const key = floatRegion.grid[y * floatRegion.w + x];
          if (!key || key === ".") continue;
          ctx.fillStyle = PX[key] || "#000";
          ctx.fillRect((floatRegion.x + x) * px, (floatRegion.y + y) * px, px, px);
        }
      }
      ctx.restore();
    }

    // preview de forma (línea/rect/elipse)
    if (shapePreview.length) {
      const col = colorRef.current === "." ? "rgba(255,77,109,0.9)" : PX[colorRef.current] || "#000";
      ctx.globalAlpha = colorRef.current === "." ? 0.5 : 1;
      for (const idx of shapePreview) {
        const x = idx % size;
        const y = (idx - x) / size;
        ctx.fillStyle = col;
        ctx.fillRect(x * px, y * px, px, px);
      }
      ctx.globalAlpha = 1;
    }

    // grilla fina
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
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

    // selección
    const sel = dragRect || selection;
    if (sel && sel.w > 0) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1, px * 0.2);
      ctx.setLineDash([px * 0.6, px * 0.4]);
      ctx.strokeRect(sel.x * px, sel.y * px, sel.w * px, sel.h * px);
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(0,194,199,0.9)";
      ctx.lineWidth = Math.max(1, px * 0.1);
      ctx.strokeRect(sel.x * px, sel.y * px, sel.w * px, sel.h * px);
    }
  }, [frame, size, shapePreview, floatRegion, dragRect, selection]);

  useEffect(() => {
    draw();
  }, [draw]);

  const cellFromEvent = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (rect.width / size));
      const y = Math.floor((e.clientY - rect.top) / (rect.height / size));
      if (x < 0 || x >= size || y < 0 || y >= size) return null;
      return { x, y, idx: y * size + x };
    },
    [size]
  );

  const beginShapeDrag = useCallback(
    (cell) => {
      dragRef.current = { mode: "shape", anchor: cell, last: cell };
      shapeCellsRef.current = [cell.idx];
      setShapePreview([cell.idx]);
    },
    []
  );

  const moveShapeDrag = useCallback(
    (cell) => {
      const d = dragRef.current;
      if (!d || d.mode !== "shape") return;
      const { x: ax, y: ay } = d.anchor;
      let cells = [];
      if (tool === "line") cells = lineCells(ax, ay, cell.x, cell.y, size);
      else if (tool === "rect") cells = rectCells(ax, ay, cell.x, cell.y, size, fillShapes);
      else if (tool === "ellipse") cells = ellipseCells(ax, ay, cell.x, cell.y, size, fillShapes);
      d.last = cell;
      shapeCellsRef.current = cells;
      setShapePreview(cells);
    },
    [tool, size, fillShapes]
  );

  const endShapeDrag = useCallback(() => {
    const d = dragRef.current;
    if (d && d.mode === "shape") {
      if (shapeCellsRef.current.length) onApplyCells(shapeCellsRef.current, colorRef.current);
    }
    dragRef.current = null;
    shapeCellsRef.current = [];
    setShapePreview([]);
  }, [onApplyCells]);

  const beginSelectDrag = useCallback(
    (cell) => {
      dragRef.current = { mode: "select", anchor: cell, last: cell };
      setDragRect({ x: cell.x, y: cell.y, w: 1, h: 1 });
    },
    []
  );

  const moveSelectDrag = useCallback(
    (cell) => {
      const d = dragRef.current;
      if (!d || d.mode !== "select") return;
      const rect = normalizeRect(d.anchor.x, d.anchor.y, cell.x, cell.y);
      d.last = cell;
      setDragRect(rect);
    },
    []
  );

  const endSelectDrag = useCallback(() => {
    const d = dragRef.current;
    if (d && d.mode === "select" && dragRect) {
      onSelectionChange(dragRect);
    }
    dragRef.current = null;
    setDragRect(null);
  }, [dragRect, onSelectionChange]);

  const beginMoveSelect = useCallback(
    (cell) => {
      if (!selection) return;
      const { x, y, w, h } = selection;
      const rows = [];
      for (let gy = 0; gy < h; gy++) {
        let row = "";
        for (let gx = 0; gx < w; gx++) {
          row += activeLayerGrid[(y + gy) * size + (x + gx)] || ".";
        }
        rows.push(row);
      }
      dragRef.current = {
        mode: "move",
        offsetX: cell.x - x,
        offsetY: cell.y - y,
        region: { x, y, w, h, grid: rows.join("").split("") },
      };
      setFloatRegion({ ...selection, grid: dragRef.current.region.grid });
      onSelectionChange(null);
    },
    [selection, activeLayerGrid, size, onSelectionChange]
  );

  const moveMoveSelect = useCallback(
    (cell) => {
      const d = dragRef.current;
      if (!d || d.mode !== "move") return;
      const nx = cell.x - d.offsetX;
      const ny = cell.y - d.offsetY;
      setFloatRegion({ ...d.region, x: nx, y: ny });
    },
    []
  );

  const endMoveSelect = useCallback(() => {
    const d = dragRef.current;
    if (d && d.mode === "move" && floatRegion) {
      onSelectionMove(d.region, floatRegion);
    }
    dragRef.current = null;
    setFloatRegion(null);
  }, [floatRegion, onSelectionMove]);

  const paintAt = useCallback(
    (cell) => {
      const col = tool === "eraser" ? "." : colorRef.current;
      paintCells([cell.idx], col);
    },
    [tool, paintCells]
  );

  const handleDown = useCallback(
    (e) => {
      const cell = cellFromEvent(e);
      if (!cell) return;
      if (e.button === 2 && (tool === "pencil" || tool === "eraser")) {
        e.preventDefault();
        beginStroke();
        paintCells([cell.idx], ".");
        dragRef.current = { mode: "paint" };
        return;
      }
      if (tool === "pencil" || tool === "eraser") {
        beginStroke();
        paintAt(cell);
        dragRef.current = { mode: "paint" };
      } else if (tool === "fill") {
        onFill(cell.idx);
      } else if (tool === "pipette") {
        onPick(cell.idx);
      } else if (tool === "line" || tool === "rect" || tool === "ellipse") {
        beginShapeDrag(cell);
      } else if (tool === "select") {
        if (
          selection &&
          cell.x >= selection.x &&
          cell.x < selection.x + selection.w &&
          cell.y >= selection.y &&
          cell.y < selection.y + selection.h
        ) {
          beginMoveSelect(cell);
        } else {
          beginSelectDrag(cell);
        }
      }
    },
    [
      cellFromEvent,
      tool,
      beginStroke,
      paintCells,
      paintAt,
      onFill,
      onPick,
      beginShapeDrag,
      beginSelectDrag,
      beginMoveSelect,
      selection,
    ]
  );

  const handleMove = useCallback(
    (e) => {
      const cell = cellFromEvent(e);
      if (!cell) return;
      const d = dragRef.current;
      if (!d) return;
      if (d.mode === "paint") {
        paintAt(cell);
      } else if (d.mode === "shape") {
        moveShapeDrag(cell);
      } else if (d.mode === "select") {
        moveSelectDrag(cell);
      } else if (d.mode === "move") {
        moveMoveSelect(cell);
      }
    },
    [cellFromEvent, paintAt, moveShapeDrag, moveSelectDrag, moveMoveSelect]
  );

  const handleUp = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === "paint") endStroke();
    else if (d.mode === "shape") endShapeDrag();
    else if (d.mode === "select") endSelectDrag();
    else if (d.mode === "move") endMoveSelect();
  }, [endStroke, endShapeDrag, endSelectDrag, endMoveSelect]);

  const fitZoom = useCallback(() => {
    const wrap = wrapRef.current;
    const avail = Math.max(320, (wrap ? wrap.clientWidth : 720) - 16);
    setZoom(Math.max(0.25, Math.min(8, avail / (size * CELL))));
  }, [size, setZoom]);

  useEffect(() => {
    fitZoom();
  }, [size, fitZoom]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const wrap = wrapRef.current;
      const rect = wrap.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = Math.max(0.25, Math.min(8, zoom * factor));
      setZoom(next);
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      requestAnimationFrame(() => {
        if (wrap) {
          wrap.scrollLeft = relX - (relX - wrap.scrollLeft) * (next / zoom);
          wrap.scrollTop = relY - (relY - wrap.scrollTop) * (next / zoom);
        }
      });
    },
    [zoom, setZoom]
  );

  return (
    <div className="canvas-zone">
      <div className="canvas-wrap" ref={wrapRef} onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          width={size * CELL}
          height={size * CELL}
          style={{ width: size * CELL * zoom, height: size * CELL * zoom }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            handleDown(e);
          }}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <div className="zoom-bar">
        <button className="btn mini" onClick={() => setZoom(Math.max(0.25, zoom / 1.25))} title="Alejar">
          −
        </button>
        <span className="zoom-val">{Math.round(zoom * 100)}%</span>
        <button className="btn mini" onClick={() => setZoom(Math.min(8, zoom * 1.25))} title="Acercar">
          +
        </button>
        <button className="btn mini" onClick={fitZoom} title="Ajustar al panel">
          ⤢
        </button>
      </div>
    </div>
  );
}