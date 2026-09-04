import { useEffect } from "react";

export default function GuideModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Guía de uso">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Guía de uso</h2>
          <button className="btn mini" onClick={onClose} aria-label="Cerrar guía">
            ✕
          </button>
        </div>

        <div className="help-guide">
          <h3>Empezar</h3>
          <p>Elegí un color en la Paleta, elegí una herramienta y pintá con clic o arrastrando. Borrás con el botón derecho o la barra espaciadora. El trabajo se guarda solo.</p>

          <h3>Herramientas</h3>
          <p>
            Pincel (pinta por clic) · Borrador (deja transparente) · Relleno (pinta toda la zona del
            mismo color) · Cuentagotas (copia el color tocado) · Línea, Rectángulo y Elipse (clic +
            arrastrar; "Relleno formas" los pinta por dentro) · Selección (para mover, copiar o
            cortar).
          </p>

          <h3>Simetría y snap</h3>
          <p>
            <b>Simetría (M)</b>: pintás de un lado y se duplica como espejo del otro. <b>Snap
            (Alt+S)</b>: alinea las figuras a una cuadrícula gruesa (x2, x4, x8) para que queden
            prolijas.
          </p>

          <h3>Capas</h3>
          <p>
            Hojas transparentes apiladas. En la pestaña Capas: agregá con +, ocultá con el ojo,
            ajustá la opacidad y el blend mode (cómo se mezcla con las capas de abajo), y cambiá el
            orden con las flechas.
          </p>

          <h3>Frames y animación</h3>
          <p>
            Cada frame es un dibujo de tu animación. Agregá (+), duplicá o borrá desde la línea de
            tiempo, y recorrelos arrastrando o con las flechas del teclado. Cada frame tiene su
            duración en ms (debajo de la miniatura). El <b>onion skin (O)</b> muestra el frame
            anterior como fantasma para alinear el siguiente. Reproducí con el botón de play.
          </p>

          <h3>Paleta</h3>
          <p>
            Tocá un cuadradito para elegir el color; el que tiene punto es transparente. Editás un
            color seleccionándolo y usando el selector junto a la muestra. Arriba hay paletas
            clásicas listas (Pico-8, C64, Grayscale, Sweetie-16, DB32). Debajo, el historial de los
            últimos 10 colores usados.
          </p>

          <h3>Selección</h3>
          <p>
            Arrastrá con la herramienta Selección, movela, y usá Ctrl+C/X/V para copiar, cortar y
            pegar (hasta en otro frame). Shift + arrastrar agranda la selección y Ctrl+A elige todo.
            Con un área seleccionada, el código, PNG y SVG salen recortados de esa zona.
          </p>

          <h3>Exportar e importar</h3>
          <p>
            En el panel Exportar / Importar: PNG del frame, sprite-sheet (todos los frames en tira),
            SVG vectorial, GIF animado (con velocidad), JSON del proyecto y un link de Compartir con
            el proyecto adentro. Importás imágenes, archivos JSON o sprites pegados.
          </p>

          <h3>Tema y código</h3>
          <p>
            El botón de sol/luna (o la tecla D) cambia entre tema claro y oscuro. El panel Código
            JS genera la línea de código del sprite para pegar en tus proyectos.
          </p>

          <h3>Problemas comunes</h3>
          <p>
            El dibujo se guarda solo en el navegador (misma computadora). El GIF puede tardar en
            proyectos grandes. El link compartido puede ser largo; para proyectos enormes guardá el
            JSON. Ctrl+Z deshace casi todo.
          </p>
        </div>
      </div>
    </div>
  );
}