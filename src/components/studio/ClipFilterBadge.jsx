import React, { useState } from 'react';
import { Wand2, ChevronDown } from 'lucide-react';

const CLIP_FILTERS = [
  { id: 'none', label: 'ללא' },
  { id: 'bright', label: 'בהיר' },
  { id: 'contrast', label: 'ניגודיות' },
  { id: 'grayscale', label: 'שחור-לבן' },
  { id: 'sepia', label: 'ספייה' },
  { id: 'warm', label: 'חמים' },
  { id: 'cold', label: 'קר' },
  { id: 'vivid', label: 'עז' },
  { id: 'dark', label: 'כהה' },
];

export default function ClipFilterBadge({ filter = 'none', onChange }) {
  const [open, setOpen] = useState(false);
  const current = CLIP_FILTERS.find(f => f.id === filter) || CLIP_FILTERS[0];

  return (
    <div className="relative z-10">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="flex items-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs px-1.5 py-0.5 rounded"
        title="פילטר"
      >
        <Wand2 className="w-2.5 h-2.5" />
        {current.id !== 'none' ? current.label : ''}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl min-w-24 overflow-hidden">
          {CLIP_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={e => { e.stopPropagation(); onChange(f.id); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors ${
                f.id === filter ? 'text-violet-400 bg-zinc-700/50' : 'text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}