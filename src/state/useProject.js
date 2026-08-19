import { useCallback, useRef, useState } from "react";
import { clonePalette, DEFAULT_PALETTE } from "../lib/palette.js";
import { resizeGrid } from "../lib/tools.js";

const MAX_HISTORY = 60;
const SIZES = [8, 16, 24, 32, 48, 64];

function emptyGrid(size) {
  return Array(size * size).fill(".");
}

function makeLayer(size, name) {
  return { name, visible: true, opacity: 1, grid: emptyGrid(size) };
}

function makeFrame(size) {
  return { layers: [makeLayer(size, "Capa 1")] };
}

function makeProject(size) {
  return {
    size,
    palette: clonePalette(DEFAULT_PALETTE),
    frames: [makeFrame(size)],
    activeFrame: 0,
    activeLayer: 0,
  };
}

// Reemplaza la grilla de la capa activa (inmutable).
function withActiveLayerGrid(project, fn) {
  const frame = project.frames[project.activeFrame];
  const layers = frame.layers.map((l, i) =>
    i === project.activeLayer ? { ...l, grid: fn(l.grid) } : l
  );
  const frames = project.frames.map((f, i) =>
    i === project.activeFrame ? { ...f, layers } : f
  );
  return { ...project, frames };
}

export function useProject(initialSize = 16) {
  const [state, setState] = useState(() => ({
    project: makeProject(initialSize),
    history: [],
    future: [],
  }));

  const strokeRef = useRef(null);

  const project = state.project;
  const activeFrame = project.frames[project.activeFrame];
  const activeLayer = activeFrame.layers[project.activeLayer];

  const commit = useCallback((next, { keepHistory = false } = {}) => {
    setState((s) =>
      keepHistory
        ? { ...s, project: next }
        : {
            project: next,
            history: [...s.history.slice(-(MAX_HISTORY - 1)), s.project],
            future: [],
          }
    );
  }, []);

  // --- Stroke de pintado (agrupa drags en un solo undo) ---
  const beginStroke = useCallback(() => {
    strokeRef.current = { before: project, dirty: false };
  }, [project]);

  const paintCells = useCallback(
    (indices, value) => {
      if (!strokeRef.current) return;
      let dirty = false;
      const next = strokeRef.current.grid ? strokeRef.current.grid.slice() : activeLayer.grid.slice();
      for (const idx of indices) {
        if (idx >= 0 && idx < next.length && next[idx] !== value) {
          next[idx] = value;
          dirty = true;
        }
      }
      strokeRef.current.grid = next;
      strokeRef.current.dirty = strokeRef.current.dirty || dirty;
      if (dirty) {
        setState((s) => ({ ...s, project: withActiveLayerGrid(s.project, () => next) }));
      }
    },
    [activeLayer.grid]
  );

  const endStroke = useCallback(() => {
    if (!strokeRef.current) return;
    const { dirty, before } = strokeRef.current;
    strokeRef.current = null;
    if (dirty) {
      setState((s) => ({
        project: s.project,
        history: [...s.history.slice(-(MAX_HISTORY - 1)), before],
        future: [],
      }));
    }
  }, []);

  const abortStroke = useCallback(() => {
    strokeRef.current = null;
  }, []);

  // --- Acciones sobre la capa activa (commit inmediato) ---
  const applyGrid = useCallback(
    (fn) => {
      commit(withActiveLayerGrid(project, fn));
    },
    [project, commit]
  );

  const setCell = useCallback(
    (index, value) => {
      applyGrid((g) => {
        const next = g.slice();
        next[index] = value;
        return next;
      });
    },
    [applyGrid]
  );

  const clearLayer = useCallback(() => {
    applyGrid(() => emptyGrid(project.size));
  }, [applyGrid, project.size]);

  const transformLayer = useCallback(
    (fn) => applyGrid((g) => fn(g, project.size)),
    [applyGrid, project.size]
  );

  // --- Capas ---
  const addLayer = useCallback(() => {
    commit({
      ...project,
      frames: project.frames.map((f, fi) =>
        fi === project.activeFrame
          ? { ...f, layers: [...f.layers, makeLayer(project.size, `Capa ${f.layers.length + 1}`)] }
          : f
      ),
    });
  }, [project, commit]);

  const removeLayer = useCallback(() => {
    if (activeFrame.layers.length <= 1) return;
    const layers = activeFrame.layers.filter((_, i) => i !== project.activeLayer);
    const newActive = Math.min(project.activeLayer, layers.length - 1);
    commit({
      ...project,
      activeLayer: newActive,
      frames: project.frames.map((f, fi) =>
        fi === project.activeFrame ? { ...f, layers } : f
      ),
    });
  }, [project, commit, activeFrame]);

  const updateLayer = useCallback(
    (patch) => {
      commit({
        ...project,
        frames: project.frames.map((f, fi) =>
          fi === project.activeFrame
            ? {
                ...f,
                layers: f.layers.map((l, li) => (li === project.activeLayer ? { ...l, ...patch } : l)),
              }
            : f
        ),
      });
    },
    [project, commit]
  );

  const moveLayer = useCallback(
    (dir) => {
      const li = project.activeLayer;
      const target = li + dir;
      if (target < 0 || target >= activeFrame.layers.length) return;
      const layers = activeFrame.layers.slice();
      [layers[li], layers[target]] = [layers[target], layers[li]];
      commit({
        ...project,
        activeLayer: target,
        frames: project.frames.map((f, fi) =>
          fi === project.activeFrame ? { ...f, layers } : f
        ),
      });
    },
    [project, commit, activeFrame]
  );

  // --- Frames ---
  const addFrame = useCallback(
    (duplicate = false) => {
      const newFrame = duplicate ? JSON.parse(JSON.stringify(activeFrame)) : makeFrame(project.size);
      commit({
        ...project,
        activeFrame: project.frames.length,
        frames: [...project.frames, newFrame],
      });
    },
    [project, commit, activeFrame]
  );

  const removeFrame = useCallback(() => {
    if (project.frames.length <= 1) return;
    const frames = project.frames.filter((_, i) => i !== project.activeFrame);
    const newActive = Math.min(project.activeFrame, frames.length - 1);
    commit({ ...project, activeFrame: newActive, frames });
  }, [project, commit]);

  const moveFrame = useCallback(
    (dir) => {
      const fi = project.activeFrame;
      const target = fi + dir;
      if (target < 0 || target >= project.frames.length) return;
      const frames = project.frames.slice();
      [frames[fi], frames[target]] = [frames[target], frames[fi]];
      commit({ ...project, activeFrame: target, frames });
    },
    [project, commit]
  );

  // --- Tamaño (conserva contenido recortando/padeando desde arriba-izquierda) ---
  const setSize = useCallback(
    (size) => {
      if (size === project.size) return;
      const frames = project.frames.map((f) => ({
        ...f,
        layers: f.layers.map((l) => ({ ...l, grid: resizeGrid(l.grid, project.size, size) })),
      }));
      commit({ ...project, size, frames });
    },
    [project, commit]
  );

  // --- Paleta ---
  const setPaletteColor = useCallback(
    (key, hex) => {
      commit({ ...project, palette: { ...project.palette, [key]: hex } });
    },
    [project, commit]
  );

  const resetPalette = useCallback(() => {
    commit({ ...project, palette: clonePalette(DEFAULT_PALETTE) });
  }, [project, commit]);

  // --- Importar grilla completa al frame/capa activos ---
  const importGrid = useCallback(
    (grid) => {
      commit(withActiveLayerGrid(project, () => grid.slice()));
    },
    [project, commit]
  );

  // --- Cargar proyecto completo ---
  const loadProject = useCallback(
    (p) => {
      strokeRef.current = null;
      setState({
        project: p,
        history: [],
        future: [],
      });
    },
    []
  );

  const undo = useCallback(() => {
    if (state.history.length === 0) return;
    strokeRef.current = null;
    setState((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return {
        project: prev,
        history: s.history.slice(0, -1),
        future: [s.project, ...s.future],
      };
    });
  }, [state.history.length]);

  const redo = useCallback(() => {
    if (state.future.length === 0) return;
    strokeRef.current = null;
    setState((s) => {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      return {
        project: next,
        history: [...s.history, s.project],
        future: rest,
      };
    });
  }, [state.future.length]);

  const reset = useCallback(() => {
    strokeRef.current = null;
    setState({
      project: makeProject(project.size),
      history: [],
      future: [],
    });
  }, [project.size]);

  const setActiveFrame = useCallback(
    (i) => commit({ ...project, activeFrame: i, activeLayer: 0 }, { keepHistory: true }),
    [project, commit]
  );

  const setActiveLayer = useCallback(
    (i) => commit({ ...project, activeLayer: i }, { keepHistory: true }),
    [project, commit]
  );

  const history = state.history;
  const future = state.future;

  return {
    project,
    activeFrame,
    activeLayer,
    history,
    future,
    canUndo: state.history.length > 0,
    canRedo: state.future.length > 0,
    SIZES,
    // stroke
    beginStroke,
    paintCells,
    endStroke,
    abortStroke,
    // capa activa
    setCell,
    clearLayer,
    transformLayer,
    applyGrid,
    // capas
    addLayer,
    removeLayer,
    updateLayer,
    moveLayer,
    // frames
    addFrame,
    removeFrame,
    moveFrame,
    // global
    setSize,
    setPaletteColor,
    resetPalette,
    importGrid,
    loadProject,
    undo,
    redo,
    reset,
    setActiveFrame,
    setActiveLayer,
  };
}