import { useCallback, useEffect, useRef, useState } from "react";
import { useProject } from "./state/useProject.js";
import { composeFrame } from "./lib/composite.js";
import { PX } from "./lib/palette.js";
import {
  floodFillGrid,
  copyRegion,
  flipGridH,
  flipGridV,
} from "./lib/tools.js";
import {
  parseProjectJson,
  parseSpriteText,
  rowsToSpriteGrid,
  imageToGrid,
} from "./lib/import.js";
import PixelCanvas from "./components/PixelCanvas.jsx";
import Toolbar from "./components/Toolbar.jsx";
import Palette from "./components/Palette.jsx";
import LayersPanel from "./components/LayersPanel.jsx";
import FramesPanel from "./components/FramesPanel.jsx";
import Preview from "./components/Preview.jsx";
import CodeOutput from "./components/CodeOutput.jsx";
import ExportImport from "./components/ExportImport.jsx";
import "./styles.css";

const STORAGE_KEY = "pixel-editor.v2.project";

function loadSavedProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseProjectJson(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export default function App() {
  const saved = loadSavedProject();
  const p = useProject(saved?.width || 16, saved?.height || 16);
  const { project, activeFrame } = p;

  const [tool, setTool] = useState("pencil");
  const [currentColor, setCurrentColor] = useState("K");
  const [name, setName] = useState("MI_SPRITE");
  const [emoji, setEmoji] = useState("");
  const [scale, setScale] = useState(16);
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(6);
  const [fillShapes, setFillShapes] = useState(false);
  const [status, setStatus] = useState("Listo. Elegí una herramienta y pintá.");
  const statusTimer = useRef(null);

  const activeLayerGrid = activeFrame.layers[project.activeLayer]?.grid || [];
  const isCustomPalette = !Object.keys(PX).every(
    (k) => k === "." || project.palette[k] === PX[k]
  );

  const flash = useCallback(
    (msg) => {
      setStatus(msg);
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setStatus(""), 2500);
    },
    []
  );

  // Autoguardado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* ignore */
    }
  }, [project]);

  // --- Acciones de edición ---
  const handleApplyCells = useCallback(
    (cells, value) => {
      if (!cells.length) return;
      p.applyGrid((g) => {
        const next = g.slice();
        for (const idx of cells) next[idx] = value;
        return next;
      });
      flash(`${cells.length} px aplicados.`);
    },
    [p, flash]
  );

  const handleFill = useCallback(
    (index) => {
      p.applyGrid((g) => floodFillGrid(g, project.width, project.height, index, currentColor));
      flash("Relleno aplicado.");
    },
    [p, project.width, project.height, currentColor, flash]
  );

  const handlePick = useCallback(
    (index) => {
      const { colors } = composeFrame(activeFrame, project.width, project.height);
      const c = colors[index];
      if (!c || c[3] === 0) {
        flash("Píxel transparente — nada que tomar.");
        return;
      }
      // encontrar la clave más cercana en la paleta
      let best = "K";
      let bestDist = Infinity;
      for (const k of Object.keys(project.palette)) {
        const hex = project.palette[k];
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const dist = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = k;
        }
      }
      setCurrentColor(best);
      flash(`Cuentagotas: ${best} (${project.palette[best]})`);
    },
    [activeFrame, project.width, project.height, project.palette, flash]
  );

  const handleSelectionMove = useCallback(
    (region, target) => {
      if (!region || !target) return;
      const w = project.width;
      const h = project.height;
      p.applyGrid((g) => {
        let next = g.slice();
        // limpiar la zona original
        for (let y = 0; y < region.h; y++) {
          for (let x = 0; x < region.w; x++) {
            const gx = region.x + x;
            const gy = region.y + y;
            if (gx < 0 || gx >= w || gy < 0 || gy >= h) continue;
            next[gy * w + gx] = ".";
          }
        }
        // pegar en destino
        for (let y = 0; y < region.h; y++) {
          for (let x = 0; x < region.w; x++) {
            const gx = target.x + x;
            const gy = target.y + y;
            if (gx < 0 || gx >= w || gy < 0 || gy >= h) continue;
            const v = region.grid[y * region.w + x];
            if (v && v !== ".") next[gy * w + gx] = v;
          }
        }
        return next;
      });
      setSelection({ x: target.x, y: target.y, w: region.w, h: region.h });
      flash("Selección movida.");
    },
    [p, project.width, project.height, flash]
  );

  // --- Portapapeles ---
  const copySelection = useCallback(() => {
    if (!selection) {
      flash("Primero seleccioná un área con la herramienta Selección.");
      return;
    }
    const sub = copyRegion(activeLayerGrid, project.width, project.height, selection);
    if (!sub) return;
    setClipboard({ ...sub, w: selection.w, h: selection.h });
    flash("Copiado al portapapeles (Ctrl+V para pegar).");
  }, [selection, activeLayerGrid, project.width, project.height, flash]);

  const cutSelection = useCallback(() => {
    if (!selection) return;
    copySelection();
    const w = project.width;
    const h = project.height;
    p.applyGrid((g) => {
      const next = g.slice();
      for (let y = 0; y < selection.h; y++) {
        for (let x = 0; x < selection.w; x++) {
          const gx = selection.x + x;
          const gy = selection.y + y;
          if (gx >= 0 && gx < w && gy >= 0 && gy < h) {
            next[gy * w + gx] = ".";
          }
        }
      }
      return next;
    });
    flash("Cortado.");
  }, [selection, copySelection, p, project.width, project.height, flash]);

  const pasteSelection = useCallback(
    (offset = 8) => {
      if (!clipboard) {
        flash("Portapapeles vacío.");
        return;
      }
      const w = project.width;
      const h = project.height;
      const x = selection ? selection.x + offset : Math.floor((w - clipboard.w) / 2);
      const y = selection ? selection.y + offset : Math.floor((h - clipboard.h) / 2);
      p.applyGrid((g) => {
        let next = g.slice();
        for (let py = 0; py < clipboard.h; py++) {
          for (let px = 0; px < clipboard.w; px++) {
            const gx = x + px;
            const gy = y + py;
            if (gx < 0 || gx >= w || gy < 0 || gy >= h) continue;
            const v = clipboard.grid[py * clipboard.w + px];
            if (v && v !== ".") next[gy * w + gx] = v;
          }
        }
        return next;
      });
      setSelection({ x, y, w: clipboard.w, h: clipboard.h });
      flash("Pegado.");
    },
    [clipboard, selection, project.width, project.height, p, flash]
  );

  const deleteSelection = useCallback(() => {
    if (!selection) return;
    const w = project.width;
    const h = project.height;
    p.applyGrid((g) => {
      const next = g.slice();
      for (let y = 0; y < selection.h; y++) {
        for (let x = 0; x < selection.w; x++) {
          const gx = selection.x + x;
          const gy = selection.y + y;
          if (gx >= 0 && gx < w && gy >= 0 && gy < h) {
            next[gy * w + gx] = ".";
          }
        }
      }
      return next;
    });
    flash("Selección borrada.");
  }, [selection, p, project.width, project.height, flash]);

  // --- Teclado ---
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const colorMap = { 1: "K", 2: "W", 3: "R", 4: "O", 5: "G", 6: "Y", 7: "N", 8: "L", 9: "B" };
      if (colorMap[e.key]) {
        setCurrentColor(colorMap[e.key]);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setTool("eraser");
        return;
      }
      const toolMap = {
        b: "pencil",
        e: "eraser",
        g: "fill",
        i: "pipette",
        l: "line",
        r: "rect",
        o: "ellipse",
        s: "select",
      };
      if (toolMap[e.key.toLowerCase()]) {
        setTool(toolMap[e.key.toLowerCase()]);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) p.redo();
        else p.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        p.redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        cutSelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteSelection();
        return;
      }
      if (e.key === "Delete" || e.key === "Supr") {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if (e.key === "Escape") {
        setSelection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p, copySelection, cutSelection, pasteSelection, deleteSelection]);

  // --- Import de sprite ---
  const handleImportSprite = useCallback(
    (text) => {
      try {
        const rows = parseSpriteText(text);
        const { grid, width, height } = rowsToSpriteGrid(rows);
        // ajustar el lienzo al tamaño del sprite pegado (igual que el importador de imágenes)
        p.setDimensions(width, height);
        setSelection(null);
        p.importGrid(grid);
        flash(`✓ Sprite importado en la capa activa (${width}x${height}).`);
      } catch (e) {
        flash("✗ " + e.message);
      }
    },
    [p, flash]
  );

  // --- Importar imagen (PNG/JPG) a la capa activa ---
  // Recibe la imagen ya cargada (Image) y opcionalmente una región para recortar una figura.
  // Si se importa una figura, ajusta el lienzo a su proporción (sin distorsión).
  const handleImportImage = useCallback(
    (img, exactColors, autoCrop = true, region = null) => {
      if (!img) {
        flash("✗ No se pudo leer la imagen.");
        return;
      }
      try {
        let w = project.width;
        let h = project.height;
        // ajustar el lienzo a la proporción de la figura importada
        if (region) {
          const ratio = region.w / region.h;
          const dims = p.SIZES;
          let bestW = 16;
          let bestH = 16;
          let bestDiff = Infinity;
          for (const cw of dims) {
            for (const ch of dims) {
              const diff = Math.abs(cw / ch - ratio);
              if (diff < bestDiff) {
                bestDiff = diff;
                bestW = cw;
                bestH = ch;
              }
            }
          }
			w = bestW;
				h = bestH;
				p.setDimensions(w, h);
				setSelection(null);
			}
			const grid = imageToGrid(img, w, h, project.palette, exactColors, autoCrop, region);
			p.importGrid(grid);
			flash("✓ Imagen importada en la capa activa.");
		} catch (e) {
			flash("✗ " + e.message);
		}
    },
    [project.width, project.height, project.palette, p, flash]
  );

  // --- Cargar JSON ---
  const handleLoadJson = useCallback(
    (text) => {
      try {
        const parsed = parseProjectJson(text);
        p.loadProject(parsed);
        setSelection(null);
        flash("✓ Proyecto cargado.");
      } catch (e) {
        flash("✗ " + e.message);
      }
    },
    [p, flash]
  );

  const handleWidthChange = useCallback(
    (w) => {
      p.setDimensions(w, project.height);
      setSelection(null);
      flash(`Lienzo: ${w}×${project.height}.`);
    },
    [p, project.height, flash]
  );

  const handleHeightChange = useCallback(
    (h) => {
      p.setDimensions(project.width, h);
      setSelection(null);
      flash(`Lienzo: ${project.width}×${h}.`);
    },
    [p, project.width, flash]
  );

  const handleRotate = useCallback(
    (dir) => {
      p.rotate(dir);
      setSelection(null);
      flash(dir === "cw" ? "Rotado 90° →" : "Rotado 90° ←");
    },
    [p, flash]
  );

  const handleFlip = useCallback(
    (dir) => {
      p.transformLayer((g, w, h) =>
        dir === "h" ? flipGridH(g, w, h) : flipGridV(g, w, h)
      );
      flash(dir === "h" ? "Volteado horizontal" : "Volteado vertical");
    },
    [p, flash]
  );

  return (
    <div className="app">
      <header className="topbar">
        <h1>🧷 Pixel Sprite Editor</h1>
        <p className="help">
          Pintá sprites para tus proyectos. <b>Click</b> = pintar · <b>click derecho</b> = borrar ·
          <b>arrastrar</b> = pintar seguido · <b>rueda</b> = zoom. Atajos: <code>1-9</code> color,{" "}
          <code>B/E/G/I/L/R/O/S</code> herramientas, <code>Space</code> borrador,{" "}
          <code>Ctrl+Z/Y</code> undo/redo, <code>Ctrl+C/X/V</code> y <code>Del</code> para selección.
        </p>
      </header>

      <div className="layout">
        <div className="main-col">
          <Toolbar
            tool={tool}
            onToolChange={setTool}
            width={project.width}
            height={project.height}
            onWidthChange={handleWidthChange}
            onHeightChange={handleHeightChange}
            sizes={p.SIZES}
            onRotateCW={() => handleRotate("cw")}
            onRotateCCW={() => handleRotate("ccw")}
            onFlipH={() => handleFlip("h")}
            onFlipV={() => handleFlip("v")}
            onClearLayer={p.clearLayer}
            onUndo={p.undo}
            onRedo={p.redo}
            canUndo={p.canUndo}
            canRedo={p.canRedo}
            onReset={() => {
              p.reset();
              setSelection(null);
              flash("Nuevo proyecto creado.");
            }}
            fillShapes={fillShapes}
            onFillShapesChange={setFillShapes}
          />

          <PixelCanvas
            width={project.width}
            height={project.height}
            frame={activeFrame}
            activeLayerGrid={activeLayerGrid}
            tool={tool}
            currentColor={currentColor}
            zoom={zoom}
            setZoom={setZoom}
            selection={selection}
            onSelectionChange={setSelection}
            onSelectionMove={handleSelectionMove}
            beginStroke={p.beginStroke}
            paintCells={p.paintCells}
            endStroke={p.endStroke}
            onFill={handleFill}
            onPick={handlePick}
            onApplyCells={handleApplyCells}
            fillShapes={fillShapes}
          />

          <div className="config-row">
            <div className="field">
              <label>Nombre</label>
              <input value={name} spellCheck={false} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Emoji</label>
              <input value={emoji} maxLength={4} placeholder="⭐" style={{ maxWidth: 80 }} onChange={(e) => setEmoji(e.target.value)} />
            </div>
            <div className="field">
              <label>Escala preview</label>
              <input
                type="number"
                value={scale}
                min="1"
                max="64"
                style={{ maxWidth: 90 }}
                onChange={(e) => setScale(Number(e.target.value) || 16)}
              />
            </div>
          </div>
        </div>

        <aside className="side-col">
          <Palette
            palette={project.palette}
            currentColor={currentColor}
            onSelect={setCurrentColor}
            onEdit={p.setPaletteColor}
            onReset={p.resetPalette}
            isCustom={isCustomPalette}
          />

          <LayersPanel
            frame={activeFrame}
            activeLayer={project.activeLayer}
            onSelect={p.setActiveLayer}
            onAdd={p.addLayer}
            onRemove={p.removeLayer}
            onUpdate={(patch, i) => p.updateLayer(patch, i)}
            onMove={(dir) => p.moveLayer(dir)}
          />

          <FramesPanel
            project={project}
            onSelect={p.setActiveFrame}
            onAdd={p.addFrame}
            onRemove={p.removeFrame}
            onDuplicate={() => p.addFrame(true)}
            onMove={p.moveFrame}
            playing={playing}
            onTogglePlay={() => setPlaying((v) => !v)}
            fps={fps}
            onFpsChange={setFps}
          />

          <Preview project={{ ...project, playing, playingFps: fps }} scale={scale} />

          <CodeOutput project={project} name={name} emoji={emoji} selection={selection} />

          <ExportImport
            project={project}
            name={name}
            scale={scale}
            onScaleChange={setScale}
            onLoadJson={handleLoadJson}
            onImportSprite={handleImportSprite}
            onImportImage={handleImportImage}
            selection={selection}
          />
        </aside>
      </div>

      <div className="status-bar">{status || "Listo."}</div>
    </div>
  );
}