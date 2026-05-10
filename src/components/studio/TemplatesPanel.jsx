import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Zap, ChevronDown, ChevronUp, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'studio_templates';

function serializeTracks(tracks, textOverlays) {
  // Strip blob URLs and file objects — keep structure only
  const clean = (clips) => clips.map(c => ({
    ...c,
    url: c.url?.startsWith('blob:') ? '' : (c.url || ''),
    file: undefined,
  }));
  return {
    video: clean(tracks.video),
    audio: clean(tracks.audio),
    textOverlays: textOverlays.map(o => ({ ...o })),
  };
}

export default function TemplatesPanel({ tracks, textOverlays, onLoadTemplate, mediaFiles }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [autoFillTarget, setAutoFillTarget] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setTemplates(stored);
    } catch {
      setTemplates([]);
    }
  }, [open]);

  const saveTemplate = () => {
    if (!saveName.trim()) return;
    const tpl = {
      id: Date.now(),
      name: saveName.trim(),
      createdAt: new Date().toISOString(),
      data: serializeTracks(tracks, textOverlays),
    };
    const updated = [...templates, tpl];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTemplates(updated);
    setSaveName('');
  };

  const deleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTemplates(updated);
  };

  const loadTemplate = (tpl) => {
    onLoadTemplate(tpl.data);
  };

  // Auto-fill: replace empty/placeholder clips with uploaded media files
  const autoFill = (tpl) => {
    const data = JSON.parse(JSON.stringify(tpl.data)); // deep clone
    const videoMedia = mediaFiles.filter(f => f.type.startsWith('video') || f.type.startsWith('image'));
    const audioMedia = mediaFiles.filter(f => f.type.startsWith('audio'));

    let vi = 0;
    data.video = data.video.map(clip => {
      if (!clip.url && videoMedia[vi]) {
        const f = videoMedia[vi++];
        return {
          ...clip,
          url: URL.createObjectURL(f),
          name: f.name,
          type: f.type.startsWith('video') ? 'video' : 'image',
          color: f.type.startsWith('image') ? '#10b981' : '#f59e0b',
        };
      }
      return clip;
    });

    let ai = 0;
    data.audio = data.audio.map(clip => {
      if (!clip.url && audioMedia[ai]) {
        const f = audioMedia[ai++];
        return {
          ...clip,
          url: URL.createObjectURL(f),
          name: f.name,
        };
      }
      return clip;
    });

    onLoadTemplate(data);
  };

  const exportTemplate = (tpl) => {
    const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tpl.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTemplate = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const tpl = JSON.parse(ev.target.result);
        if (!tpl.data) return;
        const withId = { ...tpl, id: Date.now(), name: tpl.name || 'ייבוא' };
        const updated = [...templates, withId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setTemplates(updated);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalClips = tracks.video.length + tracks.audio.length + textOverlays.length;

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-violet-400" /> תבניות (Templates)
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {/* Save current */}
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">שמור טיימליין נוכחי</p>
            <div className="flex gap-1.5">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveTemplate()}
                placeholder="שם התבנית..."
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={saveTemplate}
                disabled={!saveName.trim() || totalClips === 0}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-2 py-1 rounded text-xs transition-colors"
                title="שמור"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
            {totalClips === 0 && (
              <p className="text-xs text-zinc-600 mt-1">הוסף קליפים לטיימליין כדי לשמור תבנית</p>
            )}
          </div>

          {/* Import */}
          <div className="flex gap-1.5">
            <label className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white rounded px-2 py-1.5 text-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" /> ייבא JSON
              <input type="file" accept=".json" className="hidden" onChange={importTemplate} />
            </label>
          </div>

          {/* Templates list */}
          {templates.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-2">אין תבניות שמורות</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">תבניות שמורות ({templates.length})</p>
              {templates.map(tpl => (
                <div key={tpl.id} className="bg-zinc-800 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium truncate flex-1">{tpl.name}</span>
                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      className="text-zinc-600 hover:text-red-400 ml-1 flex-shrink-0 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-600">
                    {tpl.data.video.length}V · {tpl.data.audio.length}A · {tpl.data.textOverlays.length}T
                    {' · '}{new Date(tpl.createdAt).toLocaleDateString('he-IL')}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadTemplate(tpl)}
                      className="flex-1 flex items-center justify-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white rounded px-2 py-1 text-xs transition-colors"
                      title="טען תבנית"
                    >
                      <FolderOpen className="w-3 h-3" /> טען
                    </button>
                    <button
                      onClick={() => autoFill(tpl)}
                      disabled={mediaFiles.length === 0}
                      className="flex-1 flex items-center justify-center gap-1 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white rounded px-2 py-1 text-xs transition-colors"
                      title="Auto-fill עם מדיה שהועלתה"
                    >
                      <Zap className="w-3 h-3" /> Auto-fill
                    </button>
                    <button
                      onClick={() => exportTemplate(tpl)}
                      className="flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white rounded px-2 py-1 transition-colors"
                      title="ייצא JSON"
                    >
                      <Download className="w-3 h-3" />
                    </button>
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