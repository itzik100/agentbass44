import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageGeneratorPanel({ onAddVideoUrl }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState([]);

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    const res = await base44.integrations.Core.GenerateImage({ prompt: prompt.trim() });
    if (res?.url) {
      setGenerated(prev => [{ url: res.url, prompt: prompt.trim() }, ...prev].slice(0, 8));
    } else {
      setError('שגיאה בייצור התמונה');
    }
    setLoading(false);
  };

  const addToTimeline = (item) => {
    onAddVideoUrl({ url: item.url, name: item.prompt.slice(0, 30), duration: 5, type: 'image' });
  };

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" /> מחולל תמונות AI
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); } }}
            placeholder="תאר את התמונה שתרצה ליצור..."
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-2.5 py-2 text-xs resize-none focus:outline-none focus:border-pink-500"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={generate}
            disabled={!prompt.trim() || loading}
            className="w-full flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'מייצר...' : 'צור תמונה'}
          </button>

          {generated.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {generated.map((item, i) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-pink-500 transition-all"
                  style={{ aspectRatio: '16/9' }}
                  onClick={() => addToTimeline(item)}
                  title={item.prompt}
                >
                  <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}