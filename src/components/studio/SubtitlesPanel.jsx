import React, { useState } from 'react';
import { Captions, Loader2, ChevronDown, ChevronUp, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const FONTS = ['Arial', 'Georgia', 'Courier New', 'Impact', 'Verdana'];

export default function SubtitlesPanel({ audioClips, subtitles, setSubtitles, subtitleStyle, setSubtitleStyle }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAudio, setSelectedAudio] = useState(null);

  const availableAudio = audioClips.filter(c => c.url && c.url.startsWith('blob:'));

  const handleGenerate = async () => {
    const clip = selectedAudio || availableAudio[0];
    if (!clip) return;
    setIsLoading(true);
    setError('');
    try {
      // Convert blob URL to base64
      const blob = await fetch(clip.url).then(r => r.blob());
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const res = await base44.functions.invoke('transcribeAudio', {
        audioBase64: base64,
        mimeType: blob.type || 'audio/mpeg',
      });

      const { segments } = res.data;
      // Map segments to subtitle overlays aligned with clip start time
      const offset = clip.start || 0;
      const newSubs = segments.map((seg, i) => ({
        id: Date.now() + i,
        text: seg.text,
        start: offset + seg.start,
        duration: Math.max(0.5, seg.end - seg.start),
        x: subtitleStyle.x,
        y: subtitleStyle.y,
        fontSize: subtitleStyle.fontSize,
        color: subtitleStyle.color,
        bold: subtitleStyle.bold,
        fontFamily: subtitleStyle.fontFamily,
        type: 'subtitle',
        isSubtitle: true,
      }));
      setSubtitles(newSubs);
    } catch (e) {
      setError('שגיאה בתמלול: ' + e.message);
    }
    setIsLoading(false);
  };

  const updateSub = (id, text) => {
    setSubtitles(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  };

  const deleteSub = (id) => {
    setSubtitles(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          <Captions className="w-3.5 h-3.5 text-cyan-400" /> כתוביות אוטומטיות
          {subtitles.length > 0 && (
            <span className="bg-cyan-600 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">{subtitles.length}</span>
          )}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {/* Audio clip selector */}
          {availableAudio.length > 0 ? (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">קובץ שמע לתמלול</label>
              <select
                value={selectedAudio?.id || availableAudio[0]?.id || ''}
                onChange={e => setSelectedAudio(availableAudio.find(c => c.id === +e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs"
              >
                {availableAudio.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-zinc-600">הוסף קובץ שמע לטיימליין כדי לתמלל</p>
          )}

          {/* Style controls */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">עיצוב כתוביות</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">צבע</label>
                <input type="color" value={subtitleStyle.color}
                  onChange={e => setSubtitleStyle(p => ({ ...p, color: e.target.value }))}
                  className="w-full h-7 rounded cursor-pointer bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">גודל</label>
                <input type="number" min="12" max="72" value={subtitleStyle.fontSize}
                  onChange={e => setSubtitleStyle(p => ({ ...p, fontSize: +e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">פונט</label>
              <select value={subtitleStyle.fontFamily}
                onChange={e => setSubtitleStyle(p => ({ ...p, fontFamily: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">מיקום Y (%)</label>
              <input type="range" min="50" max="95" value={subtitleStyle.y}
                onChange={e => setSubtitleStyle(p => ({ ...p, y: +e.target.value }))}
                className="w-full accent-cyan-500"
              />
              <span className="text-xs text-zinc-500">{subtitleStyle.y}%</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={subtitleStyle.bold}
                onChange={e => setSubtitleStyle(p => ({ ...p, bold: e.target.checked }))}
                className="accent-cyan-500"
              />
              <span className="text-xs text-zinc-400">מודגש</span>
            </label>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button
            size="sm"
            className="w-full bg-cyan-600 hover:bg-cyan-700 gap-1.5 text-xs"
            onClick={handleGenerate}
            disabled={isLoading || availableAudio.length === 0}
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {isLoading ? 'מתמלל...' : 'צור כתוביות אוטומטית'}
          </Button>

          {/* Subtitle list editor */}
          {subtitles.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <p className="text-xs text-zinc-500">{subtitles.length} כתוביות — ערוך טקסט:</p>
              {subtitles.map((sub) => (
                <div key={sub.id} className="flex items-start gap-1.5 bg-zinc-800 rounded-lg p-2">
                  <span className="text-xs text-zinc-600 w-8 flex-shrink-0 pt-0.5">
                    {Math.floor(sub.start)}s
                  </span>
                  <textarea
                    value={sub.text}
                    onChange={e => updateSub(sub.id, e.target.value)}
                    rows={2}
                    className="flex-1 bg-zinc-700 border border-zinc-600 text-white rounded px-1.5 py-1 text-xs resize-none focus:outline-none focus:border-cyan-500"
                  />
                  <button onClick={() => deleteSub(sub.id)} className="text-zinc-600 hover:text-red-400 flex-shrink-0 pt-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}