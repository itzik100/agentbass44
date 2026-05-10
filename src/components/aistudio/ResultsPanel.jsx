import React, { useState } from 'react';
import { Film, FileText, Star } from 'lucide-react';

export default function ResultsPanel({ results }) {
  const [tab, setTab] = useState('script');
  if (!results) return null;
  const { script, review, broll, assembly, character, voice } = results;

  const tabs = [
    { id: 'script', label: '📝 תסריט' },
    { id: 'review', label: '🔍 ביקורת' },
    { id: 'broll', label: '🎬 B-roll' },
    { id: 'timeline', label: '🎞️ טיימליין' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-zinc-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${tab === t.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {tab === 'script' && script && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-1">{script.title}</h2>
            <p className="text-zinc-500 text-sm mb-4">⏱️ {script.duration_seconds} שניות</p>
            <div className="space-y-4">
              {script.sections?.map((s, i) => (
                <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <p className="text-violet-300 font-semibold text-sm mb-1">{s.title}</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{s.content}</p>
                  <p className="text-zinc-600 text-xs mt-2">⏱️ {s.duration}s</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'review' && review && (
          <div className="max-w-lg">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center mb-4">
              <div className="text-5xl font-black text-white mb-1">{review.score}</div>
              <div className="text-zinc-500 text-sm">מתוך 10</div>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(10)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.score ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                ))}
              </div>
            </div>
            {review.issues?.length > 0 && (
              <div className="mb-3">
                <p className="text-red-400 font-medium text-sm mb-2">⚠️ בעיות</p>
                {review.issues.map((iss, i) => <p key={i} className="text-zinc-400 text-sm mb-1">• {iss}</p>)}
              </div>
            )}
            {review.improvements?.length > 0 && (
              <div>
                <p className="text-amber-400 font-medium text-sm mb-2">💡 שיפורים</p>
                {review.improvements.map((imp, i) => <p key={i} className="text-zinc-400 text-sm mb-1">• {imp}</p>)}
              </div>
            )}
          </div>
        )}

        {tab === 'broll' && (
          <div>
            <p className="text-zinc-500 text-sm mb-4">{broll?.length || 0} מקורות B-roll נמצאו</p>
            <div className="space-y-6">
              {broll?.map((b, i) => (
                <div key={i}>
                  <p className="text-zinc-400 font-medium text-sm mb-2">🔍 {b.keyword}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[...(b.images || []), ...(b.videos || [])].slice(0, 6).map((item, j) => (
                      <a key={j} href={item.url} target="_blank" rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-zinc-800 hover:border-violet-500 transition-colors">
                        <img src={item.thumb} className="w-full h-24 object-cover" alt="" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'timeline' && assembly?.timeline && (
          <div>
            <p className="text-zinc-500 text-sm mb-4">⏱️ סה"כ: {assembly.total_duration}s</p>
            <div className="flex gap-1 overflow-x-auto pb-4 mb-6">
              {assembly.timeline.map((item, i) => (
                <div key={i} className={`flex-shrink-0 rounded-lg px-3 py-2 text-center border ${
                  item.type === 'presenter' ? 'bg-violet-900 border-violet-700' :
                  item.type === 'broll' ? 'bg-amber-900 border-amber-700' : 'bg-blue-900 border-blue-700'
                }`} style={{ minWidth: `${Math.max(item.duration * 10, 80)}px` }}>
                  <p className="text-white text-xs font-medium">{item.type}</p>
                  <p className="text-zinc-400 text-xs">{item.duration}s</p>
                  <p className="text-zinc-500 text-xs truncate">{item.content?.slice(0, 20)}</p>
                </div>
              ))}
            </div>
            {assembly.subtitles?.length > 0 && (
              <div>
                <p className="text-zinc-400 font-medium text-sm mb-2">כתוביות</p>
                <div className="space-y-1">
                  {assembly.subtitles.map((sub, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-zinc-600 w-20 flex-shrink-0">{sub.start}s → {sub.end}s</span>
                      <span className="text-zinc-300">{sub.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}