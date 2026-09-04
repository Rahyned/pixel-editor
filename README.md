# 🧷 Pixel Sprite Editor

Editor de sprites **pixel art** en el navegador. Pintá, animá, importá y exportá sprites para tus proyectos: **PNG**, sprite-sheet, **GIF animado**, SVG, JSON y código JS listo para pegar.

🔗 **Probalo acá:** https://rahyned.github.io/pixel-editor/
📖 **Guía de uso paso a paso:** [TUTORIAL.md](TUTORIAL.md)

---

## ✨ Características

### 🛠 Herramientas
- **Pincel** (click = pintar) · **Borrador** (click derecho o `Space`) · **Relleno** (flood fill) · **Cuentagotas** · **Línea** · **Rectángulo** · **Elipse** (con toggle relleno/contorno) · **Selección** (mover, copiar/pegar/cortar)
- Zoom con la rueda del mouse, botones `+/−`, ajuste al panel y pinch-zoom en touch
- **Grilla** on/off para ver el lienzo por píxel
- **Snap a sub-grilla** (×2/×4/×8) para alinear figuras
- **Historial de colores**: últimos 10 colores usados, clickeables
- **Selección mejorada**: `Ctrl+A` todo, `Shift+arrastrar` une selecciones

### 🗂 Capas
- Añadir, eliminar, renombrar, reordenar, **ocultar/mostrar** y **opacidad por capa (0-100%)**
- **Blend modes por capa**: normal, multiply, screen, overlay, darken, lighten, color-dodge

### 🎞 Frames animados
- Línea de tiempo con **scrubbing** (arrastrá para navegar) y duración editable por frame
- **Duración individual por frame** (ms): cada frame puede tener su propio timing, o seguir el fps global
- **Onion skin**: frames fantasma (anterior/siguiente) a baja opacidad para animar con continuidad
- **Preview animada** en loop respetando la duración de cada frame
- Export **sprite-sheet** (todos los frames en tira)

### ✏️ Edición
- **Lienzo rectangular**: ancho y alto separados (8 → 256) para sprites alargados
- Tamaños: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192 / 256 (conserva el contenido al cambiar)
- **Undo / Redo** completo
- **Rotar** 90° y **voltear** horizontal/vertical
- **Simetría vertical**: dibujás en una mitad y se refleja automáticamente en la otra (pincel, borrador, línea, rect y elipse)
- **Paleta editable**: redefiní cada color con un selector hex. Incluye escala de grises (`0-4`) y azules medios (`5-8`) para sprites oscuros/medios.
- **Paletas preset**: Pico-8, C64, Grayscale, Sweetie-16 y DB32 en un click (1 entrada de undo)
- **Tema claro/oscuro**: toggle persistente que respeta la preferencia del sistema
- **Selección** con portapapeles entre frames: con un área seleccionada, el código JS, PNG y SVG se generan **solo de la selección** recortada.

### 💾 Guardado y exportación
- **PNG** del frame activo · **Sprite-sheet PNG** · **SVG** vectorial · **GIF animado** (con velocidad ×0.5/×1/×2)
- **JSON** de proyecto completo (frames + capas + paleta) y carga
- **Compartir por URL**: link comprimido con el proyecto embebido (lo abrís y edita al instante)
- **Importar imágenes (PNG/JPG)**: detecta figuras separadas automáticamente, deja elegir cuál importar y ajusta el lienzo a su proporción sin distorsión
- **Importar** sprites `P([...])` a la capa activa
- **Guardado automático** del borrador en LocalStorage
- **Generador de código** `export const X = P([...])` (avisa si la paleta es custom)

## ⌨️ Atajos

| Atajo | Acción |
|-------|--------|
| `?` | Abrir ayuda de atajos |
| `1-9` | Elegir color |
| `B` / `E` / `G` / `I` / `L` / `R` / `S` | Pincel / Borrador / Relleno / Cuentagotas / Línea / Rect / Selección |
| `M` | Simetría vertical on/off |
| `O` / `Ctrl+Shift+O` | Onion skin on/off / ciclar modo |
| `Alt+S` | Snap a grilla on/off |
| `Alt+B` | Ciclar blend mode de la capa |
| `Ctrl+A` / `Shift+arrastrar` | Seleccionar todo / unir selección |
| `Ctrl+G` | Exportar GIF rápido |
| `Ctrl+P` | Abrir paleta |
| `D` | Tema claro/oscuro |
| `←` / `→` | Frame anterior / siguiente |
| `Space` | Borrador |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Deshacer / Rehacer |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copiar / Cortar / Pegar selección |
| `Del` | Borrar selección |
| `Esc` | Cancelar selección / cerrar ayuda |

## 🧱 Stack

- **React** 19 + **Vite** 8
- Deploy automático a **GitHub Pages** vía GitHub Actions

---

© 2026 Lautaro · Pixel Sprite Editor