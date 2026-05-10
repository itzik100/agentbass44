import React, { useState, useRef, useCallback } from 'react';
import ChatSidebar from '@/components/aistudio/ChatSidebar';
import Toolbar from '@/components/studio/Toolbar';
import MediaPanel from '@/components/studio/MediaPanel';
import PreviewPanel from '@/components/studio/PreviewPanel';
import PropertiesPanel from '@/components/studio/PropertiesPanel';
import Timeline from '@/components/studio/Timeline';
import { base44 } from '@/api/base44Client';

const PIPELINE_STAGES = [
  { id: 'instruction', label: 'הוראה', icon: '📋' },
  { id: 'script', label: 'תסריט', icon: '📝' },
  { id: 'review', label: 'בדיקה', icon: '🔍' },
  { id: 'broll', label: 'B-roll', icon: '🎬' },
  { id: 'voice', label: 'קולות', icon: '🎙️' },
  { id: 'character', label: 'דמויות', icon: '🧑‍💻' },
  { id: 'assemble', label: 'הרכבה', icon: '🎞️' },
  { id: 'render', label: 'רינדור', icon: '⚙️' },
  { id: 'done', label: 'מוכן', icon: '✅' },
];

export default function AIStudio() {
  // Studio state
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tracks, setTracks] = useState({ video: [], audio: [] });
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textOverlays, setTextOverlays] = useState([]);
  const [activeFilter, setActiveFilter] = useState('none');
  const [zoom, setZoom] = useState(1);

  // AI Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 שלום! אני הבמאי AI שלך.\n\nספר לי איזה וידאו ליצור - ואני אייצר הכל אוטומטית ואוסיף לעורך.' }
  ]);
  const [activeStage, setActiveStage] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState('elevenlabs');

  const duration = Math.max(
    ...tracks.video.map(c => c.start + c.duration),
    ...tracks.audio.map(c => c.start + c.duration),
    ...textOverlays.map(o => o.start + o.duration),
    10
  );

  // Studio handlers
  const addMediaToTrack = useCallback((file) => {
    const isAudio = file.type.startsWith('audio');
    const trackType = isAudio ? 'audio' : 'video';
    const existing = tracks[trackType];
    const lastEnd = existing.length > 0 ? Math.max(...existing.map(c => c.start + c.duration)) : 0;
    const newClip = {
      id: Date.now(),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : isAudio ? 'audio' : 'image',
      start: lastEnd,
      duration: file.type.startsWith('image') ? 5 : 10,
      color: isAudio ? '#6366f1' : file.type.startsWith('image') ? '#10b981' : '#f59e0b',
    };
    setTracks(prev => ({ ...prev, [trackType]: [...prev[trackType], newClip] }));
  }, [tracks]);

  const updateClip = useCallback((clipId, updates) => {
    setTracks(prev => ({
      video: prev.video.map(c => c.id === clipId ? { ...c, ...updates } : c),
      audio: prev.audio.map(c => c.id === clipId ? { ...c, ...updates } : c),
    }));
    if (selectedClip?.id === clipId) setSelectedClip(prev => ({ ...prev, ...updates }));
  }, [selectedClip]);

  const deleteClip = useCallback((clipId) => {
    setTracks(prev => ({
      video: prev.video.filter(c => c.id !== clipId),
      audio: prev.audio.filter(c => c.id !== clipId),
    }));
    if (selectedClip?.id === clipId) setSelectedClip(null);
  }, [selectedClip]);

  const addTextOverlay = useCallback(() => {
    const overlay = {
      id: Date.now(),
      text: 'טקסט חדש',
      start: currentTime,
      duration: 3,
      x: 50, y: 80,
      fontSize: 32,
      color: '#ffffff',
      bold: false,
      type: 'text',
    };
    setTextOverlays(prev => [...prev, overlay]);
    setSelectedClip({ ...overlay, trackType: 'text' });
  }, [currentTime]);

  const updateTextOverlay = useCallback((id, updates) => {
    setTextOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    if (selectedClip?.id === id) setSelectedClip(prev => ({ ...prev, ...updates }));
  }, [selectedClip]);

  const deleteTextOverlay = useCallback((id) => {
    setTextOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedClip?.id === id) setSelectedClip(null);
  }, [selectedClip]);

  const splitClip = useCallback(() => {
    if (!selectedClip || selectedClip.trackType === 'text') return;
    const clip = [...tracks.video, ...tracks.audio].find(c => c.id === selectedClip.id);
    if (!clip) return;
    const splitPoint = currentTime - clip.start;
    if (splitPoint <= 0 || splitPoint >= clip.duration) return;
    const trackType = tracks.video.find(c => c.id === clip.id) ? 'video' : 'audio';
    const firstHalf = { ...clip, duration: splitPoint };
    const secondHalf = { ...clip, id: Date.now(), start: clip.start + splitPoint, duration: clip.duration - splitPoint };
    setTracks(prev => ({
      ...prev,
      [trackType]: prev[trackType].map(c => c.id === clip.id ? firstHalf : c).concat(secondHalf),
    }));
  }, [selectedClip, tracks, currentTime]);

  // AI pipeline handler - adds results to studio timeline
  const addMessage = (role, content) => setMessages(prev => [...prev, { role, content }]);

  const runPipeline = async (instruction) => {
    if (isRunning) return;
    setIsRunning(true);
    setCompletedStages(['instruction']);
    setActiveStage('script');
    addMessage('user', instruction);
    addMessage('assistant', '🚀 **מתחיל pipeline...**\n\nמייצר תסריט, קול, B-roll ומוסיף לעורך אוטומטית.');

    try {
      const res = await base44.functions.invoke('videoPipeline', { instruction, voiceProvider });
      const data = res.data;

      if (data.success) {
        setCompletedStages(data.stagesDone || PIPELINE_STAGES.map(s => s.id));
        setActiveStage('done');

        // Auto-populate timeline from assembly
        if (data.assembly?.timeline) {
          const newVideoClips = [];
          const newTextOverlays = [];
          let t = 0;
          data.assembly.timeline.forEach((item, i) => {
            if (item.type === 'text') {
              newTextOverlays.push({
                id: Date.now() + i,
                text: item.content || 'כותרת',
                start: t, duration: item.duration,
                x: 50, y: 80, fontSize: 32, color: '#ffffff', bold: false, type: 'text',
              });
            } else {
              newVideoClips.push({
                id: Date.now() + i + 100,
                name: `${item.type} - ${item.content?.slice(0, 20) || ''}`,
                url: '', type: 'image',
                start: t, duration: item.duration,
                color: item.type === 'presenter' ? '#7c3aed' : '#f59e0b',
              });
            }
            t += item.duration;
          });
          setTracks(prev => ({ ...prev, video: [...prev.video, ...newVideoClips] }));
          setTextOverlays(prev => [...prev, ...newTextOverlays]);
        }

        // Add subtitles
        if (data.assembly?.subtitles) {
          const subs = data.assembly.subtitles.map((s, i) => ({
            id: Date.now() + i + 200,
            text: s.text,
            start: s.start, duration: s.end - s.start,
            x: 50, y: 90, fontSize: 24, color: '#ffff00', bold: false, type: 'text',
          }));
          setTextOverlays(prev => [...prev, ...subs]);
        }

        addMessage('assistant', `✅ **הוידאו נוסף לעורך!**\n\n📋 **${data.script?.title}**\n⏱️ ${data.script?.duration_seconds}s\n🔍 ציון: ${data.review?.score}/10\n🎬 ${data.broll?.length || 0} B-roll\n\nהטיימליין עודכן עם ${data.assembly?.timeline?.length || 0} קטעים.`);
      } else {
        setActiveStage(data.stage);
        addMessage('assistant', `❌ **שגיאה בשלב: ${data.stage}**\n\n${data.error}`);
      }
    } catch (err) {
      addMessage('assistant', `❌ **שגיאת חיבור**\n\n${err.message}`);
    }
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      <Toolbar onAddText={addTextOverlay} onSplit={splitClip} selectedClip={selectedClip} />

      <div className="flex flex-1 overflow-hidden">
        <MediaPanel mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} onAddToTrack={addMediaToTrack} />

        <PreviewPanel
          tracks={tracks}
          textOverlays={textOverlays}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          duration={duration}
          activeFilter={activeFilter}
        />

        <PropertiesPanel
          selectedClip={selectedClip}
          onUpdateClip={updateClip}
          onUpdateText={updateTextOverlay}
          onDeleteClip={deleteClip}
          onDeleteText={deleteTextOverlay}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {/* AI Chat - narrow sidebar */}
        <ChatSidebar
          messages={messages}
          isRunning={isRunning}
          onSend={runPipeline}
          voiceProvider={voiceProvider}
          setVoiceProvider={setVoiceProvider}
          stages={PIPELINE_STAGES}
          activeStage={activeStage}
          completedStages={completedStages}
        />
      </div>

      <Timeline
        tracks={tracks}
        textOverlays={textOverlays}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        duration={duration}
        zoom={zoom}
        setZoom={setZoom}
        selectedClip={selectedClip}
        setSelectedClip={setSelectedClip}
        onUpdateClip={updateClip}
        onDeleteClip={deleteClip}
        onUpdateText={updateTextOverlay}
        onDeleteText={deleteTextOverlay}
      />
    </div>
  );
}