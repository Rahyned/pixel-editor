# 🧷 Pixel Sprite Editor

Editor de sprites pixel art en React + Vite. Pintá, espejá, importá, exportá PNG y generá código JS listo para pegar en tus proyectos.

## ✨ Funcionalidades

- **Pintado** con click / arrastre, **click derecho o espacio** para borrar
- **Zoom** con la rueda del mouse sobre el canvas
- **Tamaños** 16 / 32 / 48 / 64 px
- **Undo / Redo** (Ctrl+Z / Ctrl+Y + botones)
- **Espejo** horizontal y vertical para figuras simétricas
- **Importar** sprites existentes pegando el array `P([...])`
- **Exportar PNG** con escala configurable
- **Guardado automático** del borrador en LocalStorage
- **Generador de código** que emite `export const X = P([...])`
- Atajos de teclado: `1-9` eligen color, `Space` borrador

## 🚀 Ejecutar

```bash
npm install
npm run dev      # http://localhost:5174
```

## 🏗️ Build

```bash
npm run build    # genera dist/
npm run preview  # previsualiza el build
```

## 📦 Deploy

GitHub Actions (`/.github/workflows/deploy.yml`) publica `dist/` automáticamente en GitHub Pages al hacer push a `main`.

URL: https://rahyned.github.io/pixel-editor/

## 🎨 Paleta

Misma paleta que el portafolio (`src/sprites/palette.js`):

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

© 2026 Lautaro | Diseño & código custom