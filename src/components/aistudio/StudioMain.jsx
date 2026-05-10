import React from 'react';
import PipelineProgress from './PipelineProgress';
import ResultsPanel from './ResultsPanel';
import { Sparkles } from 'lucide-react';

export default function StudioMain({ results, isRunning, stages, activeStage, completedStages }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <h1 className="text-lg font-bold">AI Video Studio</h1>
        <span className="text-xs text-zinc-500">Pipeline אוטומטי מלא</span>
        {isRunning && (
          <span className="mr-auto text-xs bg-violet-900 text-violet-300 px-3 py-1 rounded-full animate-pulse">
            ⚙️ מעבד...
          </span>
        )}
      </div>

      {/* Pipeline visual */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <PipelineProgress stages={stages} activeStage={activeStage} completedStages={completedStages} horizontal />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {results ? (
          <ResultsPanel results={results} />
        ) : (
          <EmptyState isRunning={isRunning} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ isRunning }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-6xl mb-4">🎬</div>
      <h2 className="text-xl font-bold text-zinc-300 mb-2">
        {isRunning ? 'Pipeline פועל...' : 'מוכן לייצור'}
      </h2>
      <p className="text-zinc-500 text-sm max-w-md">
        {isRunning
          ? 'Claude מייצר תסריט, ElevenLabs מייצר קול, D-ID מייצר דמות, Pixabay מחפש B-roll...'
          : 'שלח הוראה בצ\'אט מימין ואני אייצר את הוידאו המלא אוטומטית - תסריט, קול, דמויות, B-roll ועריכה.'}
      </p>
      {!isRunning && (
        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-lg">
          {[
            { icon: '📝', label: 'Claude', desc: 'תסריט + ביקורת' },
            { icon: '🎙️', label: 'ElevenLabs', desc: 'קולות AI' },
            { icon: '🎬', label: 'D-ID', desc: 'דמות מדברת' },
            { icon: '🖼️', label: 'Pixabay', desc: 'B-roll חינמי' },
            { icon: '🤖', label: 'OpenAI', desc: 'תמונות DALL-E' },
            { icon: '🎞️', label: 'Assembly', desc: 'עריכה אוטומטית' },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-medium text-zinc-300">{item.label}</p>
              <p className="text-xs text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}