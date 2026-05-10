import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Smile } from 'lucide-react';

const STICKER_CATEGORIES = {
  'רגשות': ['😀','😂','😍','🥹','😎','🤩','😭','🥳','😤','🤔','😴','🤯'],
  'חגיגה': ['🎉','🎊','🎈','🎁','🏆','🥇','⭐','✨','🔥','💥','👑','🎯'],
  'תנועה': ['👆','👇','👈','👉','👍','👎','✌️','🤝','👏','🙌','💪','🫶'],
  'אובייקטים': ['❤️','💔','💯','✅','❌','⚡','🌟','💫','🎵','🎬','📱','💡'],
};

export default function StickerPanel({ onAddSticker }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('רגשות');

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          <Smile className="w-3.5 h-3.5 text-yellow-400" /> סטיקרים ואמוג'י
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap">
            {Object.keys(STICKER_CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-yellow-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >{cat}</button>
            ))}
          </div>

          {/* Sticker grid */}
          <div className="grid grid-cols-6 gap-1">
            {STICKER_CATEGORIES[activeCategory].map(emoji => (
              <button
                key={emoji}
                onClick={() => onAddSticker(emoji)}
                className="text-xl hover:bg-zinc-700 rounded p-1 transition-colors text-center"
                title={`הוסף ${emoji}`}
              >{emoji}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}