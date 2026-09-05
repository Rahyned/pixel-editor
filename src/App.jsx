import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import HelpModal from "./components/HelpModal.jsx";
import GuideModal from "./components/GuideModal.jsx";
import { presetToPalette } from "./lib/presets.js";
import { BLEND_ORDER } from "./lib/composite.js";
import { exportGif } from "./lib/gifExport.js";
import { readShareParam } from "./lib/share.js";
import "./styles.css";

const STORAGE_KEY = "pixel-editor.v2.project";
const SYMMETRY_KEY = "pixel-editor.v2.symmetry";
const ONION_KEY = "pixel-editor.v2.onion";
const THEME_KEY = "pixel-editor.v2.theme";
const SNAP_KEY = "pixel-editor.v2.snap";

function loadSavedProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseProjectJson(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

export default function App() {
  const [saved] = useState(loadSavedProject);
  const p = useProject(saved?.width || 16, saved?.height || 16, saved);
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
  const [showGrid, setShowGrid] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [sideTab, setSideTab] = useState("palette");
  const [hoverCell, setHoverCell] = useState(null);
  const [symmetry, setSymmetry] = useState(() => loadJson(SYMMETRY_KEY, false));
  const [onion, setOnion] = useState(() =>
    loadJson(ONION_KEY, { enabled: false, mode: "prev", opacity: 30 })
  );
  const [theme, setTheme] = useState(() => {
    const saved = loadJson(THEME_KEY, null);
    if (saved) return saved;
    try {
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [colorHistory, setColorHistory] = useState([]);
  const [snap, setSnap] = useState(() => loadJson(SNAP_KEY, { enabled: false, step: 4 }));

  // aplica el tema antes del primer paint para evitar un flash del tema claro
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    } catch {
      /* ignore */
    }
  }, [theme]);

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

  // elige color y lo registra en el historial (últimos 10)
  const selectColor = useCallback((key) => {
    setCurrentColor(key);
    setColorHistory((prev) => {
      const filtered = prev.filter((c) => c !== key);
      return [key, ...filtered].slice(0, 10);
    });
  }, []);

  const handleApplyPreset = useCallback(
    (name) => {
      const palette = presetToPalette(name);
      if (!palette) return;
      p.setPalette(palette);
      flash(`Paleta ${name} cargada.`);
    },
    [p, flash]
  );

  const handleQuickGif = useCallback(async () => {
    try {
      const bytes = await exportGif(project, { speed: 1, fps });
      const blob = new Blob([bytes], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "sprite"}.gif`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      /* error silencioso */
    }
  }, [project, fps, name]);

  const handleCycleBlend = useCallback(() => {
    const current = activeFrame.layers[project.activeLayer]?.blendMode || "normal";
    const idx = BLEND_ORDER.indexOf(current);
    const next = BLEND_ORDER[(idx + 1) % BLEND_ORDER.length];
    p.updateLayer({ blendMode: next });
    flash(`Blend de capa: ${next}`);
  }, [activeFrame, project.activeLayer, p, flash]);

  // Autoguardado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* ignore */
    }
  }, [project]);

  useEffect(() => {
    try {
      localStorage.setItem(SYMMETRY_KEY, JSON.stringify(symmetry));
    } catch {
      /* ignore */
    }
  }, [symmetry]);

  useEffect(() => {
    try {
      localStorage.setItem(ONION_KEY, JSON.stringify(onion));
    } catch {
      /* ignore */
    }
  }, [onion]);

  useEffect(() => {
    try {
      localStorage.setItem(SNAP_KEY, JSON.stringify(snap));
    } catch {
      /* ignore */
    }
  }, [snap]);

  // Cargar proyecto compartido desde ?project=... (una sola vez)
  const loadedFromUrl = useRef(false);
  useEffect(() => {
    if (loadedFromUrl.current) return;
    loadedFromUrl.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const prm = params.get("project");
      if (!prm) return;
      const parsed = parseProjectJson(readShareParam(prm));
      p.loadProject(parsed);
      setFps(parsed.fps || 6);
      setSelection(null);
      flash("✓ Proyecto compartido cargado.");
    } catch {
      /* URL inválida: seguir con el proyecto local */
    }
  }, [p, flash]);

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
      const { colors } = composeFrame(activeFrame, project.width, project.height, project.palette);
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
      selectColor(best);
      flash(`Cuentagotas: ${best} (${project.palette[best]})`);
    },
    [activeFrame, project.width, project.height, project.palette, selectColor, flash]
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
      if (e.key === "?") {
        setShowHelp((v) => !v);
        return;
      }
      const colorMap = { 1: "K", 2: "W", 3: "R", 4: "O", 5: "G", 6: "Y", 7: "N", 8: "L", 9: "B" };
      if (colorMap[e.key]) {
        selectColor(colorMap[e.key]);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setSideTab("palette");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelection({ x: 0, y: 0, w: project.width, h: project.height });
        flash("Seleccionado todo.");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        handleQuickGif();
        return;
      }
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSnap((v) => ({ ...v, enabled: !v.enabled }));
        return;
      }
      if (e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleCycleBlend();
        return;
      }
      if (e.key.toLowerCase() === "d") {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        p.setActiveFrame((project.activeFrame - 1 + project.frames.length) % project.frames.length);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        p.setActiveFrame((project.activeFrame + 1) % project.frames.length);
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
        s: "select",
      };
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setOnion((v) => ({ ...v, mode: v.mode === "prev" ? "both" : "prev" }));
        return;
      }
      if (toolMap[e.key.toLowerCase()]) {
        setTool(toolMap[e.key.toLowerCase()]);
        return;
      }
      if (e.key.toLowerCase() === "o") {
        setOnion((v) => ({ ...v, enabled: !v.enabled }));
        return;
      }
      if (e.key.toLowerCase() === "m") {
        setSymmetry((v) => !v);
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
  }, [
    p,
    selectColor,
    copySelection,
    cutSelection,
    pasteSelection,
    deleteSelection,
    handleQuickGif,
    handleCycleBlend,
    project.width,
    project.height,
    project.activeFrame,
    project.frames.length,
    flash,
  ]);

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
        setFps(parsed.fps || 6);
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
        <h1>Pixel Sprite Editor</h1>
        <div className="topbar-actions">
          <button
            className="btn mini"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="btn mini"
            onClick={() => setShowGuide(true)}
            title="Guía de uso paso a paso"
            aria-label="Abrir guía de uso"
          >
            📖 Guía
          </button>
          <button
            className="btn mini"
            onClick={() => setShowHelp(true)}
            title="Atajos y gestos (?)"
            aria-label="Ver atajos de teclado"
          >
            ? Atajos
          </button>
        </div>
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
            symmetry={symmetry}
            onSymmetryChange={() => setSymmetry((v) => !v)}
            snap={snap}
            onSnapChange={setSnap}
          />

          <PixelCanvas
            width={project.width}
            height={project.height}
            frame={activeFrame}
            frames={project.frames}
            activeFrameIndex={project.activeFrame}
            activeLayerGrid={activeLayerGrid}
            tool={tool}
            currentColor={currentColor}
            palette={project.palette}
            zoom={zoom}
            setZoom={setZoom}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid((v) => !v)}
            symmetry={symmetry}
            onion={onion}
            snap={snap}
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
            onHoverChange={setHoverCell}
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
            onion={onion}
            onOnionChange={setOnion}
            onDurationChange={p.updateFrameDuration}
          />
        </div>

        <aside className="side-col">
          <div className="tabs" role="tablist" aria-label="Paneles de edición">
            <button
              role="tab"
              className={"tab" + (sideTab === "palette" ? " active" : "")}
              aria-selected={sideTab === "palette"}
              onClick={() => setSideTab("palette")}
            >
              Paleta
            </button>
            <button
              role="tab"
              className={"tab" + (sideTab === "layers" ? " active" : "")}
              aria-selected={sideTab === "layers"}
              onClick={() => setSideTab("layers")}
            >
              Capas
            </button>
          </div>

          {sideTab === "palette" && (
            <Palette
              palette={project.palette}
              currentColor={currentColor}
              onSelect={selectColor}
              onEdit={p.setPaletteColor}
              onReset={p.resetPalette}
              isCustom={isCustomPalette}
              onApplyPreset={handleApplyPreset}
              history={colorHistory}
              onHistorySelect={selectColor}
            />
          )}

          {sideTab === "layers" && (
            <LayersPanel
              frame={activeFrame}
              activeLayer={project.activeLayer}
              palette={project.palette}
              onSelect={p.setActiveLayer}
              onAdd={p.addLayer}
              onRemove={p.removeLayer}
              onUpdate={(patch, i) => p.updateLayerAt(patch, i)}
              onMove={(dir) => p.moveLayer(dir)}
            />
          )}

          <Preview project={{ ...project, playing, playingFps: fps }} scale={scale} />

          <CodeOutput
            project={project}
            name={name}
            emoji={emoji}
            onNameChange={setName}
            onEmojiChange={setEmoji}
            selection={selection}
          />

          <ExportImport
            project={project}
            name={name}
            scale={scale}
            fps={fps}
            onScaleChange={setScale}
            onLoadJson={handleLoadJson}
            onImportSprite={handleImportSprite}
            onImportImage={handleImportImage}
            selection={selection}
          />
        </aside>
      </div>

      <div className="status-bar">
        <span className="status-msg">{status || "Listo."}</span>
        <span className="status-spacer" />
        <span className="status-seg">{hoverCell ? `${hoverCell.x}, ${hoverCell.y}` : "—"}</span>
        <span className="status-seg">
          {project.width}×{project.height}
        </span>
        <span className="status-seg">capa: {activeFrame.layers[project.activeLayer]?.name ?? "—"}</span>
        <span className="status-seg">capas: {activeFrame.layers.length}</span>
        <span className="status-seg">
          frame {project.activeFrame + 1}/{project.frames.length}
        </span>
        <span className="status-seg">frames: {project.frames.length}</span>
        <span className="status-seg">{Math.round(zoom * 100)}%</span>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}