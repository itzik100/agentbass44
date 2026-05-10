import React, { useState } from 'react';
import { Plus, Music, Image as ImageIcon } from 'lucide-react';

const SOUND_EFFECTS = [
  { id: 'whoosh1', label: '💨 Whoosh', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', duration: 1 },
  { id: 'whoosh2', label: '💨 Swoosh', url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', duration: 1 },
  { id: 'click1', label: '🖱️ Click', url: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3', duration: 0.5 },
  { id: 'pop1', label: '🫧 Pop', url: 'https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3', duration: 0.5 },
  { id: 'ding', label: '🔔 Ding', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', duration: 1 },
  { id: 'notification', label: '📳 Notification', url: 'https://assets.mixkit.co/active_storage/sfx/1/1-preview.mp3', duration: 1 },
  { id: 'success', label: '✅ Success', url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', duration: 2 },
  { id: 'error', label: '❌ Error', url: 'https://assets.mixkit.co/active_storage/sfx/2953/2953-preview.mp3', duration: 1 },
  { id: 'applause', label: '👏 Applause', url: 'https://assets.mixkit.co/active_storage/sfx/2639/2639-preview.mp3', duration: 3 },
  { id: 'drumroll', label: '🥁 Drum Roll', url: 'https://assets.mixkit.co/active_storage/sfx/438/438-preview.mp3', duration: 3 },
  { id: 'transition', label: '🌀 Transition', url: 'https://assets.mixkit.co/active_storage/sfx/2960/2960-preview.mp3', duration: 1 },
  { id: 'typing', label: '⌨️ Typing', url: 'https://assets.mixkit.co/active_storage/sfx/2517/2517-preview.mp3', duration: 2 },
];

const BG_IMAGES = [
  { id: 'gradient1', label: 'Gradient Blue', color: '#1e3a5f', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=640&h=360&fit=crop' },
  { id: 'gradient2', label: 'Gradient Purple', color: '#2d1b69', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=640&h=360&fit=crop' },
  { id: 'gradient3', label: 'Gradient Orange', color: '#7c2d12', url: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=640&h=360&fit=crop' },
  { id: 'dark1', label: 'Dark Studio', color: '#111', url: 'https://images.unsplash.com/photo-1478737270197-2b6df4a3d24b?w=640&h=360&fit=crop' },
  { id: 'tech1', label: 'Tech / Code', color: '#0f172a', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop' },
  { id: 'office1', label: 'Office', color: '#374151', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=360&fit=crop' },
  { id: 'nature1', label: 'Nature Green', color: '#14532d', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=640&h=360&fit=crop' },
  { id: 'city1', label: 'City Night', color: '#1e293b', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=640&h=360&fit=crop' },
  { id: 'abstract1', label: 'Abstract Red', color: '#450a0a', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=640&h=360&fit=crop' },
  { id: 'abstract2', label: 'Abstract Teal', color: '#042f2e', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=640&h=360&fit=crop' },
  { id: 'minimal1', label: 'Minimal White', color: '#f8fafc', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=640&h=360&fit=crop' },
  { id: 'space1', label: 'Space', color: '#020617', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=640&h=360&fit=crop' },
];

export default function LibraryPanel({ onAddAudioUrl, onAddVideoUrl }) {
  const [tab, setTab] = useState('sounds');
  const [previewId, setPreviewId] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);

  const playPreview = (item) => {
    if (previewAudio) { previewAudio.pause(); previewAudio.currentTime = 0; }
    if (previewId === item.id) { setPreviewId(null); setPreviewAudio(null); return; }
    const audio = new Audio(item.url);
    audio.play();
    audio.onended = () => { setPreviewId(null); setPreviewAudio(null); };
    setPreviewId(item.id);
    setPreviewAudio(audio);
  };

  const addSound = (item) => {
    onAddAudioUrl({ url: item.url, name: item.label, duration: item.duration });
  };

  const addBgImage = (item) => {
    onAddVideoUrl({ url: item.url, name: item.label, duration: 5, type: 'image' });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b border-zinc-800 px-1 pt-1 gap-1">
        <button
          onClick={() => setTab('sounds')}
          className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-t transition-colors ${
            tab === 'sounds' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Music className="w-3 h-3" /> סאונד
        </button>
        <button
          onClick={() => setTab('images')}
          className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-t transition-colors ${
            tab === 'images' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ImageIcon className="w-3 h-3" /> רקעים
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {tab === 'sounds' && SOUND_EFFECTS.map(item => (
          <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 group">
            <button
              onClick={() => playPreview(item)}
              className={`text-base leading-none w-6 h-6 flex items-center justify-center rounded transition-colors ${
                previewId === item.id ? 'bg-violet-600 text-white' : 'hover:bg-zinc-700'
              }`}
              title="נגן תצוגה מקדימה"
            >
              {previewId === item.id ? '⏸' : '▶'}
            </button>
            <span className="text-xs text-zinc-300 flex-1 truncate">{item.label}</span>
            <button
              onClick={() => addSound(item)}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-violet-400 transition-all"
              title="הוסף לטיימליין"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {tab === 'images' && (
          <div className="grid grid-cols-2 gap-1.5">
            {BG_IMAGES.map(item => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-violet-500 transition-all"
                style={{ aspectRatio: '16/9' }}
                onClick={() => addBgImage(item)}
                title={item.label}
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-xs text-white truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}