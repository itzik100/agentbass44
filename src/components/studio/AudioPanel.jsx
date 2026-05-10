import React, { useState, useRef } from 'react';
import { Music2, Upload, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BG_MUSIC_PRESETS = [
  { id: 'upbeat', label: '🎵 Upbeat', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'calm', label: '🎶 Calm', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'epic', label: '🎸 Epic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function AudioPanel({ onAddAudio }) {
  const [open, setOpen] = useState(false);
  const [bgVolume, setBgVolume] = useState(50);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('audio')) return;
    onAddAudio({
      url: URL.createObjectURL(file),
      name: file.name,
      duration: 30,
      volume: bgVolume / 100,
    });
  };

  const handlePreset = (preset) => {
    onAddAudio({
      url: preset.url,
      name: preset.label,
      duration: 60,
      volume: bgVolume / 100,
      isBgMusic: true,
    });
  };

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          <Music2 className="w-3.5 h-3.5 text-emerald-400" /> מוזיקת רקע
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {/* Volume slider */}
          <div>
            <label className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
              <Volume2 className="w-3 h-3" /> עוצמה: <span className="text-zinc-300">{bgVolume}%</span>
            </label>
            <input
              type="range" min="0" max="100" value={bgVolume}
              onChange={e => setBgVolume(+e.target.value)}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">פריסטים</p>
            <div className="space-y-1">
              {BG_MUSIC_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  className="w-full text-left px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-xs border-zinc-700 text-zinc-400 hover:text-white"
            onClick={() => inputRef.current.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            העלה קובץ שמע
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}