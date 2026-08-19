import { useMemo, useState } from "react";
import { composeFrame } from "../lib/composite.js";
import { gridToRows, isDefaultPalette } from "../lib/palette.js";

export default function CodeOutput({ project, name, emoji }) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    const frame = project.frames[project.activeFrame];
    const { grid } = composeFrame(frame, project.size);
    const rows = gridToRows(grid, project.size);
    const safeName = (name || "MI_SPRITE").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    let out = "";
    if (emoji) out += `// ${emoji} `;
    out += `// ${safeName} — sprite ${project.size}x${project.size} (frame ${project.activeFrame + 1}/${project.frames.length}).\n`;
    out += `export const ${safeName} = P([\n`;
    out += rows.map((r) => `  "${r}"`).join(",\n");
    out += `\n]);\n`;
    if (!isDefaultPalette(project.palette)) {
      out += `\n// ⚠️ Paleta personalizada usada en este proyecto:\n`;
      out += `// ${JSON.stringify(project.palette)}\n`;
    }
    return out;
  }, [project, name, emoji]);

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
    <div className="panel code-panel">
      <div className="panel-head">
        <h2>Código JS</h2>
        <button className="btn mini" onClick={copy}>
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      <div className="code-block">
        <pre>{code}</pre>
      </div>
    </div>
  );
}