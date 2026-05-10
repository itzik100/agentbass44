import { useEffect } from 'react';

export function useKeyboardShortcuts({ isPlaying, setIsPlaying, setCurrentTime, duration, onUndo, onRedo, onDelete, selectedClip, zoom, setZoom }) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      // Don't fire shortcuts when typing in input/textarea
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Space — play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }

      // J — rewind (slow)
      if (e.code === 'KeyJ') {
        e.preventDefault();
        setCurrentTime(t => Math.max(0, t - 5));
      }

      // L — forward (slow)
      if (e.code === 'KeyL') {
        e.preventDefault();
        setCurrentTime(t => Math.min(duration, t + 5));
      }

      // K — stop + go to start of selection or current
      if (e.code === 'KeyK') {
        e.preventDefault();
        setIsPlaying(false);
      }

      // Left arrow — frame back (0.1s)
      if (e.code === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCurrentTime(t => Math.max(0, t - (e.shiftKey ? 1 : 0.1)));
      }

      // Right arrow — frame forward (0.1s)
      if (e.code === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCurrentTime(t => Math.min(duration, t + (e.shiftKey ? 1 : 0.1)));
      }

      // Home — go to start
      if (e.code === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
        setIsPlaying(false);
      }

      // End — go to end
      if (e.code === 'End') {
        e.preventDefault();
        setCurrentTime(duration);
        setIsPlaying(false);
      }

      // Cmd/Ctrl + Z — undo
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }

      // Cmd/Ctrl + Shift + Z or Cmd+Y — redo
      if (((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && e.shiftKey) ||
          ((e.metaKey || e.ctrlKey) && e.code === 'KeyY')) {
        e.preventDefault();
        onRedo?.();
      }

      // Delete / Backspace — delete selected clip
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedClip) {
        e.preventDefault();
        onDelete?.();
      }

      // + / = — zoom in
      if (e.code === 'Equal' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setZoom(z => Math.min(4, z + 0.25));
      }

      // - — zoom out
      if (e.code === 'Minus' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setZoom(z => Math.max(0.25, z - 0.25));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, duration, selectedClip, zoom]);
}