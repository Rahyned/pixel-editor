import { useRef } from "react";
import { exportPng, exportProjectJson, exportSpriteSheet, exportSvg } from "../lib/export.js";

export default function ExportImport({
  project,
  name,
  scale,
  onScaleChange,
  onLoadJson,
  onImportSprite,
}) {
  const jsonInput = useRef(null);
  const spriteText = useRef(null);

  return (
    <div className="panel export-panel">
      <h2>Exportar / Importar</h2>

      <div className="export-buttons">
        <button className="btn ok" onClick={() => exportPng(project, scale, name)}>
          🖼 PNG frame
        </button>
        <button className="btn ok" onClick={() => exportSpriteSheet(project, scale, name)}>
          🎞 Sprite-sheet
        </button>
        <button className="btn ok" onClick={() => exportSvg(project, name)}>
          📐 SVG
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