# Pixel Sprite Editor

Editor de sprites pixel art en React + Vite. Pintá, animá, importá y exportá sprites para tus proyectos: PNG, sprite-sheet, SVG, JSON y código JS listo para pegar.

## Funcionalidades

### Herramientas
- **Pincel** (click = pintar) · **Borrador** (click derecho o Space) · **Relleno** (flood fill) · **Cuentagotas** · **Línea** · **Rectángulo** · **Elipse** (con toggle relleno/contorno) · **Selección** (mover, copiar/pegar/cortar)
- Zoom con la rueda del mouse, botones +/− y ajuste al panel

### Capas
- Añadir, eliminar, renombrar, reordenar, **ocultar/mostrar** y **opacidad por capa (0-100%)**

### Frames animados
- Línea de tiempo: nuevo, duplicar, eliminar, reordenar
- **Preview animada** en loop con control de velocidad (fps)
- Export **sprite-sheet** (todos los frames en tira)

### Edición
- **Lienzo rectangular**: ancho y alto separados (8 → 256) para sprites alargados
- **Tamaños**: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192 / 256 (conserva el contenido al cambiar)
- **Undo / Redo** (Ctrl+Z / Ctrl+Y)
- **Rotar** 90° y **voltear** horizontal/vertical
- **Paleta editable**: redefine el color de cada clave con un selector hex. Incluye escala de grises (claves `0-4`) y azules medios (`5-8`) para sprites oscuros/medios.
- **Selección** con portapapeles entre frames (Ctrl+C/X/V, Del, Escape). Con un área seleccionada, el **código JS, PNG y SVG se generan solo de la selección** recortada.

### Guardado / Exportación
- **PNG** del frame activo · **Sprite-sheet PNG** · **SVG** vectorial
- **JSON** de proyecto completo (frames + capas + paleta) + carga
- **Importar imágenes (PNG/JPG)**: detecta figuras separadas automáticamente y deja elegir cuál importar. Al elegir una figura, **el lienzo se ajusta a su proporción** (sin distorsión) para que el dibujo no se pierda. Con opciones de recorte de bordes transparentes y ajuste.
- **Importar** sprites `P([...])` a la capa activa
- **Guardado automático** del borrador en LocalStorage
- **Generador de código** `export const X = P([...])` (avisa si la paleta es custom)

## Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `1-9` | elegir color |
| `B` / `E` / `G` / `I` / `L` / `R` / `O` / `S` | Pincel / Borrador / Relleno / Cuentagotas / Línea / Rect / Elipse / Selección |
| `Space` | Borrador |
| `Ctrl+Z` / `Ctrl+Y` | Deshacer / Rehacer |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copiar / Cortar / Pegar selección |
| `Del` | Borrar selección |
| `Esc` | Cancelar selección |

## 🚀 Ejecutar

```bash
npm install
npm run dev      # http://localhost:5174
```

## Build

```bash
npm run build    # genera dist/
npm run preview  # previsualiza el build
```

## Deploy

GitHub Actions (`/.github/workflows/deploy.yml`) publica `dist/` automáticamente en GitHub Pages al hacer push a `main`.

URL: https://rahyned.github.io/pixel-editor/

## Paleta

Paleta por defecto (editable en el editor):

| Clave | Color | | Clave | Color |
|-------|-------|-|-------|-------|
| `.` | transparente | | `N` | verde |
| `K` | negro | | `L` | verde claro |
| `W` | blanco | | `B` | azul |
| `R` | rojo | | `C` | azul claro |
| `O` | naranja | | `P` | rosa |
| `G` | dorado | | `V` | violeta |
| `Y` | amarillo | | `T` | marrón |
| `A` | cian | | `H` | marrón claro |
| `E` | gris | | `F` | gris claro |

Además incluye escala de grises (`0`-`4`) y azules medios (`5`-`8`).

## Estructura

```
src/
├── App.jsx               # layout + estado global + atajos
├── components/
│   ├── PixelCanvas.jsx   # canvas con herramientas, zoom y selección
│   ├── Toolbar.jsx       # herramientas, tamaño, transformaciones, undo
│   ├── Palette.jsx       # paleta editable
│   ├── LayersPanel.jsx   # capas + opacidad
│   ├── FramesPanel.jsx   # línea de tiempo + animación
│   ├── Preview.jsx       # preview animada
│   ├── CodeOutput.jsx    # generador de código
│   └── ExportImport.jsx  # export PNG/sheet/SVG/JSON + import
├── lib/
│   ├── palette.js        # claves de color + helpers de grilla
│   ├── composite.js      # fusión de capas con opacidad
│   ├── tools.js          # matemática de herramientas y transformaciones
│   ├── export.js         # PNG, sprite-sheet, SVG, JSON
│   └── import.js         # parseo de sprites y proyectos JSON
└── state/
    └── useProject.js     # estado + historial undo/redo
```

© 2026 Lautaro |
