import React, { useState } from 'react';
import { Scissors, Type, Undo2, Redo2, Download, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportModal from './ExportModal';

export default function Toolbar({ onAddText, onSplit, selectedClip, tracks, textOverlays, duration, onUndo, onRedo, canUndo, canRedo }) {
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2 mr-4">
          <Film className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-lg tracking-tight text-white">Studio</span>
        </div>
        <div className="w-px h-6 bg-zinc-700 mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onSplit}
          disabled={!selectedClip || selectedClip.trackType === 'text'}
          className="text-zinc-300 hover:text-white hover:bg-zinc-700 gap-1.5"
          title="חתוך קליפ בנקודת הנגן"
        >
          <Scissors className="w-4 h-4" />
          <span>חתוך</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddText}
          className="text-zinc-300 hover:text-white hover:bg-zinc-700 gap-1.5"
          title="הוסף טקסט"
        >
          <Type className="w-4 h-4" />
          <span>טקסט</span>
        </Button>
        <div className="w-px h-6 bg-zinc-700 mx-2" />
        <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30" title="בטל (Cmd+Z)">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-30" title="חזור (Cmd+Shift+Z)">
          <Redo2 className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
          onClick={() => setShowExport(true)}
        >
          <Download className="w-4 h-4" />
          ייצא / שתף
        </Button>
      </div>

      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          tracks={tracks}
          textOverlays={textOverlays}
          duration={duration}
        />
      )}
    </>
  );
}