import { useMemo, useState } from "react";
import { composeFrame } from "../lib/composite.js";
import { gridToRows, isDefaultPalette } from "../lib/palette.js";
import Collapsible from "./Collapsible.jsx";

// Recorta una región de la grilla compuesta y devuelve el array de filas.
function cropGridToRows(grid, width, region) {
  const { x, y, w, h } = region;
  const rows = [];
  for (let ry = 0; ry < h; ry++) {
    let row = "";
    for (let rx = 0; rx < w; rx++) {
      const gx = x + rx;
      const gy = y + ry;
      if (gx >= 0 && gx < width && gy * width + gx < grid.length) {
        row += grid[gy * width + gx] || ".";
      } else {
        row += ".";
      }
    }
    rows.push(row);
  }
  return rows;
}

export default function CodeOutput({ project, name, emoji, onNameChange, onEmojiChange, selection }) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    const frame = project.frames[project.activeFrame];
    const { width, height } = project;
    const { grid } = composeFrame(frame, width, height);
    const safeName = (name || "MI_SPRITE").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const hasSelection = selection && selection.w > 0 && selection.h > 0;

    const rows = hasSelection
      ? cropGridToRows(grid, width, selection)
      : gridToRows(grid, width);

    const sw = hasSelection ? selection.w : width;
    const sh = hasSelection ? selection.h : height;

    let out = "";
    if (emoji) out += `// ${emoji} `;
    out += `// ${safeName} — sprite ${sw}x${sh}`;
    if (hasSelection) out += ` (selección del frame ${project.activeFrame + 1})`;
    out += `.\n`;
    out += `export const ${safeName} = P([\n`;
    out += rows.map((r) => `  "${r}"`).join(",\n");
    out += `\n]);\n`;
    if (!isDefaultPalette(project.palette)) {
      out += `\n// ⚠️ Paleta personalizada usada en este proyecto:\n`;
      out += `// ${JSON.stringify(project.palette)}\n`;
    }
    return out;
  }, [project, name, emoji, selection]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard no disponible */
    }
  };

  return (
    <Collapsible
      title="Código JS"
      badge={selection ? "selección" : undefined}
      actions={
        <button className="btn mini" onClick={copy}>
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      }
    >
      <div className="code-fields">
        <div className="field">
          <label htmlFor="spriteName">Nombre</label>
          <input
            id="spriteName"
            value={name}
            spellCheck={false}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="spriteEmoji">Emoji</label>
          <input
            id="spriteEmoji"
            value={emoji}
            maxLength={4}
            placeholder="⭐"
            style={{ maxWidth: 80 }}
            onChange={(e) => onEmojiChange(e.target.value)}
          />
        </div>
      </div>
      <div className="code-block">
        <pre>{code}</pre>
      </div>
    </Collapsible>
  );
}