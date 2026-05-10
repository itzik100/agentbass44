import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TRANSITIONS = ['none', 'fade', 'slide-left', 'slide-right', 'zoom', 'blur'];
const CLIP_FILTERS = ['none', 'bright', 'contrast', 'grayscale', 'sepia', 'warm', 'cold', 'vivid', 'dark'];
const FILTERS = ['none', 'bright', 'contrast', 'grayscale', 'sepia', 'warm', 'cold', 'vivid'];

export default function PropertiesPanel({
  selectedClip, onUpdateClip, onUpdateText, onDeleteClip, onDeleteText,
  activeFilter, setActiveFilter
}) {
  const isText = selectedClip?.trackType === 'text';
  const isAudio = selectedClip?.type === 'audio';

  return (
    <div className="w-56 flex flex-col bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">מאפיינים</span>
      </div>

      {/* Global Filters */}
      <div className="px-3 py-3 border-b border-zinc-800">
        <p className="text-xs font-medium text-zinc-400 mb-2">פילטרים</p>
        <div className="grid grid-cols-2 gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-2 py-1.5 rounded capitalize transition-colors ${
                activeFilter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {f === 'none' ? 'ללא' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Clip / Text Properties */}
      {selectedClip ? (
        <div className="px-3 py-3 space-y-3">
          <p className="text-xs font-medium text-zinc-400">
            {isText ? 'עריכת טקסט' : isAudio ? 'עריכת שמע' : 'עריכת קליפ'}
          </p>

          {/* Text properties */}
          {isText && (
            <>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">תוכן</label>
                <Input
                  value={selectedClip.text || ''}
                  onChange={e => onUpdateText(selectedClip.id, { text: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white text-sm h-8"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">גודל פונט</label>
                <input
                  type="range" min="12" max="96"
                  value={selectedClip.fontSize || 32}
                  onChange={e => onUpdateText(selectedClip.id, { fontSize: +e.target.value })}
                  className="w-full accent-violet-500"
                />
                <span className="text-xs text-zinc-500">{selectedClip.fontSize}px</span>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">צבע</label>
                <input
                  type="color"
                  value={selectedClip.color || '#ffffff'}
                  onChange={e => onUpdateText(selectedClip.id, { color: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">מיקום X (%)</label>
                <input
                  type="range" min="5" max="95"
                  value={selectedClip.x || 50}
                  onChange={e => onUpdateText(selectedClip.id, { x: +e.target.value })}
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">מיקום Y (%)</label>
                <input
                  type="range" min="5" max="95"
                  value={selectedClip.y || 80}
                  onChange={e => onUpdateText(selectedClip.id, { y: +e.target.value })}
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">משך (שניות)</label>
                <input
                  type="number" min="0.5" step="0.5"
                  value={selectedClip.duration || 3}
                  onChange={e => onUpdateText(selectedClip.id, { duration: +e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedClip.bold || false}
                  onChange={e => onUpdateText(selectedClip.id, { bold: e.target.checked })}
                  className="accent-violet-500"
                />
                <span className="text-xs text-zinc-400">מודגש</span>
              </label>
            </>
          )}

          {/* Audio properties */}
          {isAudio && (
            <>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  עוצמת קול: <span className="text-zinc-300">{Math.round((selectedClip.volume ?? 1) * 100)}%</span>
                </label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={selectedClip.volume ?? 1}
                  onChange={e => onUpdateClip(selectedClip.id, { volume: +e.target.value })}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  Fade In: <span className="text-zinc-300">{(selectedClip.fadeIn || 0).toFixed(1)}s</span>
                </label>
                <input
                  type="range" min="0" max="3" step="0.1"
                  value={selectedClip.fadeIn || 0}
                  onChange={e => onUpdateClip(selectedClip.id, { fadeIn: +e.target.value })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  Fade Out: <span className="text-zinc-300">{(selectedClip.fadeOut || 0).toFixed(1)}s</span>
                </label>
                <input
                  type="range" min="0" max="3" step="0.1"
                  value={selectedClip.fadeOut || 0}
                  onChange={e => onUpdateClip(selectedClip.id, { fadeOut: +e.target.value })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div className="border-t border-zinc-800 pt-2">
                <label className="text-xs text-zinc-500 block mb-1">משך (שניות)</label>
                <input
                  type="number" min="0.1" step="0.5"
                  value={selectedClip.duration || 5}
                  onChange={e => onUpdateClip(selectedClip.id, { duration: +e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">התחלה (שניות)</label>
                <input
                  type="number" min="0" step="0.5"
                  value={selectedClip.start || 0}
                  onChange={e => onUpdateClip(selectedClip.id, { start: +e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </>
          )}

          {/* Video / Image properties */}
          {!isText && !isAudio && (
            <>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">משך (שניות)</label>
                <input
                  type="number" min="0.1" step="0.5"
                  value={selectedClip.duration || 5}
                  onChange={e => onUpdateClip(selectedClip.id, { duration: +e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">התחלה (שניות)</label>
                <input
                  type="number" min="0" step="0.5"
                  value={selectedClip.start || 0}
                  onChange={e => onUpdateClip(selectedClip.id, { start: +e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>

              {/* Speed Control */}
              <div className="border-t border-zinc-800 pt-2">
                <label className="text-xs text-zinc-500 block mb-1">
                  מהירות: <span className="text-zinc-300">{(selectedClip.speed || 1).toFixed(2)}x</span>
                </label>
                <input
                  type="range" min="0.1" max="4" step="0.05"
                  value={selectedClip.speed || 1}
                  onChange={e => onUpdateClip(selectedClip.id, { speed: +e.target.value })}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                  <span>0.1x</span><span>1x</span><span>4x</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {[0.25, 0.5, 1, 1.5, 2, 4].map(s => (
                    <button key={s}
                      onClick={() => onUpdateClip(selectedClip.id, { speed: s })}
                      className={`flex-1 text-xs py-0.5 rounded transition-colors ${
                        (selectedClip.speed || 1) === s
                          ? 'bg-orange-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >{s}x</button>
                  ))}
                </div>
              </div>

              {/* Ken Burns (images only) */}
              {selectedClip.type === 'image' && (
                <div className="border-t border-zinc-800 pt-2">
                  <label className="text-xs text-zinc-500 block mb-1">Ken Burns</label>
                  <select
                    value={selectedClip.kenBurns || 'none'}
                    onChange={e => onUpdateClip(selectedClip.id, { kenBurns: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="none">ללא</option>
                    <option value="zoom-in">Zoom In</option>
                    <option value="zoom-out">Zoom Out</option>
                    <option value="pan-left">Pan Left</option>
                    <option value="pan-right">Pan Right</option>
                    <option value="zoom-pan">Zoom + Pan</option>
                  </select>
                </div>
              )}

              {/* Color Grading */}
              <div className="border-t border-zinc-800 pt-2">
                <p className="text-xs text-zinc-400 font-medium mb-2">Color Grading</p>
                {[
                  { key: 'brightness', label: 'בהירות', min: -100, max: 100, def: 0, color: 'accent-yellow-500' },
                  { key: 'contrast', label: 'ניגודיות', min: -100, max: 100, def: 0, color: 'accent-blue-500' },
                  { key: 'saturation', label: 'רוויה', min: -100, max: 100, def: 0, color: 'accent-pink-500' },
                  { key: 'hue', label: 'גוון', min: -180, max: 180, def: 0, color: 'accent-emerald-500' },
                ].map(({ key, label, min, max, def, color }) => (
                  <div key={key} className="mb-1.5">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-zinc-500">{label}</span>
                      <span className="text-zinc-300">{selectedClip[key] ?? def}</span>
                    </div>
                    <input
                      type="range" min={min} max={max} step="1"
                      value={selectedClip[key] ?? def}
                      onChange={e => onUpdateClip(selectedClip.id, { [key]: +e.target.value })}
                      className={`w-full ${color}`}
                    />
                  </div>
                ))}
                <button
                  onClick={() => onUpdateClip(selectedClip.id, { brightness: 0, contrast: 0, saturation: 0, hue: 0 })}
                  className="text-xs text-zinc-500 hover:text-white mt-1"
                >↺ אפס</button>
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1">מעבר (Transition)</label>
                <select
                  value={selectedClip.transition || 'none'}
                  onChange={e => onUpdateClip(selectedClip.id, { transition: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                >
                  {TRANSITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {selectedClip.transition && selectedClip.transition !== 'none' && (
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">
                    משך מעבר: <span className="text-zinc-300">{(selectedClip.transitionDuration || 0.5).toFixed(1)}s</span>
                  </label>
                  <input
                    type="range" min="0.1" max="2" step="0.1"
                    value={selectedClip.transitionDuration || 0.5}
                    onChange={e => onUpdateClip(selectedClip.id, { transitionDuration: +e.target.value })}
                    className="w-full accent-violet-500"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-zinc-500 block mb-1">פילטר קליפ</label>
                <select
                  value={selectedClip.clipFilter || 'none'}
                  onChange={e => onUpdateClip(selectedClip.id, { clipFilter: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                >
                  {CLIP_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-1.5 mt-2"
            onClick={() => isText ? onDeleteText(selectedClip.id) : onDeleteClip(selectedClip.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            מחק
          </Button>
        </div>
      ) : (
        <div className="px-3 py-4">
          <p className="text-xs text-zinc-600 text-center">בחר קליפ או טקסט לעריכה</p>
        </div>
      )}
    </div>
  );
}