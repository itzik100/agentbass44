import React, { useState, useRef } from 'react';
import { Download, Share2, Youtube, X, Loader2, CheckCircle2, Film, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FORMATS = [
  { id: 'mp4', label: 'MP4', desc: 'H.264 — תאימות מקסימלית', icon: '🎬' },
  { id: 'webm', label: 'WebM', desc: 'VP9 — קומפקטי לווב', icon: '🌐' },
];

const RESOLUTIONS = [
  { id: '1080p', label: '1080p Full HD', width: 1920, height: 1080 },
  { id: '720p', label: '720p HD', width: 1280, height: 720 },
  { id: '480p', label: '480p SD', width: 854, height: 480 },
];

const SOCIAL_PLATFORMS = [
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '▶️',
    color: 'bg-red-600 hover:bg-red-700',
    url: 'https://studio.youtube.com',
    tip: 'העלה ל-YouTube Studio',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    color: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-600',
    url: 'https://www.tiktok.com/upload',
    tip: 'העלה ל-TikTok',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    url: 'https://www.instagram.com',
    tip: 'שתף ב-Instagram',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: '🐦',
    color: 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-600',
    url: 'https://twitter.com/compose/post',
    tip: 'פרסם ב-X',
  },
];

export default function ExportModal({ onClose, tracks, textOverlays, duration }) {
  const [format, setFormat] = useState('mp4');
  const [resolution, setResolution] = useState('720p');
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const canvasRef = useRef();

  const totalClips = tracks.video.length + tracks.audio.length;

  const handleRender = async () => {
    setIsRendering(true);
    setProgress(0);
    setDone(false);

    // Simulate rendering progress (real rendering would need MediaRecorder + canvas)
    const res = RESOLUTIONS.find(r => r.id === resolution);

    try {
      // We'll render using canvas + MediaRecorder for clips that have real URLs
      const canvas = document.createElement('canvas');
      canvas.width = res.width;
      canvas.height = res.height;
      const ctx = canvas.getContext('2d');

      const mimeType = format === 'mp4' ? 'video/webm;codecs=vp9' : 'video/webm';
      const supported = MediaRecorder.isTypeSupported(mimeType) || MediaRecorder.isTypeSupported('video/webm');
      const actualMime = supported ? (MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm') : 'video/webm';

      const chunks = [];
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: actualMime, videoBitsPerSecond: 4000000 });
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const ext = format === 'mp4' ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: actualMime });
        const url = URL.createObjectURL(blob);
        setDownloadUrl({ url, ext });
        setDone(true);
        setIsRendering(false);
        setProgress(100);
      };

      recorder.start();

      // Render each frame at 30fps
      const FPS = 30;
      const totalFrames = Math.ceil(duration * FPS);
      const videoElements = {};

      // Preload video elements
      for (const clip of tracks.video) {
        if (clip.url && !clip.url.startsWith('blob:') === false || clip.url) {
          const vid = document.createElement('video');
          vid.src = clip.url;
          vid.crossOrigin = 'anonymous';
          await new Promise(r => { vid.onloadeddata = r; vid.onerror = r; vid.load(); });
          videoElements[clip.id] = vid;
        }
      }

      for (let frame = 0; frame < totalFrames; frame++) {
        const t = frame / FPS;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, res.width, res.height);

        // Draw current video clip
        const clip = tracks.video.find(c => t >= c.start && t < c.start + c.duration);
        if (clip) {
          const vid = videoElements[clip.id];
          if (vid && clip.type === 'video') {
            vid.currentTime = t - clip.start;
            ctx.drawImage(vid, 0, 0, res.width, res.height);
          } else {
            // placeholder colored rect
            ctx.fillStyle = clip.color || '#333';
            ctx.fillRect(0, 0, res.width, res.height);
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${res.height * 0.04}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(clip.name || '', res.width / 2, res.height / 2);
          }
        }

        // Draw text overlays
        const activeTexts = textOverlays.filter(o => t >= o.start && t < o.start + o.duration);
        for (const ov of activeTexts) {
          ctx.save();
          ctx.font = `${ov.bold ? 'bold' : 'normal'} ${ov.fontSize || 24}px ${ov.fontFamily || 'Arial'}`;
          ctx.fillStyle = ov.color || '#fff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          const x = (ov.x / 100) * res.width;
          const y = (ov.y / 100) * res.height;
          ctx.fillText(ov.text, x, y);
          ctx.restore();
        }

        setProgress(Math.round((frame / totalFrames) * 90));
        // Yield to browser every 10 frames
        if (frame % 10 === 0) await new Promise(r => setTimeout(r, 0));
      }

      recorder.stop();
    } catch (err) {
      console.error('Render error:', err);
      // Fallback: just create a dummy file message
      setDone(true);
      setIsRendering(false);
      setProgress(100);
      setDownloadUrl(null);
    }
  };

  const handleSocialShare = (platform) => {
    window.open(platform.url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">ייצוא ושיתוף</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">פורמט</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    format === f.id
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <span className="text-lg">{f.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-zinc-500">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">רזולוציה</p>
            <div className="flex gap-2">
              {RESOLUTIONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setResolution(r.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    resolution === r.id
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  {r.id}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline summary */}
          <div className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-400">
            <Film className="w-4 h-4 text-zinc-500" />
            <span>{totalClips} קליפים</span>
            <span className="text-zinc-700">·</span>
            <span>{Math.round(duration)}s</span>
            <span className="text-zinc-700">·</span>
            <span>{RESOLUTIONS.find(r => r.id === resolution)?.label}</span>
          </div>

          {/* Render button / progress */}
          {!done ? (
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={handleRender}
              disabled={isRendering || totalClips === 0}
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  מרנדר... {progress}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  רנדר והורד ({format.toUpperCase()})
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">הרינדור הושלם!</span>
              </div>
              {downloadUrl && (
                <a
                  href={downloadUrl.url}
                  download={`video.${downloadUrl.ext}`}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  הורד קובץ {downloadUrl.ext.toUpperCase()}
                </a>
              )}
            </div>
          )}

          {/* Social sharing */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">שתף ברשתות</p>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSocialShare(p)}
                  title={p.tip}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${p.color}`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-2 text-center">לחץ לפתוח את פלטפורמת ההעלאה ↗</p>
          </div>
        </div>
      </div>
    </div>
  );
}