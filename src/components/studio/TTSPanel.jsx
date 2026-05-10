import React, { useState } from 'react';
import { Mic, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function TTSPanel({ onAddAudio }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('ttsGenerate', { text: text.trim() });
      const { audioBase64, mimeType } = res.data;
      // Convert base64 to Blob
      const byteChars = atob(audioBase64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: mimeType || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      onAddAudio({ url, name: `קריינות: ${text.slice(0, 30)}`, duration: null });
      setText('');
    } catch (e) {
      setError('שגיאה בייצור הקול');
    }
    setIsLoading(false);
  };

  return (
    <div className="px-3 py-3 border-b border-zinc-800">
      <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
        <Mic className="w-3.5 h-3.5" /> טקסט לדיבור (TTS)
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="הקלד טקסט לקריינות..."
        className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-2.5 py-2 text-xs resize-none focus:outline-none focus:border-violet-500"
        rows={3}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      <Button
        size="sm"
        className="w-full mt-2 bg-violet-600 hover:bg-violet-700 gap-1.5 text-xs"
        onClick={handleGenerate}
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        {isLoading ? 'מייצר...' : 'הוסף לטיימליין'}
      </Button>
    </div>
  );
}