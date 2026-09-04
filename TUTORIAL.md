# Guía de uso - Pixel Sprite Editor

Guía práctica y sencilla para aprovechar todas las funciones del editor. No hace falta saber programar: cada sección explica paso a paso qué hacer.

---

## Arranque rápido

1. Abrí el editor.
2. Elegí un color en la **Paleta** tocando uno de los cuadraditos.
3. Elegí una herramienta en la **barra superior** (el lápiz está seleccionado por defecto).
4. **Pintá** con un clic, o mantené presionado y arrastrá para pintar varias celdas seguidas.
5. **Borrá** con el botón derecho del mouse o con la tecla `Espacio`.
6. Tu trabajo se **guarda solo** en el navegador: podés cerrar y volver cuando quieras.

## La interfaz, de un vistazo

- **Arriba**: barra de herramientas (lápices, formas, transformaciones, simetría, snap).
- **Centro**: el **lienzo**, donde dibujás.
- **Abajo**: la **línea de tiempo** con los frames (fotogramas) de tu animación.
- **Derecha**: pestañas **Paleta** y **Capas**, más los paneles **Vista previa**, **Código** y **Exportar / Importar** (se abren tocando su título).

---

## Herramientas de dibujo

### Pincel
Dibuja un píxel por clic. Mantené el clic y arrastrá para pintar en línea.

### Borrador
Deja los píxeles transparentes. También funciona con el botón derecho del mouse o la tecla `Espacio`.

### Relleno
Tocá una zona: se pinta todo el espacio conectado del mismo color con el color elegido.

### Cuentagotas
Tocá un píxel del dibujo y se copia su color al color actual. Ideal para reutilizar un color ya usado.

### Línea, Rectángulo, Elipse
1. Hacé clic donde empieza la figura y arrastrá hasta donde termina.
2. Soltá para fijarla.
3. En rectángulo y elipse podés activar **"Relleno formas"** en la barra para que queden pintadas por dentro.

### Selección
Marcá un área para moverla, copiarla, cortarla o pegarla (ver sección "Selección").

## Zoom y grilla

- **Rueda del mouse**: acerca y aleja.
- Botones **- / + / ajustar**: alejar, acercar, o ajustar el dibujo al panel.
- En pantalla táctil, usá **dos dedos** para hacer zoom.
- El botón **#** (junto al zoom) muestra u oculta la grilla de píxeles.

## Simetría vertical

Dibuja las dos mitades a la vez, como un espejo.

1. Tocá **"Simetría"** en la barra o apretá la tecla `M`.
2. Se marca una línea punteada en el medio del lienzo.
3. Pintá de un lado y se **duplica automáticamente del otro**.
4. Funciona con pincel, borrador, línea, rectángulo y elipse. Apretá `M` para apagarla.

## Snap a grilla

Sirve para que las figuras queden alineadas a una cuadrícula más grande.

1. Tocá **"Snap"** en la barra y elegí el paso: **x2, x4 o x8**.
2. Dibujá una línea o forma: los extremos se encajan a la cuadrícula.
3. Atajo: `Alt+S` para prenderlo o apagarlo.

## Capas

Las capas son como hojas transparentes apiladas: lo que dibujás en una se ve sobre las demás.

- En la pestaña **Capas**, tocá **+** para agregar una capa y tocá una capa para trabajar sobre ella.
- El botón del **ojo** muestra u oculta la capa.
- La barrita de **opacidad** hace la capa más o menos transparente.
- El menú de **blend mode** cambia cómo se mezclan los colores de la capa con las de abajo (Multiplicar, Pantalla, Superponer, Oscurecer, Aclarar, Sobreexponer). Probalos y mirá el efecto en el lienzo.
- Las flechas **arriba/abajo** cambian el orden: las capas de arriba tapan a las de abajo.

> Consejo: usá una capa para el contorno, otra para el relleno y otra para las sombras. Es más fácil corregir.

## Frames (animación)

Un frame es un fotograma: cada dibujo de tu animación. La línea de tiempo de abajo los muestra como miniaturas.

### Crear y organizar
- **+** agrega un frame vacío.
- **Duplicar** copia el frame actual (ideal para animar copiando y modificando).
- **-** borra el frame actual.
- Las flechas **izquierda/derecha** del teclado cambian de frame, o arrastrá el mouse/dedo sobre las miniaturas para recorrerlos rápido.

### Duración de cada frame
Debajo de cada miniatura hay un número (en milisegundos). Define cuánto dura ese frame:
- Un valor bajo (50) = pasa rápido.
- Un valor alto (200) = queda más tiempo en pantalla.
- Si no lo tocás, todos usan la velocidad global (fps).

### Onion skin
Muestra el frame anterior como un fantasma para que alinees el siguiente.

1. Abrí el panel **Onion skin** en la línea de tiempo.
2. Activá el interruptor y elegí **Prev** (solo el anterior) o **Prev + Next** (ambos).
3. La barrita de porcentaje controla qué tan visible está el fantasma.
4. Atajos: `O` prende y apaga, `Ctrl+Shift+O` cambia el modo.

### Reproducir
Tocá **Reproducir** para ver la animación en loop. La barrita de fps cambia la velocidad global (para frames sin duración propia).

## Paleta y colores

### Elegir y editar
- Tocá un cuadradito para elegir el color.
- El cuadradito con punto es el color **transparente** (para borrar).
- Para **cambiar un color**: seleccionalo y tocá el selector de color junto a la muestra grande.
- Teclas `1` a `9` eligen los primeros nueve colores.

### Paletas listas
En el panel de Paleta, el menú superior tiene paletas clásicas: **Pico-8, C64, Grayscale, Sweetie-16 y DB32**. Elegí una y se carga al instante. Si no te gusta, tocá **restaurar** o `Ctrl+Z` para deshacer.

### Historial de colores
Debajo de la paleta aparecen los **últimos 10 colores** usados. Tocá uno para volver a usarlo.

## Selección (mover, copiar, cortar)

1. Elegí la herramienta **Selección** y arrastrá un rectángulo sobre la zona.
2. Con el área marcada:
   - Arrastrala para moverla.
   - `Ctrl+C` copia, `Ctrl+X` corta, `Ctrl+V` pega (podés pegar en otro frame).
   - `Supr` borra lo seleccionado, `Esc` cancela.
3. **Shift + arrastrar** agranda la selección sumando la zona nueva.
4. `Ctrl+A` selecciona todo el lienzo.
5. Con un área seleccionada, el código, el PNG y el SVG se generan solo de esa parte recortada.

## Guardar y exportar

Abrí el panel **Exportar / Importar** (a la derecha, tocando el título).

- **PNG frame**: descarga el frame actual como imagen.
- **Sprite-sheet**: descarga todos los frames en una tira horizontal.
- **SVG**: descarga el dibujo como imagen vectorial (se agranda sin pixelarse).
- **Export GIF**: descarga la animación como GIF. Elegí la velocidad: 0.5x lento, 1x normal, 2x rápido.
- **Guardar JSON**: guarda el proyecto completo (frames, capas y paleta) como archivo.
- **Compartir proyecto**: copia un link con tu proyecto adentro. Cualquiera que lo abra lo ve y lo puede editar.

**Escala de exportación**: el número "Escala" define el tamaño en píxeles de cada píxel dibujado (16 = cada píxel se ve de 16 x 16 px).

## Importar

En el mismo panel:
- **Imagen (PNG/JPG)**: subí una imagen y el editor la convierte a pixel art. Si tiene varias figuras separadas, te deja elegir cuál importar y ajusta el lienzo a su proporción.
- **Cargar proyecto JSON**: abre un archivo guardado antes.
- **Importar sprite**: pegá código tipo `["....KK....", ...]` y se dibuja en la capa activa.

## Generar código JS

El panel **Código JS** arma la línea para usar el sprite en tus proyectos:

1. Poné un **Nombre** (ej: `MUNECO`) y opcionalmente un emoji.
2. Tocá **Copiar** y pegalo en tu código.

Queda algo así:

```js
export const MUNECO = P(["...", "..."]);
```

Si usás colores personalizados, te avisa con un comentario en el código.

## Tema claro / oscuro

Tocá el botón de sol/luna arriba a la derecha, o la tecla `D`. El editor recuerda tu elección y, si nunca elegiste, usa el tema de tu sistema.

---

## Problemas comunes

- **Se perdió mi dibujo al recargar**: el editor guarda automáticamente en el navegador. Revisá estar en la misma computadora y navegador.
- **El GIF tarda**: es normal en proyectos grandes. Mirá el porcentaje: no se traba, solo trabaja.
- **El link compartido es muy largo**: es normal. Si pasa de 2048 caracteres el editor te avisa; para proyectos enormes guardá el JSON.
- **Quiero volver atrás**: `Ctrl+Z` deshace casi todo: trazos, rellenos, cambios de paleta, capas y frames.