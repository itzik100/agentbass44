import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from '@/components/aistudio/ChatSidebar';
import PipelineProgress from '@/components/aistudio/PipelineProgress';
import ResultsPanel from '@/components/aistudio/ResultsPanel';
import StudioMain from '@/components/aistudio/StudioMain';
import { base44 } from '@/api/base44Client';

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
    { role: 'assistant', content: '👋 שלום! אני הבמאי AI שלך.\n\nספר לי איזה וידאו ליצור - נושא, סגנון, קהל יעד - ואני אדאג לכל השאר אוטומטית.' }
  ]);
  const [activeStage, setActiveStage] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState('elevenlabs');

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const runPipeline = async (instruction) => {
    if (isRunning) return;
    setIsRunning(true);
    setResults(null);
    setCompletedStages(['instruction']);
    setActiveStage('script');
    addMessage('user', instruction);
    addMessage('assistant', '🚀 **מתחיל pipeline אוטומטי...**\n\nמעבד שלב אחרי שלב, כ-2-3 דקות.');

    try {
      const res = await base44.functions.invoke('videoPipeline', { instruction, voiceProvider });
      const data = res.data;
      if (data.success) {
        setCompletedStages(data.stagesDone || PIPELINE_STAGES.map(s => s.id));
        setActiveStage('done');
        setResults(data);
        addMessage('assistant', buildSuccessMessage(data));
      } else {
        setCompletedStages(data.partial?.stagesDone || []);
        setActiveStage(data.stage);
        addMessage('assistant', `❌ **שגיאה בשלב: ${data.stage}**\n\n${data.error}`);
      }
    } catch (err) {
      addMessage('assistant', `❌ **שגיאת חיבור**\n\n${err.message}`);
    }
    setIsRunning(false);
  };

  const buildSuccessMessage = (data) => {
    const s = data.script;
    return `✅ **הוידאו מוכן!**\n\n**📋 כותרת:** ${s?.title || 'ללא שם'}\n**⏱️ משך:** ${s?.duration_seconds || '?'} שניות\n**🔍 ציון:** ${data.review?.score}/10\n**🎬 B-roll:** ${data.broll?.length || 0} מקורות\n**🎙️ קול:** ${data.voice?.provider || voiceProvider}`;
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden" dir="rtl">

      {/* RIGHT: Narrow Chat Sidebar */}
      <ChatSidebar
        messages={messages}
        isRunning={isRunning}
        onSend={runPipeline}
        voiceProvider={voiceProvider}
        setVoiceProvider={setVoiceProvider}
      />

      {/* CENTER: Main Studio */}
      <StudioMain
        results={results}
        isRunning={isRunning}
        stages={PIPELINE_STAGES}
        activeStage={activeStage}
        completedStages={completedStages}
      />

    </div>
  );
}