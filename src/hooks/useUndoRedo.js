import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo(initialState) {
  // Store history and index in a single ref to avoid stale closure issues
  const historyRef = useRef([initialState]);
  const indexRef = useRef(0);
  // Trigger re-renders manually
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate(n => n + 1);

  const state = historyRef.current[indexRef.current];

  const setState = useCallback((newState, skipHistory = false) => {
    const h = historyRef.current;
    const i = indexRef.current;
    const next = typeof newState === 'function' ? newState(h[i]) : newState;

    if (skipHistory) {
      // Mutate current snapshot in-place, no new history entry
      historyRef.current = [...h.slice(0, i), next, ...h.slice(i + 1)];
      rerender();
      return;
    }

    const trimmed = h.slice(0, i + 1);
    const newHistory = [...trimmed, next];
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    historyRef.current = newHistory;
    indexRef.current = newHistory.length - 1;
    rerender();
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      rerender();
    }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      rerender();
    }
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  return { state, setState, undo, redo, canUndo, canRedo };
}