import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Settings, CheckCircle2, Circle } from 'lucide-react';

const VOICE_OPTIONS = [
  { value: 'elevenlabs', label: '🎙️ ElevenLabs' },
  { value: 'openai', label: '🤖 OpenAI TTS' },
];

function Bubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-5 h-5 rounded bg-violet-900 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">🤖</div>
      )}
      <div className={`max-w-[90%] rounded-xl px-2.5 py-2 text-xs ${isUser ? 'bg-violet-700 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
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

function StageIndicator({ stages, activeStage, completedStages }) {
  return (
    <div className="px-2 py-2 border-b border-zinc-800 space-y-0.5">
      {stages.map(stage => {
        const isDone = completedStages.includes(stage.id);
        const isActive = activeStage === stage.id;
        return (
          <div key={stage.id} className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-violet-900/50' : ''}`}>
            {isDone
              ? <CheckCircle2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
              : isActive
                ? <Loader2 className="w-3 h-3 text-violet-400 animate-spin flex-shrink-0" />
                : <Circle className="w-3 h-3 text-zinc-700 flex-shrink-0" />
            }
            <span className={`truncate ${isDone ? 'text-violet-300' : isActive ? 'text-white' : 'text-zinc-600'}`}>
              {stage.icon} {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ChatSidebar({ messages, isRunning, onSend, voiceProvider, setVoiceProvider, stages, activeStage, completedStages }) {
  const [text, setText] = useState('');
  const bottomRef = useRef();

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
    <div className="w-64 flex-shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
        <span className="text-xs font-bold">🤖 AI Director</span>
      </div>

      {/* Pipeline stages */}
      {(activeStage || completedStages.length > 0) && (
        <StageIndicator stages={stages} activeStage={activeStage} completedStages={completedStages} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((msg, i) => <Bubble key={i} message={msg} />)}
        {isRunning && (
          <div className="flex gap-1 px-2.5 py-2 bg-zinc-800 rounded-xl w-fit">
            {[0, 150, 300].map(d => (
              <div key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-zinc-800 space-y-1.5">
        <div className="flex gap-1.5 items-end">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            disabled={isRunning}
            placeholder="תאר את הוידאו..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-2.5 py-2 text-xs resize-none focus:outline-none focus:border-violet-500"
            rows={2}
          />
          <button onClick={send} disabled={isRunning || !text.trim()}
            className="w-7 h-7 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg flex items-center justify-center flex-shrink-0">
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </div>
        <select value={voiceProvider} onChange={e => setVoiceProvider(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 rounded px-2 py-1">
          {VOICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}