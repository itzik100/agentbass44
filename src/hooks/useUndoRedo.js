import { useState, useCallback, useRef } from 'react';

export function useUndoRedo(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const skipRef = useRef(false);

  const state = history[index];

  const setState = useCallback((newState, skipHistory = false) => {
    if (skipHistory) {
      setHistory(h => {
        const copy = [...h];
        copy[index] = typeof newState === 'function' ? newState(copy[index]) : newState;
        return copy;
      });
      return;
    }
    setHistory(h => {
      const next = typeof newState === 'function' ? newState(h[index]) : newState;
      const trimmed = h.slice(0, index + 1);
      return [...trimmed, next].slice(-50); // max 50 history steps
    });
    setIndex(i => Math.min(i + 1, 49));
  }, [index]);

  const undo = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex(i => Math.min(history.length - 1, i + 1));
  }, [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { state, setState, undo, redo, canUndo, canRedo };
}