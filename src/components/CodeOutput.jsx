import { useMemo } from "react";
import { gridToRows } from "../sprites/palette.js";

export default function CodeOutput({ size, grid, name, emoji }) {
  const code = useMemo(() => {
    const rows = gridToRows(grid, size);
    const safeName = (name || "MI_SPRITE").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    let out = "";
    if (emoji) out += `// ${emoji} `;
    out += `// ${safeName} — sprite ${size}x${size}.\n`;
    out += `export const ${safeName} = P([\n`;
    out += rows.map((r) => `  "${r}"`).join(",\n");
    out += `\n]);\n`;
    return out;
  }, [size, grid, name, emoji]);

  return (
    <div className="code-block">
      <pre id="code">{code}</pre>
    </div>
  );
}