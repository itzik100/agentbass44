import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Settings } from 'lucide-react';

const VOICE_OPTIONS = [
  { value: 'elevenlabs', label: '🎙️ ElevenLabs' },
  { value: 'openai', label: '🤖 OpenAI TTS' },
];

const EXAMPLES = [
  'וידאו שיווקי 60 שניות על אפליקציית AI',
  'הסבר בלוקצ\'יין למתחילים - 90 שניות',
  'פרזנטציית מוצר SaaS',
];

function Bubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-violet-900 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">🎬</div>
      )}
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${isUser ? 'bg-violet-700 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
        <ReactMarkdown
          className="prose prose-xs prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          components={{
            p: ({ children }) => <p className="my-0.5 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="text-violet-300">{children}</strong>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function ChatSidebar({ messages, isRunning, onSend, voiceProvider, setVoiceProvider }) {
  const [text, setText] = useState('');
  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!text.trim() || isRunning) return;
    onSend(text.trim());
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-zinc-900 border-l border-zinc-800">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center gap-2">
        <span className="text-sm font-bold">🎬 AI Director</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => <Bubble key={i} message={msg} />)}
        {isRunning && (
          <div className="flex gap-2 justify-start">
            <div className="bg-zinc-800 rounded-xl px-3 py-2 flex gap-1">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Examples */}
      {!isRunning && (
        <div className="px-3 pb-2 space-y-1">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setText(ex)}
              className="w-full text-right text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors truncate">
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            disabled={isRunning}
            placeholder="תאר את הוידאו..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-violet-500"
            rows={2}
          />
          <button onClick={send} disabled={isRunning || !text.trim()}
            className="w-8 h-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg flex items-center justify-center flex-shrink-0">
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Voice selector */}
        <div className="mt-2 flex items-center gap-2">
          <Settings className="w-3 h-3 text-zinc-600 flex-shrink-0" />
          <select value={voiceProvider} onChange={e => setVoiceProvider(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 rounded px-2 py-1">
            {VOICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}