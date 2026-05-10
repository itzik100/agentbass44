import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TRANSITIONS = [
  { id: 'none', label: 'ללא' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide-left', label: 'Slide ←' },
  { id: 'slide-right', label: 'Slide →' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'blur', label: 'Blur' },
];

export default function TransitionBadge({ transition = 'none', onChange }) {
  const [open, setOpen] = useState(false);
  const current = TRANSITIONS.find(t => t.id === transition) || TRANSITIONS[0];

  return (
    <div className="relative z-10">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="flex items-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs px-1.5 py-0.5 rounded"
        title="מעבר"
      >
        ⟶ {current.id !== 'none' ? current.label : ''}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl min-w-24 overflow-hidden">
          {TRANSITIONS.map(t => (
            <button
              key={t.id}
              onClick={e => { e.stopPropagation(); onChange(t.id); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors ${
                t.id === transition ? 'text-violet-400 bg-zinc-700/50' : 'text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}