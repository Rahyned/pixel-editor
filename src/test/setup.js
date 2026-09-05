import "@testing-library/jest-dom/vitest";

const noop = () => {};

// Mock de contexto 2D: cualquier método es no-op, getImageData devuelve
// píxeles transparentes. jsdom no implementa canvas.
function createCtxMock() {
  const ctx = {
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    measureText: () => ({ width: 0 }),
  };
  return new Proxy(ctx, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return noop;
    },
    set() {
      return true;
    },
  });
}

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value() {
    return createCtxMock();
  },
  configurable: true,
  writable: true,
});

// El canvas del editor mapea celdas con rect.width/CELL: devolvemos el
// tamaño del atributo (width = celdas * CELL) para que cellFromEvent calcule.
Object.defineProperty(HTMLCanvasElement.prototype, "getBoundingClientRect", {
  value() {
    const w = this.width || 0;
    const h = this.height || 0;
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: w,
      bottom: h,
      width: w,
      height: h,
      toJSON: () => ({}),
    };
  },
  configurable: true,
  writable: true,
});

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  });
}

if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:mock";
  URL.revokeObjectURL = noop;
}

// jsdom no implementa pointer capture
Element.prototype.setPointerCapture = noop;
Element.prototype.releasePointerCapture = noop;

// jsdom no implementa elementFromPoint (se puede sobreescribir por test)
document.elementFromPoint = () => null;