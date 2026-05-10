import React, { useState, useRef, useEffect } from 'react';
import ChatInput from '@/components/aistudio/ChatInput';
import PipelineProgress from '@/components/aistudio/PipelineProgress';
import ResultsPanel from '@/components/aistudio/ResultsPanel';
import MessageBubble from '@/components/aistudio/MessageBubble';
import SettingsBar from '@/components/aistudio/SettingsBar';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'instruction', label: 'הוראה', icon: '📋' },
  { id: 'script', label: 'תסריט', icon: '📝' },
  { id: 'review', label: 'בדיקה', icon: '🔍' },
  { id: 'broll', label: 'B-roll', icon: '🎬' },
  { id: 'voice', label: 'קולות', icon: '🎙️' },
  { id: 'character', label: 'דמויות', icon: '🧑‍💻' },
  { id: 'assemble', label: 'הרכבה', icon: '🎞️' },
  { id: 'render', label: 'רינדור', icon: '⚙️' },
  { id: 'done', label: 'מוכן', icon: '✅' },
];

export default function AIStudio() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 שלום! אני הבמאי AI שלך.\n\nספר לי איזה וידאו ליצור - נושא, סגנון, קהל יעד - ואני אדאג לכל השאר אוטומטית: תסריט, קול, דמויות, B-roll, עריכה ורינדור.' }
  ]);
  const [activeStage, setActiveStage] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState('elevenlabs');
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, content, data = null) => {
    setMessages(prev => [...prev, { role, content, data }]);
  };

  const runPipeline = async (instruction) => {
    if (isRunning) return;
    setIsRunning(true);
    setResults(null);
    setCompletedStages(['instruction']);
    setActiveStage('script');

    addMessage('user', instruction);
    addMessage('assistant', '🚀 **מתחיל pipeline...**\n\nמעבד את הבקשה שלך שלב אחרי שלב. זה לוקח כ-2-3 דקות.');

    try {
      const res = await base44.functions.invoke('videoPipeline', { instruction, voiceProvider });
      const data = res.data;

      if (data.success) {
        setCompletedStages(data.stagesDone || PIPELINE_STAGES.map(s => s.id));
        setActiveStage('done');
        setResults(data);
        addMessage('assistant', buildSuccessMessage(data), data);
      } else {
        setCompletedStages(data.partial?.stagesDone || []);
        setActiveStage(data.stage);
        addMessage('assistant', `❌ **שגיאה בשלב: ${data.stage}**\n\n${data.error}\n\nניתן לנסות שוב עם הוראה שונה.`);
      }
    } catch (err) {
      addMessage('assistant', `❌ **שגיאת חיבור**\n\n${err.message}`);
    }

    setIsRunning(false);
  };

  const buildSuccessMessage = (data) => {
    const s = data.script;
    return `✅ **הוידאו מוכן!**

**📋 כותרת:** ${s?.title || 'ללא שם'}
**⏱️ משך:** ${s?.duration_seconds || '?'} שניות
**🔍 ציון ביקורת:** ${data.review?.score}/10
**🎬 קטעי B-roll:** ${data.broll?.length || 0} מקורות נמצאו
**🎙️ קול:** ${data.voice?.provider || voiceProvider}
**🧑‍💻 דמות:** ${data.character?.id ? 'D-ID מעבד...' : 'ללא'}
**🎞️ אסמבלי:** ${data.assembly?.timeline?.length || 0} קטעים בטיימליין

הנה הפירוט המלא 👇`;
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden" dir="rtl">
      {/* Sidebar: Pipeline progress */}
      <div className="w-52 flex-shrink-0 bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-sm">Pipeline</span>
        </div>
        <PipelineProgress stages={PIPELINE_STAGES} activeStage={activeStage} completedStages={completedStages} />
        <SettingsBar voiceProvider={voiceProvider} setVoiceProvider={setVoiceProvider} />
      </div>

      {/* Main: Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <h1 className="text-lg font-bold">🎬 AI Video Studio</h1>
          <p className="text-xs text-zinc-500">תאר את הוידאו שלך - הכל אוטומטי</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isRunning && (
            <div className="flex gap-3 justify-start">
              <div className="bg-zinc-800 rounded-2xl px-4 py-3 max-w-xs">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {results && <ResultsPanel results={results} />}

        <ChatInput onSend={runPipeline} disabled={isRunning} />
      </div>
    </div>
  );
}