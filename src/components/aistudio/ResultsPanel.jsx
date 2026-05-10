import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Film, Music, Image, FileText } from 'lucide-react';

export default function ResultsPanel({ results }) {
  const [open, setOpen] = useState(false);

  if (!results) return null;

  const { script, review, broll, assembly, character } = results;

  return (
    <div className="border-t border-zinc-800 bg-zinc-900">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300"
      >
        <span>📦 תוצאות Pipeline מלאות</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {open && (
        <div className="p-4 grid grid-cols-2 gap-4 max-h-80 overflow-y-auto text-xs">
          {/* Script */}
          {script && (
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2 text-violet-300 font-medium">
                <FileText className="w-4 h-4" /> תסריט
              </div>
              <p className="text-zinc-400 mb-1"><strong>כותרת:</strong> {script.title}</p>
              <p className="text-zinc-400 mb-1"><strong>משך:</strong> {script.duration_seconds}s</p>
              {script.sections?.map((s, i) => (
                <div key={i} className="mt-1.5 border-t border-zinc-700 pt-1.5">
                  <p className="text-zinc-300 font-medium">{s.title}</p>
                  <p className="text-zinc-500 line-clamp-2">{s.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review */}
          {review && (
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2 text-emerald-300 font-medium">
                🔍 ביקורת
              </div>
              <p className="text-2xl font-bold text-white mb-1">{review.score}<span className="text-zinc-500 text-sm">/10</span></p>
              {review.issues?.length > 0 && (
                <div className="mt-1">
                  <p className="text-red-400 font-medium mb-1">בעיות:</p>
                  {review.issues.slice(0, 3).map((iss, i) => <p key={i} className="text-zinc-500">• {iss}</p>)}
                </div>
              )}
              {review.improvements?.length > 0 && (
                <div className="mt-1">
                  <p className="text-amber-400 font-medium mb-1">שיפורים:</p>
                  {review.improvements.slice(0, 3).map((imp, i) => <p key={i} className="text-zinc-500">• {imp}</p>)}
                </div>
              )}
            </div>
          )}

          {/* B-roll */}
          {broll && broll.length > 0 && (
            <div className="bg-zinc-800 rounded-xl p-3 col-span-2">
              <div className="flex items-center gap-1.5 mb-2 text-amber-300 font-medium">
                <Film className="w-4 h-4" /> B-roll
              </div>
              <div className="grid grid-cols-3 gap-2">
                {broll.flatMap(b => b.images || []).slice(0, 6).map((img, i) => (
                  <img key={i} src={img.thumb} className="w-full h-16 object-cover rounded-lg" alt="" />
                ))}
              </div>
            </div>
          )}

          {/* Assembly */}
          {assembly?.timeline && (
            <div className="bg-zinc-800 rounded-xl p-3 col-span-2">
              <div className="flex items-center gap-1.5 mb-2 text-blue-300 font-medium">
                🎞️ טיימליין
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {assembly.timeline.map((item, i) => (
                  <div key={i} className={`flex-shrink-0 px-2 py-1.5 rounded text-center ${
                    item.type === 'presenter' ? 'bg-violet-900' :
                    item.type === 'broll' ? 'bg-amber-900' : 'bg-blue-900'
                  }`} style={{ minWidth: `${Math.max(item.duration * 8, 60)}px` }}>
                    <p className="text-white text-xs">{item.type}</p>
                    <p className="text-zinc-400 text-xs">{item.duration}s</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}