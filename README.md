# 🧷 Pixel Sprite Editor

Editor de sprites **pixel art** en el navegador. Pintá, animá, importá y exportá sprites para tus proyectos: **PNG**, sprite-sheet, SVG, JSON y código JS listo para pegar.

🔗 **Probalo acá:** https://rahyned.github.io/pixel-editor/

---

## ✨ Características

### 🛠 Herramientas
- **Pincel** (click = pintar) · **Borrador** (click derecho o `Space`) · **Relleno** (flood fill) · **Cuentagotas** · **Línea** · **Rectángulo** · **Elipse** (con toggle relleno/contorno) · **Selección** (mover, copiar/pegar/cortar)
- Zoom con la rueda del mouse, botones `+/−`, ajuste al panel y pinch-zoom en touch
- **Grilla** on/off para ver el lienzo por píxel

### 🗂 Capas
- Añadir, eliminar, renombrar, reordenar, **ocultar/mostrar** y **opacidad por capa (0-100%)**

### 🎞 Frames animados
- Línea de tiempo: nuevo, duplicar, eliminar, reordenar
- **Preview animada** en loop con control de velocidad (fps)
- Export **sprite-sheet** (todos los frames en tira)

### ✏️ Edición
- **Lienzo rectangular**: ancho y alto separados (8 → 256) para sprites alargados
- Tamaños: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192 / 256 (conserva el contenido al cambiar)
- **Undo / Redo** completo
- **Rotar** 90° y **voltear** horizontal/vertical
- **Paleta editable**: redefiní cada color con un selector hex. Incluye escala de grises (`0-4`) y azules medios (`5-8`) para sprites oscuros/medios.
- **Selección** con portapapeles entre frames: con un área seleccionada, el código JS, PNG y SVG se generan **solo de la selección** recortada.

### 💾 Guardado y exportación
- **PNG** del frame activo · **Sprite-sheet PNG** · **SVG** vectorial
- **JSON** de proyecto completo (frames + capas + paleta) y carga
- **Importar imágenes (PNG/JPG)**: detecta figuras separadas automáticamente, deja elegir cuál importar y ajusta el lienzo a su proporción sin distorsión
- **Importar** sprites `P([...])` a la capa activa
- **Guardado automático** del borrador en LocalStorage
- **Generador de código** `export const X = P([...])` (avisa si la paleta es custom)

## ⌨️ Atajos

| Atajo | Acción |
|-------|--------|
| `?` | Abrir ayuda de atajos |
| `1-9` | Elegir color |
| `B` / `E` / `G` / `I` / `L` / `R` / `O` / `S` | Pincel / Borrador / Relleno / Cuentagotas / Línea / Rect / Elipse / Selección |
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