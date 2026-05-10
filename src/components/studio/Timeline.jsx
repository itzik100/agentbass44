import React, { useRef, useState, useCallback } from 'react';
import { Film, Music, Type, ZoomIn, ZoomOut, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import TransitionBadge from './TransitionBadge';
import ClipFilterBadge from './ClipFilterBadge';
import AudioWaveform from './AudioWaveform';

const TRACK_HEIGHT = 48;
const PX_PER_SEC = 80;
const SNAP_THRESHOLD = 8; // pixels

export default function Timeline({
  tracks, textOverlays, currentTime, setCurrentTime,
  duration, zoom, setZoom, selectedClip, setSelectedClip,
  onUpdateClip, onDeleteClip, onUpdateText, onDeleteText
}) {
  const rulerRef = useRef();
  const [snapIndicator, setSnapIndicator] = useState(null);
  const [timelineHeight, setTimelineHeight] = useState(220);
  const [collapsed, setCollapsed] = useState(false);
  const dragStartY = useRef(null);
  const dragStartHeight = useRef(null);

  const handleResizeDragStart = useCallback((e) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartHeight.current = timelineHeight;
    const onMove = (me) => {
      const dy = dragStartY.current - me.clientY; // drag up = bigger
      const newH = Math.max(120, Math.min(500, dragStartHeight.current + dy));
      setTimelineHeight(newH);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [timelineHeight]);

  const pps = PX_PER_SEC * zoom;
  const totalWidth = Math.max(duration * pps + 200, 800);

  // Collect all snap points from other clips
  const getSnapPoints = (excludeId) => {
    const pts = [0];
    [...tracks.video, ...tracks.audio, ...textOverlays].forEach(c => {
      if (c.id !== excludeId) {
        pts.push(c.start, c.start + c.duration);
      }
    });
    return pts;
  };

  const snapValue = (val, excludeId) => {
    const pts = getSnapPoints(excludeId);
    let closest = null;
    let minDist = SNAP_THRESHOLD / pps;
    for (const pt of pts) {
      const d = Math.abs(val - pt);
      if (d < minDist) { minDist = d; closest = pt; }
    }
    return closest !== null ? { snapped: closest, didSnap: true } : { snapped: val, didSnap: false };
  };

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
      const rawStart = Math.max(0, origStart + dx / pps);
      const { snapped, didSnap } = snapValue(rawStart, clip.id);
      setSnapIndicator(didSnap ? snapped : null);
      if (trackType === 'text') onUpdateText(clip.id, { start: snapped });
      else onUpdateClip(clip.id, { start: snapped });
    };
    const up = () => {
      setSnapIndicator(null);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // Right resize (end of clip)
  const handleResizeRightMouseDown = (e, clip, trackType) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origDur = clip.duration;
    const move = (me) => {
      const dx = me.clientX - startX;
      const rawEnd = clip.start + Math.max(0.5, origDur + dx / pps);
      const { snapped, didSnap } = snapValue(rawEnd, clip.id);
      const newDur = Math.max(0.5, snapped - clip.start);
      setSnapIndicator(didSnap ? snapped : null);
      if (trackType === 'text') onUpdateText(clip.id, { duration: newDur });
      else onUpdateClip(clip.id, { duration: newDur });
    };
    const up = () => {
      setSnapIndicator(null);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // Left resize (trim start)
  const handleResizeLeftMouseDown = (e, clip, trackType) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origStart = clip.start;
    const origDur = clip.duration;
    const move = (me) => {
      const dx = me.clientX - startX;
      const rawStart = Math.max(0, origStart + dx / pps);
      const { snapped, didSnap } = snapValue(rawStart, clip.id);
      const delta = snapped - origStart;
      const newDur = Math.max(0.5, origDur - delta);
      setSnapIndicator(didSnap ? snapped : null);
      if (trackType === 'text') onUpdateText(clip.id, { start: snapped, duration: newDur });
      else onUpdateClip(clip.id, { start: snapped, duration: newDur });
    };
    const up = () => {
      setSnapIndicator(null);
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
        overflow: 'visible',
        userSelect: 'none',
      }}
      title={clip.name || clip.text}
    >
      {/* Left trim handle */}
      <div
        onMouseDown={e => { e.stopPropagation(); handleResizeLeftMouseDown(e, clip, trackType); }}
        style={{
          position: 'absolute', left: 0, top: 0, width: 8, height: '100%',
          cursor: 'ew-resize', backgroundColor: 'rgba(255,255,255,0.25)',
          borderRadius: '6px 0 0 6px', zIndex: 2,
        }}
      />

      <div
        style={{ borderRadius: 6, overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}
      >
        <div className="px-3 py-1 flex items-center gap-1 h-full">
          <span className="text-xs text-white font-medium truncate flex-1">
            {clip.speed && clip.speed !== 1 ? `${clip.speed}x ` : ''}{clip.name || clip.text}
          </span>
        </div>

        {/* Waveform + volume for audio clips */}
        {trackType === 'audio' && (
          <div className="absolute inset-0 flex items-center px-2" onMouseDown={e => e.stopPropagation()} style={{ pointerEvents: 'none' }}>
            <AudioWaveform clip={clip} width={Math.max(clip.duration * pps - 20, 10)} height={26} />
          </div>
        )}
        {trackType === 'audio' && clip.duration * pps > 80 && (
          <div className="absolute top-1 right-2 flex items-center gap-1 z-10" onMouseDown={e => e.stopPropagation()}>
            <span className="bg-black/40 text-zinc-200 text-xs px-1 py-0.5 rounded">
              🔊{Math.round((clip.volume ?? 1) * 100)}%
            </span>
            {clip.fadeIn > 0 && <span className="bg-indigo-800/70 text-indigo-200 text-xs px-1 py-0.5 rounded">↑</span>}
            {clip.fadeOut > 0 && <span className="bg-indigo-800/70 text-indigo-200 text-xs px-1 py-0.5 rounded">↓</span>}
          </div>
        )}

        {/* Badges for video clips */}
        {trackType === 'video' && clip.duration * pps > 80 && (
          <div
            className="absolute bottom-1 left-1 flex gap-1"
            onMouseDown={e => e.stopPropagation()}
          >
            <TransitionBadge
              transition={clip.transition || 'none'}
              onChange={val => onUpdateClip(clip.id, { transition: val })}
            />
            <ClipFilterBadge
              filter={clip.clipFilter || 'none'}
              onChange={val => onUpdateClip(clip.id, { clipFilter: val })}
            />
          </div>
        )}

        {/* Right resize handle */}
        <div
          onMouseDown={e => { e.stopPropagation(); handleResizeRightMouseDown(e, clip, trackType); }}
          style={{
            position: 'absolute', right: 0, top: 0, width: 8, height: '100%',
            cursor: 'ew-resize', backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: '0 6px 6px 0',
          }}
        />
      </div>
    </div>
  );

  const tickInterval = zoom < 0.5 ? 5 : zoom < 1 ? 2 : 1;
  const ticks = [];
  for (let t = 0; t <= Math.ceil(duration) + 5; t += tickInterval) {
    ticks.push(t);
  }

  return (
    <div className="flex flex-col bg-zinc-900 border-t border-zinc-800 flex-shrink-0"
      style={{ height: collapsed ? 'auto' : timelineHeight }}>
      {/* Resize drag handle */}
      {!collapsed && (
        <div
          onMouseDown={handleResizeDragStart}
          className="h-1.5 w-full cursor-ns-resize flex items-center justify-center group hover:bg-violet-600/30 transition-colors flex-shrink-0"
          title="גרור לשינוי גובה"
        >
          <GripHorizontal className="w-4 h-3 text-zinc-700 group-hover:text-violet-400" />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800 flex-shrink-0">
        <span className="text-xs text-zinc-500">Timeline</span>
        <span className="text-xs text-zinc-700 ml-2" title="קיצורי מקלדת: Space=נגן, J/L=קפוץ 5s, ←→=פריים, Del=מחק, Cmd+Z=בטל">⌨ קיצורים</span>
        <div className="flex-1" />
        {!collapsed && (
          <>
            <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="text-zinc-400 hover:text-white">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="text-zinc-400 hover:text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
          </>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-zinc-400 hover:text-white"
          title={collapsed ? 'הרחב טיימליין' : 'הצר טיימליין'}
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {collapsed && <div className="px-3 py-1 text-xs text-zinc-600">{tracks.video.length + tracks.audio.length + textOverlays.length} קליפים</div>}

      {!collapsed && <div className="flex flex-1 overflow-hidden">
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

            {/* Snap indicator */}
            {snapIndicator !== null && (
              <div style={{
                position: 'absolute', left: snapIndicator * pps, top: 20,
                width: 2, height: TRACK_HEIGHT * 3, backgroundColor: '#fbbf24',
                pointerEvents: 'none', opacity: 0.9
              }} />
            )}
          </div>
        </div>
      </div>}
    </div>
  );
}