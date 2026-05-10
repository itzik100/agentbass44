import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function PipelineProgress({ stages, activeStage, completedStages, horizontal = false }) {
  if (horizontal) {
    return (
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {stages.map((stage, i) => {
          const isDone = completedStages.includes(stage.id);
          const isActive = activeStage === stage.id;
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center flex-shrink-0 min-w-[64px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDone ? 'bg-violet-600' : isActive ? 'bg-violet-900 border-2 border-violet-400' : 'bg-zinc-800'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                   isActive ? <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" /> :
                   <span className="text-sm">{stage.icon}</span>}
                </div>
                <p className={`text-xs mt-1 text-center ${isDone ? 'text-violet-300' : isActive ? 'text-white' : 'text-zinc-600'}`}>
                  {stage.label}
                </p>
              </div>
              {i < stages.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-[12px] mb-4 ${isDone ? 'bg-violet-600' : 'bg-zinc-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Vertical (used in old sidebar if needed)
  return (
    <div className="flex flex-col p-3 space-y-1 overflow-y-auto">
      {stages.map((stage, i) => {
        const isDone = completedStages.includes(stage.id);
        const isActive = activeStage === stage.id;
        return (
          <div key={stage.id} className="flex items-center gap-2.5">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-violet-600' : isActive ? 'bg-violet-900 border-2 border-violet-400' : 'bg-zinc-800'
              }`}>
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> :
                 isActive ? <Loader2 className="w-3 h-3 text-violet-400 animate-spin" /> :
                 <Circle className="w-3 h-3 text-zinc-600" />}
              </div>
              {i < stages.length - 1 && <div className={`w-0.5 h-4 mt-0.5 ${isDone ? 'bg-violet-600' : 'bg-zinc-700'}`} />}
            </div>
            <div className="pb-3">
              <p className={`text-xs font-medium ${isDone ? 'text-violet-300' : isActive ? 'text-white' : 'text-zinc-600'}`}>
                {stage.icon} {stage.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}