import React, { useState } from 'react';
import { User, Loader2, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const AVATARS = [
  { id: 'noelle', name: 'Noelle', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
  { id: 'william', name: 'William', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
  { id: 'amy', name: 'Amy', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
  { id: 'daniel', name: 'Daniel', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: 'lisa', name: 'Lisa', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: 'michael', name: 'Michael', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
];

export default function AvatarPanel({ onAddVideo, voiceProvider }) {
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setStatus('יוצר וידאו דמות... (~30-60 שניות)');
    try {
      const res = await base44.functions.invoke('didGenerate', {
        text: text.trim(),
        avatarUrl: selectedAvatar.url,
        voiceProvider,
      });
      const { videoUrl } = res.data;
      onAddVideo({
        url: videoUrl,
        name: `${selectedAvatar.name}: ${text.slice(0, 25)}`,
        duration: 10,
        type: 'video',
      });
      setText('');
      setStatus('');
    } catch (e) {
      setError('שגיאה בייצור הוידאו');
      setStatus('');
    }
    setIsLoading(false);
  };

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-white"
      >
        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> דמות מדברת (D-ID)</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Avatar grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {AVATARS.map(av => (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av)}
                className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedAvatar.id === av.id ? 'border-violet-500' : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <img src={av.url} alt={av.name} className="w-full aspect-square object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-center py-0.5 text-zinc-300">
                  {av.name}
                </div>
              </button>
            ))}
          </div>

          {/* Text input */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="טקסט לדמות..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-2.5 py-2 text-xs resize-none focus:outline-none focus:border-violet-500"
            rows={3}
          />

          {status && <p className="text-violet-400 text-xs">{status}</p>}
          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button
            size="sm"
            className="w-full bg-violet-600 hover:bg-violet-700 gap-1.5 text-xs"
            onClick={handleGenerate}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
            {isLoading ? 'מייצר...' : 'צור וידאו דמות'}
          </Button>
        </div>
      )}
    </div>
  );
}