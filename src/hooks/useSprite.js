import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY = 100;

export function useSprite({ size, storageKey }) {
  const makeEmpty = useCallback(() => Array(size * size).fill("."), [size]);

  const [grid, setGrid] = useState(() => makeEmpty());
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const isInitialMount = useRef(true);

  // Persistir borrador en localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved) && saved.length === grid.length) {
            setGrid(saved);
            return;
          }
        }
      } catch {
        // ignorar
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(grid));
  }, [grid, storageKey]);

  const commit = useCallback(
    (next) => {
      setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), grid]);
      setFuture([]);
      setGrid(next);
    },
    [grid]
  );

  const setCell = useCallback(
    (index, value) => {
      if (grid[index] === value) return;
      commit(grid.map((c, i) => (i === index ? value : c)));
    },
    [grid, commit]
  );

  const paintLine = useCallback(
    (cells, value) => {
      const next = grid.slice();
      let changed = false;
      for (const idx of cells) {
        if (idx >= 0 && idx < next.length && next[idx] !== value) {
          next[idx] = value;
          changed = true;
        }
      }
      if (changed) commit(next);
    },
    [grid, commit]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setFuture((f) => [grid, ...f]);
      setGrid(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, [grid]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      setHistory((h) => [...h, grid]);
      setGrid(f[0]);
      return f.slice(1);
    });
  }, [grid]);

  const clear = useCallback(() => {
    commit(makeEmpty());
  }, [commit, makeEmpty]);

  const importRows = useCallback(
    (rows) => {
      const next = Array(size * size).fill(".");
      rows.forEach((row, y) => {
        for (let x = 0; x < size && x < row.length; x++) {
          next[y * size + x] = row[x];
        }
      });
      commit(next);
    },
    [size, commit]
  );

  const mirror = useCallback(
    (horizontal) => {
      const next = grid.slice();
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const nx = horizontal ? size - 1 - x : x;
          const ny = horizontal ? y : size - 1 - y;
          next[y * size + x] = grid[ny * size + nx];
        }
      }
      commit(next);
    },
    [grid, size, commit]
  );

  return { grid, history, future, setCell, paintLine, undo, redo, clear, importRows, mirror };
}