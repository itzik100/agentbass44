import React, { useEffect, useRef } from 'react';

// Draws a fake-but-realistic waveform based on clip id as seed
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function AudioWaveform({ clip, width, height = 28 }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const bars = Math.floor(width / 3);
    const rand = seededRandom(clip.id || 1);
    const mid = height / 2;

    ctx.fillStyle = 'rgba(167, 139, 250, 0.7)'; // violet-400

    for (let i = 0; i < bars; i++) {
      const x = i * 3;
      // Smooth with previous value for realistic shape
      const h = (rand() * 0.7 + 0.15) * mid;
      ctx.fillRect(x, mid - h, 2, h * 2);
    }
  }, [width, height, clip.id]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', opacity: 0.8 }}
    />
  );
}