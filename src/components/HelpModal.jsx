import { useEffect } from "react";

const SHORTCUTS = [
  ["Click", "Pintar"],
  ["Click derecho", "Borrar (pincel/borrador)"],
  ["Arrastrar", "Pintar seguido"],
  ["Rueda", "Zoom"],
  ["Dos dedos (touch)", "Pinch-zoom"],
  ["1-9", "Elegir color"],
  ["Space", "Borrador"],
  ["B", "Pincel"],
  ["E", "Borrador"],
  ["G", "Relleno"],
  ["I", "Cuentagotas"],
  ["L", "Línea"],
  ["R", "Rectángulo"],
  ["S", "Selección"],
  ["M", "Simetría vertical on/off"],
  ["O", "Onion skin on/off"],
  ["Ctrl+Shift+O", "Ciclar modo onion"],
  ["Alt+S", "Snap a grilla on/off"],
  ["Alt+B", "Ciclar blend mode de la capa"],
  ["Ctrl+A", "Seleccionar todo"],
  ["Shift + arrastrar", "Unir selección"],
  ["Ctrl+G", "Exportar GIF rápido"],
  ["Ctrl+P", "Abrir paleta"],
  ["D", "Tema claro/oscuro"],
  ["← / →", "Frame anterior / siguiente"],
  ["Ctrl+Z / Ctrl+Shift+Z", "Deshacer / Rehacer"],
  ["Ctrl+C / X / V", "Copiar / Cortar / Pegar selección"],
  ["Del", "Borrar selección"],
  ["Esc", "Cancelar selección"],
];

export default function HelpModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Atajos de teclado">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Atajos</h2>
          <button className="btn mini" onClick={onClose} aria-label="Cerrar ayuda">
            ✕
          </button>
        </div>
        <table className="help-table">
          <tbody>
            {SHORTCUTS.map(([k, d]) => (
              <tr key={k}>
                <td>
                  <code>{k}</code>
                </td>
                <td>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="field-hint">
          Con un área seleccionada, el código JS, PNG y SVG se generan solo de la selección recortada.
        </p>
      </div>
    </div>
  );
}