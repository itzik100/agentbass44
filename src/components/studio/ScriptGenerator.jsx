import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Play, Plus, Film, Mic, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

function SectionCard({ section, index, onAddNarration, onAddToTimeline }) {
  const [expanded, setExpanded] = useState(false);

  const typeColor = {
    intro: 'border-violet-500 bg-violet-500/10',
    main: 'border-blue-500 bg-blue-500/10',
    broll: 'border-amber-500 bg-amber-500/10',
    outro: 'border-emerald-500 bg-emerald-500/10',
  }[section.type] || 'border-zinc-600 bg-zinc-800';

  const typeLabel = { intro: 'פתיחה', main: 'תוכן', broll: 'B-Roll', outro: 'סיום' }[section.type] || section.type;

  return (
    <div className={`rounded-lg border ${typeColor} overflow-hidden`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-3 py-2 flex items-center gap-2 text-left"
      >
        <span className="text-xs font-bold text-zinc-300 w-5">{index + 1}</span>
        <span className="text-xs text-zinc-200 flex-1 truncate">{section.title}</span>
        <span className="text-xs text-zinc-500">{section.duration}s</span>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{typeLabel}</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-zinc-700/50">
          {section.narration && (
            <div>
              <p className="text-xs text-zinc-500 mt-2 mb-1 flex items-center gap-1"><Mic className="w-3 h-3" /> קריינות:</p>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 rounded p-2">{section.narration}</p>
            </div>
          )}

          {section.visuals && (
            <div>
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Film className="w-3 h-3" /> ויזואלים:</p>
              <p className="text-xs text-zinc-400 italic">{section.visuals}</p>
            </div>
          )}

          {section.screen_texts?.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Type className="w-3 h-3" /> טקסטים על מסך:</p>
              <div className="space-y-1">
                {section.screen_texts.map((st, i) => (
                  <div key={i} className="text-xs bg-zinc-900/50 rounded px-2 py-1 flex items-center justify-between gap-2">
                    <span className="text-white flex-1">"{st.text}"</span>
                    <span className="text-zinc-600 shrink-0">{st.style}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-1.5 pt-1">
            {section.narration && (
              <Button size="sm" variant="outline"
                className="flex-1 text-xs h-7 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                onClick={() => onAddNarration(section.narration)}>
                <Mic className="w-3 h-3" /> הוסף קריינות
              </Button>
            )}
            <Button size="sm"
              className="flex-1 text-xs h-7 bg-violet-600 hover:bg-violet-700"
              onClick={() => onAddToTimeline(section)}>
              <Plus className="w-3 h-3" /> הוסף לטיימליין
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScriptGenerator({ onAddNarration, onAddSection, onAddAllToTimeline }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [duration, setDuration] = useState(60);
  const [language, setLanguage] = useState('hebrew');
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setScript(null);
    try {
      const res = await base44.functions.invoke('scriptGenerate', {
        topic: topic.trim(),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        duration,
        language,
      });
      setScript(res.data.script);
    } catch (e) {
      setError('שגיאה בייצור התסריט');
    }
    setIsLoading(false);
  };

  const handleAddAll = () => {
    if (script) onAddAllToTimeline(script);
  };

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> מחולל תסריט AI
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="נושא הסרטון..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-violet-500"
          />
          <input
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="מילות מפתח (מופרדות בפסיק)..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-violet-500"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 block mb-1">משך (שניות)</label>
              <input type="number" min="15" max="300" step="15"
                value={duration}
                onChange={e => setDuration(+e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 block mb-1">שפה</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs">
                <option value="hebrew">עברית</option>
                <option value="english">אנגלית</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black gap-1.5 text-xs font-semibold"
            onClick={handleGenerate} disabled={isLoading || !topic.trim()}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isLoading ? 'מייצר תסריט...' : 'צור תסריט'}
          </Button>

          {script && (
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white truncate flex-1">{script.title}</p>
                <span className="text-xs text-zinc-500 ml-2">{script.total_duration}s</span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                {script.sections?.map((section, i) => (
                  <SectionCard
                    key={section.id || i}
                    section={section}
                    index={i}
                    onAddNarration={onAddNarration}
                    onAddToTimeline={onAddSection}
                  />
                ))}
              </div>

              <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 gap-1.5 text-xs"
                onClick={handleAddAll}>
                <Play className="w-3.5 h-3.5" /> הוסף הכל לטיימליין
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}