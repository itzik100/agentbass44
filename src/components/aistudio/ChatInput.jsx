import React, { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

const EXAMPLES = [
  'צור וידאו שיווקי קצר של 60 שניות על אפליקציית AI לעסקים',
  'סרטון הסבר על בלוקצ\'יין למתחילים - 90 שניות',
  'פרזנטציית מוצר עבור SaaS של ניהול פרויקטים',
];

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef();

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-900">
      {!disabled && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-full transition-colors border border-zinc-700"
            >
              {ex.slice(0, 40)}...
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder="תאר את הוידאו שאתה רוצה ליצור..."
          className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-violet-500 transition-colors"
          rows={2}
        />
        <button
          onClick={send}
          disabled={disabled || !text.trim()}
          className="w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        >
          {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}