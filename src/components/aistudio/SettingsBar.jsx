import React from 'react';
import { Settings } from 'lucide-react';

const VOICE_OPTIONS = [
  { value: 'elevenlabs', label: '🎙️ ElevenLabs' },
  { value: 'openai', label: '🤖 OpenAI TTS' },
];

export default function SettingsBar({ voiceProvider, setVoiceProvider }) {
  return (
    <div className="p-3 border-t border-zinc-800">
      <div className="flex items-center gap-1.5 mb-2">
        <Settings className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-500 font-medium">הגדרות</span>
      </div>
      <div>
        <label className="text-xs text-zinc-600 block mb-1">ספק קול</label>
        <select
          value={voiceProvider}
          onChange={e => setVoiceProvider(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded px-2 py-1.5"
        >
          {VOICE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}