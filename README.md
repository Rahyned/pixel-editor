# Pixel Sprite Editor

**Editor de sprites pixel art con animación que funciona en el navegador, sin instalar nada ni crear una cuenta.**

🔗 **Demo:** https://rahyned.github.io/pixel-editor/ · 📖 **Guía de uso:** [TUTORIAL.md](TUTORIAL.md)

## El problema

Crear y animar sprites para proyectos propios sin instalar un editor pesado ni registrarse en un servicio.

## Qué hace

- **Herramientas:** pincel, borrador, relleno, cuentagotas, línea, rectángulo, elipse y selección con copiar, cortar y pegar entre frames.
- **Capas:** visibilidad, opacidad y modos de fusión (multiply, screen, overlay y otros).
- **Animación:** línea de tiempo, duración por frame, onion skin y vista previa en loop.
- **Edición:** lienzo de 8 a 256 px de ancho y alto, rotación, espejado, simetría vertical, paletas preset (Pico-8, C64, Sweetie-16, DB32 y otras) y tema claro/oscuro.
- **Importar:** imágenes PNG/JPG con detección de figuras separadas.
- **Exportar:** PNG, sprite-sheet, GIF animado, SVG, JSON del proyecto, código JS listo para pegar y un link para compartir con el proyecto incluido.
- **Guardado automático** en el navegador. Atajos de teclado para todo (`?` muestra la ayuda).

## Stack

React 19 · Vite 8 · gifenc · pako · Vitest · Playwright · GitHub Actions + GitHub Pages.

## Calidad

Cada push a `main` corre lint, tests unitarios y E2E, y solo despliega si todo pasa.

```bash
npm install
npm run dev
npm run test:all   # unitarios (Vitest) + E2E (Playwright)
```

## Estado

Completado (septiembre 2026) y desplegado en GitHub Pages.

## Autor

Lautaro Rodríguez · [GitHub](https://github.com/Rahyned) · © 2026
