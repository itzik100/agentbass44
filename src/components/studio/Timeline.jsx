import React, { useRef, useState } from 'react';
import { Film, Music, Type, ZoomIn, ZoomOut } from 'lucide-react';

const TRACK_HEIGHT = 48;
const PX_PER_SEC = 80;

export default function Timeline({
  tracks, textOverlays, currentTime, setCurrentTime,
  duration, zoom, setZoom, selectedClip, setSelectedClip,
  onUpdateClip, onDeleteClip, onUpdateText, onDeleteText
}) {
  const rulerRef = useRef();
  const [dragging, setDragging] = useState(null);

  const pps = PX_PER_SEC * zoom;
  const totalWidth = Math.max(duration * pps + 200, 800);

  const handleRulerClick = (e) => {
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setCurrentTime(Math.max(0, x / pps));
  };

  const handleClipMouseDown = (e, clip, trackType) => {
    e.stopPropagation();
    setSelectedClip({ ...clip, trackType });
    const startX = e.clientX;
    const origStart = clip.start;
    const move = (me) => {
      const dx = me.clientX - startX;
      const newStart = Math.max(0, origStart + dx / pps);
      if (trackType === 'text') {
        onUpdateText(clip.id, { start: newStart });
      } else {
        onUpdateClip(clip.id, { start: newStart });
      }
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const handleResizeMouseDown = (e, clip, trackType) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origDur = clip.duration;
    const move = (me) => {
      const dx = me.clientX - startX;
      const newDur = Math.max(0.5, origDur + dx / pps);
      if (trackType === 'text') {
        onUpdateText(clip.id, { duration: newDur });
      } else {
        onUpdateClip(clip.id, { duration: newDur });
      }
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const renderClip = (clip, trackType, color) => (
    <div
      key={clip.id}
      onMouseDown={e => handleClipMouseDown(e, clip, trackType)}
      style={{
        position: 'absolute',
        left: clip.start * pps,
        width: Math.max(clip.duration * pps - 2, 20),
        height: TRACK_HEIGHT - 8,
        top: 4,
        backgroundColor: color,
        borderRadius: 6,
        cursor: 'grab',
        border: selectedClip?.id === clip.id ? '2px solid white' : '2px solid transparent',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      title={clip.name || clip.text}
    >
      <div className="px-2 py-1 flex items-center gap-1 h-full">
        <span className="text-xs text-white font-medium truncate flex-1">
          {clip.name || clip.text}
        </span>
      </div>
      {/* Resize handle */}
      <div
        onMouseDown={e => { e.stopPropagation(); handleResizeMouseDown(e, clip, trackType); }}
        style={{
          position: 'absolute', right: 0, top: 0, width: 8, height: '100%',
          cursor: 'ew-resize', backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '0 6px 6px 0',
        }}
      />
    </div>
  );

  const tickInterval = zoom < 0.5 ? 5 : zoom < 1 ? 2 : 1;
  const ticks = [];
  for (let t = 0; t <= Math.ceil(duration) + 5; t += tickInterval) {
    ticks.push(t);
  }

  return (
    <div className="flex flex-col bg-zinc-900 border-t border-zinc-800" style={{ height: '220px' }}>
      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800">
        <span className="text-xs text-zinc-500">Timeline</span>
        <div className="flex-1" />
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="text-zinc-400 hover:text-white">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-zinc-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="text-zinc-400 hover:text-white">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Track labels */}
        <div className="flex flex-col w-20 flex-shrink-0 border-r border-zinc-800">
          <div className="h-5" /> {/* ruler spacer */}
          <div className="flex items-center gap-1 px-2 text-zinc-500" style={{ height: TRACK_HEIGHT }}>
            <Film className="w-3 h-3" />
            <span className="text-xs">וידאו</span>
          </div>
          <div className="flex items-center gap-1 px-2 text-zinc-500" style={{ height: TRACK_HEIGHT }}>
            <Music className="w-3 h-3" />
            <span className="text-xs">אודיו</span>
          </div>
          <div className="flex items-center gap-1 px-2 text-zinc-500" style={{ height: TRACK_HEIGHT }}>
            <Type className="w-3 h-3" />
            <span className="text-xs">טקסט</span>
          </div>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative">
          <div style={{ width: totalWidth, position: 'relative' }}>
            {/* Ruler */}
            <div
              ref={rulerRef}
              onClick={handleRulerClick}
              className="h-5 bg-zinc-800 cursor-pointer relative border-b border-zinc-700"
              style={{ width: totalWidth }}
            >
              {ticks.map(t => (
                <div key={t} style={{ position: 'absolute', left: t * pps }} className="flex flex-col items-center">
                  <div className="w-px h-3 bg-zinc-600" />
                  <span className="text-xs text-zinc-500" style={{ fontSize: 9, marginTop: 1 }}>{t}s</span>
                </div>
              ))}
              {/* Playhead */}
              <div
                style={{
                  position: 'absolute', left: currentTime * pps, top: 0,
                  width: 2, height: '100%', backgroundColor: '#a78bfa', pointerEvents: 'none'
                }}
              />
            </div>

            {/* Video track */}
            <div className="relative bg-zinc-900 border-b border-zinc-800" style={{ height: TRACK_HEIGHT, width: totalWidth }}>
              {tracks.video.map(clip => renderClip(clip, 'video', clip.color || '#f59e0b'))}
            </div>

            {/* Audio track */}
            <div className="relative bg-zinc-900 border-b border-zinc-800" style={{ height: TRACK_HEIGHT, width: totalWidth }}>
              {tracks.audio.map(clip => renderClip(clip, 'audio', clip.color || '#6366f1'))}
            </div>

            {/* Text track */}
            <div className="relative bg-zinc-900" style={{ height: TRACK_HEIGHT, width: totalWidth }}>
              {textOverlays.map(o => renderClip(o, 'text', '#0ea5e9'))}
            </div>

            {/* Playhead line across all tracks */}
            <div style={{
              position: 'absolute', left: currentTime * pps, top: 20,
              width: 2, height: TRACK_HEIGHT * 3, backgroundColor: '#a78bfa',
              pointerEvents: 'none', opacity: 0.8
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}