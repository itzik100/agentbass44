import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const FILTERS = {
  none: '',
  bright: 'brightness(1.3)',
  contrast: 'contrast(1.4)',
  grayscale: 'grayscale(1)',
  sepia: 'sepia(0.8)',
  warm: 'sepia(0.3) saturate(1.5)',
  cold: 'hue-rotate(180deg) saturate(0.8)',
  blur: 'blur(2px)',
  vivid: 'saturate(2)',
};

export default function PreviewPanel({
  tracks, textOverlays, currentTime, setCurrentTime,
  isPlaying, setIsPlaying, duration, activeFilter
}) {
  const videoRef = useRef();
  const intervalRef = useRef();
  const canvasRef = useRef();

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Find current video clip
  const currentVideoClip = tracks.video.find(
    c => c.type !== 'audio' && currentTime >= c.start && currentTime < c.start + c.duration
  );

  // Active text overlays at current time
  const activeTexts = textOverlays.filter(
    o => currentTime >= o.start && currentTime < o.start + o.duration
  );

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) { setIsPlaying(false); return 0; }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Preview Area */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
        style={{ width: '640px', height: '360px' }}>
        {currentVideoClip ? (
          currentVideoClip.type === 'image' ? (
            <img
              src={currentVideoClip.url}
              className="w-full h-full object-contain"
              style={{ filter: FILTERS[activeFilter] || '' }}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentVideoClip.url}
              className="w-full h-full object-contain"
              style={{ filter: FILTERS[activeFilter] || '' }}
              muted
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-zinc-600 text-sm">הוסף מדיה ל-timeline</p>
          </div>
        )}

        {/* Text Overlays */}
        {activeTexts.map(overlay => (
          <div
            key={overlay.id}
            className="absolute pointer-events-none"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              fontWeight: overlay.bold ? 'bold' : 'normal',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
            }}
          >
            {overlay.text}
          </div>
        ))}

        {/* Filter overlay label */}
        {activeFilter !== 'none' && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
            {activeFilter}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 w-full max-w-2xl px-4">
        {/* Seekbar */}
        <div
          className="w-full h-2 bg-zinc-700 rounded-full cursor-pointer relative mb-3"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-violet-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
          />
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button onClick={() => setCurrentTime(0)} className="text-zinc-400 hover:text-white">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="w-10 h-10 bg-violet-600 hover:bg-violet-700 rounded-full flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={() => setCurrentTime(duration)} className="text-zinc-400 hover:text-white">
            <SkipForward className="w-5 h-5" />
          </button>
          <span className="text-xs text-zinc-400 ml-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}