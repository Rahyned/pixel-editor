import { useState, useCallback, useEffect } from "react";
import { PX } from "./sprites/palette.js";
import { useSprite } from "./hooks/useSprite.js";
import PixelCanvas from "./components/PixelCanvas.jsx";
import Palette from "./components/Palette.jsx";
import Preview from "./components/Preview.jsx";
import CodeOutput from "./components/CodeOutput.jsx";
import Toolbar from "./components/Toolbar.jsx";
import "./styles.css";

const KEY = "pixel-editor.sprite";

export default function App() {
  const [size, setSize] = useState(16);
  const [currentColor, setCurrentColor] = useState("K");
  const [name, setName] = useState("MI_SPRITE");
  const [emoji, setEmoji] = useState("");
  const [scale, setScale] = useState(16);
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState("Listo. Elegí un color y pintá.");

  const sprite = useSprite({ size, storageKey: `${KEY}.${size}` });
  const { grid, history, future } = sprite;

  // Al cambiar de tamaño, limpiar
  const handleSizeChange = useCallback(
    (next) => {
      setSize(next);
      setStatus(`Tamaño cambiado a ${next}×${next}.`);
    },
    []
  );

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const map = { 1: "K", 2: "W", 3: "R", 4: "O", 5: "G", 6: "Y", 7: "N", 8: "L", 9: "B" };
      if (map[e.key]) {
        setCurrentColor(map[e.key]);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setCurrentColor(".");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) sprite.redo();
        else sprite.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        sprite.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sprite]);

  const exportPng = useCallback(() => {
    const out = document.createElement("canvas");
    const s = scale;
    out.width = size * s;
    out.height = size * s;
    const ctx = out.getContext("2d");
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const col = grid[y * size + x];
        if (col && col !== ".") {
          ctx.fillStyle = PX[col];
          ctx.fillRect(x * s, y * s, s, s);
        }
      }
    }
    const a = document.createElement("a");
    a.download = (name || "sprite").toLowerCase().replace(/[^a-z0-9_]/g, "_") + ".png";
    a.href = out.toDataURL("image/png");
    a.click();
    setStatus(`PNG exportado (${out.width}×${out.height}).`);
  }, [grid, size, scale, name]);

  const importSprite = useCallback(() => {
    const text = importText.trim();
    if (!text) {
      setStatus("Pegá antes un array de sprite.");
      return;
    }
    const m = text.match(/\[([\s\S]*?)\]/);
    if (!m) {
      setStatus("✗ No encontré el array de filas [ ... ].");
      return;
    }
    const inner = m[1];
    const re = /"([^"]*)"/g;
    const strings = [];
    let match;
    while ((match = re.exec(inner)) !== null) {
      const s = match[1];
      if (s.length === size) strings.push(s);
    }
    if (strings.length === 0) {
      const re2 = /'([^']*)'/g;
      while ((match = re2.exec(inner)) !== null) {
        const s = match[1];
        if (s.length === size) strings.push(s);
      }
    }
    if (strings.length !== size) {
      setStatus(`✗ Necesito ${size} filas de ${size} chars (obtuve ${strings.length}).`);
      return;
    }
    const valid = new Set(Object.keys(PX));
    for (const row of strings) {
      for (const ch of row) {
        if (!valid.has(ch)) {
          setStatus(`✗ Carácter inválido: '${ch}'. ¿Es de la paleta?`);
          return;
        }
      }
    }
    sprite.importRows(strings);
    setStatus(
      "✓ Sprite importado (" +
        strings.flat().filter((c) => c !== ".").length +
        " px)."
    );
  }, [importText, size, sprite]);

  return (
    <div className="app">
      <h1>🧷 Pixel Sprite Editor</h1>
      <p className="help">
        Pintá un sprite para tus proyectos. <b>Click</b> = pintar · <b>click derecho</b> = borrar ·
        <b>arrastrar</b> = pintar seguido · <b>rueda</b> = zoom. El botón <b>Exportar PNG</b> descarga la
        imagen, y <b>Generar código</b> emite el array JS listo para pegar en tu proyecto.
      </p>

      <div className="layout">
        <div className="panel">
          <h2>1 · Editor</h2>
          <div id="editorWrap">
            <PixelCanvas
              size={size}
              grid={grid}
              currentColor={currentColor}
              onPaintLine={sprite.paintLine}
            />
          </div>
          <div className="editor-actions">
            <button className="btn ok" onClick={exportPng}>
              🖼 Exportar PNG
            </button>
          </div>
          <div id="status">{status}</div>
        </div>

        <div className="panel">
          <h2>2 · Paleta &amp; config</h2>
          <Palette currentColor={currentColor} onSelect={setCurrentColor} />

          <div style={{ height: 16 }} />

          <Toolbar
            size={size}
            onSizeChange={handleSizeChange}
            onClear={sprite.clear}
            onMirrorH={() => sprite.mirror(false)}
            onMirrorV={() => sprite.mirror(true)}
            onUndo={sprite.undo}
            onRedo={sprite.redo}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
          />

          <div className="field">
            <label>Nombre de la variable / clave</label>
            <input value={name} spellCheck={false} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Emoji de preview (opcional)</label>
            <input
              value={emoji}
              maxLength={4}
              placeholder="p. ej. ⭐"
              style={{ maxWidth: 80 }}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Escala de export/preview grande (px)</label>
            <input
              type="number"
              value={scale}
              min={8}
              max={64}
              step={2}
              style={{ maxWidth: 90 }}
              onChange={(e) => setScale(Number(e.target.value) || 16)}
            />
          </div>

          <div style={{ height: 16, borderBottom: "1px solid var(--border)", margin: "16px 0" }} />
          <h2>Importar sprite existente</h2>
          <p className="help" style={{ marginTop: 0 }}>
            Pegá el array <code>P([...])</code> de un sprite para editarlo sin redibujarlo.
          </p>
          <textarea
            rows={4}
            spellCheck={false}
            placeholder='Pega acá: ["................", "....KK....KK....", ...]'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="editor-actions">
            <button className="btn secondary" onClick={importSprite}>
              ⬆ Cargar en editor
            </button>
          </div>
        </div>

        <div className="panel">
          <h2>3 · Vista previa &amp; código</h2>
          <Preview size={size} grid={grid} scale={scale} />
          <div style={{ height: 12 }} />
          <CodeOutput size={size} grid={grid} name={name} emoji={emoji} />
        </div>
      </div>

      <div className="status-bar">
        <span>
          <span className="ico">◼</span> izq pintar
        </span>
        <span>
          <span className="ico">◻</span> der borrar
        </span>
        <span>
          <span className="ico">⌨</span> 1-9 elegir color
        </span>
        <span>
          <span className="ico">Space</span> borrador
        </span>
        <span>
          <span className="ico">⎇</span> Ctrl+Z/Y undo/redo
        </span>
      </div>
    </div>
  );
}