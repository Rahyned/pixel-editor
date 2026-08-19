import { useRef, useState } from "react";
import {
  exportPng,
  exportPngSelection,
  exportProjectJson,
  exportSpriteSheet,
  exportSvg,
  exportSvgSelection,
} from "../lib/export.js";
import { loadImageFromFile, detectSprites } from "../lib/import.js";

export default function ExportImport({
  project,
  name,
  scale,
  onScaleChange,
  onLoadJson,
  onImportSprite,
  onImportImage,
  selection,
}) {
  const jsonInput = useRef(null);
  const spriteText = useRef(null);
  const pngInput = useRef(null);
  const [exactColors, setExactColors] = useState(false);
  const [autoCrop, setAutoCrop] = useState(true);
  const [sprites, setSprites] = useState([]);
  const [selectedSprite, setSelectedSprite] = useState(-1);
  const [currentImage, setCurrentImage] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const img = await loadImageFromFile(f);
      const det = detectSprites(img);
      setCurrentImage(img);
      if (det.length > 1) {
        setSprites(det);
        setSelectedSprite(0);
      } else {
        // una sola figura: importar directo
        onImportImage(img, exactColors, autoCrop, null);
        setSprites([]);
      }
    } catch {
      onImportImage(null, exactColors, autoCrop, null);
      setSprites([]);
    }
    e.target.value = "";
  };

  const importSelected = () => {
    if (!currentImage) return;
    const region = selectedSprite === -1 ? null : sprites[selectedSprite];
    onImportImage(currentImage, exactColors, autoCrop, region);
    setSprites([]);
  };

  return (
    <div className="panel export-panel">
      <h2>Exportar / Importar</h2>

      <div className="export-buttons">
        <button
          className="btn ok"
          onClick={() =>
            selection && selection.w > 0
              ? exportPngSelection(project, scale, name, selection)
              : exportPng(project, scale, name)
          }
        >
          🖼 {selection && selection.w > 0 ? "PNG selección" : "PNG frame"}
        </button>
        <button className="btn ok" onClick={() => exportSpriteSheet(project, scale, name)}>
          🎞 Sprite-sheet
        </button>
        <button
          className="btn ok"
          onClick={() =>
            selection && selection.w > 0
              ? exportSvgSelection(project, name, selection)
              : exportSvg(project, name)
          }
        >
          📐 {selection && selection.w > 0 ? "SVG selección" : "SVG"}
        </button>
        <button className="btn ok" onClick={() => exportProjectJson(project, name)}>
          💾 Guardar JSON
        </button>
      </div>

      <div className="field">
        <label>Escala de exportación (px por píxel)</label>
        <input
          type="number"
          value={scale}
          min="1"
          max="64"
          step="1"
          onChange={(e) => onScaleChange(Number(e.target.value) || 8)}
        />
      </div>

      <div className="divider" />

      <h3>Importar imagen (PNG / JPG)</h3>
      <p className="field-hint">
        Detecta figuras separadas automáticamente. Al elegir una figura, el lienzo se ajusta a su
        proporción (sin distorsión). También podés importar el conjunto completo.
      </p>
      <label className="check-row">
        <input type="checkbox" checked={exactColors} onChange={(e) => setExactColors(e.target.checked)} />
        Usar colores de la paleta más cercanos
      </label>
      <label className="check-row">
        <input type="checkbox" checked={autoCrop} onChange={(e) => setAutoCrop(e.target.checked)} />
        Recortar bordes transparentes y ajustar
      </label>
      <input
        ref={pngInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
      />

      {sprites.length > 0 && (
        <div className="sprite-picker">
          <label>Figuras detectadas ({sprites.length})</label>
          <select value={selectedSprite} onChange={(e) => setSelectedSprite(Number(e.target.value))}>
            {sprites.map((s, i) => (
              <option key={i} value={i}>
                {s.name} ({s.w}×{s.h})
              </option>
            ))}
            <option value={-1}>Conjunto completo</option>
          </select>
          <button className="btn ok" onClick={importSelected}>
            ⬆ Importar {selectedSprite === -1 ? "todo" : sprites[selectedSprite]?.name.toLowerCase()}
          </button>
        </div>
      )}

      <div className="divider" />

      <h3>Cargar proyecto JSON</h3>
      <input
        ref={jsonInput}
        type="file"
        accept=".json,application/json"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          f.text().then((t) => onLoadJson(t));
          e.target.value = "";
        }}
      />

      <div className="divider" />

      <h3>Importar sprite P([...])</h3>
      <textarea
        ref={spriteText}
        rows={4}
        spellCheck={false}
        placeholder='Pega acá: ["................", "....KK....KK....", ...]'
      />
      <div className="editor-actions">
        <button
          className="btn secondary"
          onClick={() => {
            onImportSprite(spriteText.current?.value || "");
            if (spriteText.current) spriteText.current.value = "";
          }}
        >
          ⬆ Cargar en capa activa
        </button>
      </div>
    </div>
  );
}