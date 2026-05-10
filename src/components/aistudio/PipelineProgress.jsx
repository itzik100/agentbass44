import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function PipelineProgress({ stages, activeStage, completedStages }) {
  return (
    <div className="flex-1 p-3 space-y-1 overflow-y-auto">
      {stages.map((stage, i) => {
        const isDone = completedStages.includes(stage.id);
        const isActive = activeStage === stage.id;

        return (
          <div key={stage.id} className="flex items-center gap-2.5">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-violet-600' : isActive ? 'bg-violet-900 border-2 border-violet-400' : 'bg-zinc-800'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                ) : (
                  <Circle className="w-3 h-3 text-zinc-600" />
                )}
              </div>
              {i < stages.length - 1 && (
                <div className={`w-0.5 h-4 mt-0.5 ${isDone ? 'bg-violet-600' : 'bg-zinc-700'}`} />
              )}
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