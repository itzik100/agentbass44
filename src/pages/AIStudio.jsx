import React, { useState, useRef, useCallback } from 'react';
import ChatSidebar from '@/components/aistudio/ChatSidebar';
import Toolbar from '@/components/studio/Toolbar';
import MediaPanel from '@/components/studio/MediaPanel';
import PreviewPanel from '@/components/studio/PreviewPanel';
import PropertiesPanel from '@/components/studio/PropertiesPanel';
import Timeline from '@/components/studio/Timeline';
import { base44 } from '@/api/base44Client';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

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
  // Studio state with undo/redo
  const [mediaFiles, setMediaFiles] = useState([]);
  const {
    state: editorState,
    setState: setEditorState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo({ tracks: { video: [], audio: [] }, textOverlays: [] });

  const tracks = editorState.tracks;
  const textOverlays = editorState.textOverlays;

  const setTracks = useCallback((updater, skipHistory = false) => {
    setEditorState(s => ({
      ...s,
      tracks: typeof updater === 'function' ? updater(s.tracks) : updater,
    }), skipHistory);
  }, [setEditorState]);

  const setTextOverlays = useCallback((updater, skipHistory = false) => {
    setEditorState(s => ({
      ...s,
      textOverlays: typeof updater === 'function' ? updater(s.textOverlays) : updater,
    }), skipHistory);
  }, [setEditorState]);

  const [selectedClip, setSelectedClip] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [zoom, setZoom] = useState(1);
  const [subtitles, setSubtitles] = useState([]);
  const [subtitleStyle, setSubtitleStyle] = useState({
    fontSize: 24, color: '#ffffff', bold: false, fontFamily: 'Arial', x: 50, y: 88,
  });

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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    isPlaying, setIsPlaying, setCurrentTime, duration,
    onUndo: undo, onRedo: redo,
    onDelete: () => deleteClip(),
    selectedClip, zoom, setZoom,
  });

  // Studio handlers
  const addVideoUrl = useCallback(({ url, name, duration, type }) => {
    const existing = tracks.video;
    const lastEnd = existing.length > 0 ? Math.max(...existing.map(c => c.start + c.duration)) : 0;
    const newClip = {
      id: Date.now(),
      name,
      url,
      type: type || 'video',
      start: lastEnd,
      duration: duration || 10,
      color: '#7c3aed',
    };
    setTracks(prev => ({ ...prev, video: [...prev.video, newClip] }));
  }, [tracks]);

  const addAudioUrl = useCallback(({ url, name, duration }) => {
    const existing = tracks.audio;
    const lastEnd = existing.length > 0 ? Math.max(...existing.map(c => c.start + c.duration)) : 0;
    const newClip = {
      id: Date.now(),
      name,
      url,
      type: 'audio',
      start: lastEnd,
      duration: duration || 10,
      color: '#6366f1',
    };
    setTracks(prev => ({ ...prev, audio: [...prev.audio, newClip] }));
  }, [tracks]);

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

  const updateClip = useCallback((clipId, updates, addToHistory = true) => {
    setTracks(prev => ({
      video: prev.video.map(c => c.id === clipId ? { ...c, ...updates } : c),
      audio: prev.audio.map(c => c.id === clipId ? { ...c, ...updates } : c),
    }), !addToHistory);
    if (selectedClip?.id === clipId) setSelectedClip(prev => ({ ...prev, ...updates }));
  }, [selectedClip, setTracks]);

  const deleteClip = useCallback((clipId) => {
    const id = clipId || selectedClip?.id;
    if (!id) return;
    if (selectedClip?.trackType === 'text') {
      setTextOverlays(prev => prev.filter(o => o.id !== id));
    } else {
      setTracks(prev => ({
        video: prev.video.filter(c => c.id !== id),
        audio: prev.audio.filter(c => c.id !== id),
      }));
    }
    if (selectedClip?.id === id) setSelectedClip(null);
  }, [selectedClip, setTracks, setTextOverlays]);

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

  const updateTextOverlay = useCallback((id, updates, addToHistory = true) => {
    setTextOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o), !addToHistory);
    if (selectedClip?.id === id) setSelectedClip(prev => ({ ...prev, ...updates }));
  }, [selectedClip, setTextOverlays]);

  const deleteTextOverlay = useCallback((id) => {
    setTextOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedClip?.id === id) setSelectedClip(null);
  }, [selectedClip]);

  const loadTemplate = useCallback((data) => {
    setTracks({ video: data.video || [], audio: data.audio || [] });
    setTextOverlays(data.textOverlays || []);
    setSelectedClip(null);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const addSticker = useCallback((emoji) => {
    const overlay = {
      id: Date.now(),
      text: emoji,
      start: currentTime,
      duration: 3,
      x: 50, y: 50,
      fontSize: 48,
      color: '#ffffff',
      bold: false,
      type: 'text',
    };
    setTextOverlays(prev => [...prev, overlay]);
    setSelectedClip({ ...overlay, trackType: 'text' });
  }, [currentTime]);

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

  // Script generator handlers
  const handleScriptNarration = useCallback((narration) => {
    // Add narration as a placeholder audio clip (user can generate TTS from it separately)
    const existing = tracks.audio;
    const lastEnd = existing.length > 0 ? Math.max(...existing.map(c => c.start + c.duration)) : 0;
    setTracks(prev => ({
      ...prev,
      audio: [...prev.audio, {
        id: Date.now(), name: `קריינות: ${narration.slice(0, 30)}`,
        url: '', type: 'audio', start: lastEnd, duration: 10, color: '#6366f1',
        narrationText: narration,
      }]
    }));
  }, [tracks]);

  const handleScriptSection = useCallback((section) => {
    setTracks(prev => {
      const lastEnd = prev.video.length > 0 ? Math.max(...prev.video.map(c => c.start + c.duration)) : 0;
      const newClip = {
        id: Date.now(), name: section.title,
        url: '', type: 'image', start: lastEnd, duration: section.duration || 10,
        color: section.type === 'intro' ? '#7c3aed' : section.type === 'outro' ? '#10b981' : '#f59e0b',
      };
      return { ...prev, video: [...prev.video, newClip] };
    });
    // Add screen texts as overlays
    if (section.screen_texts?.length > 0) {
      setTextOverlays(prev => {
        const lastEnd = prev.length > 0 ? Math.max(...prev.map(o => o.start + o.duration)) : 0;
        const newOverlays = section.screen_texts.map((st, i) => ({
          id: Date.now() + i + 50,
          text: st.text, start: lastEnd + i * 2, duration: 3,
          x: 50, y: st.style === 'title' ? 50 : st.style === 'subtitle' ? 65 : 85,
          fontSize: st.style === 'title' ? 40 : st.style === 'subtitle' ? 28 : 20,
          color: st.style === 'caption' ? '#ffff00' : '#ffffff', bold: st.style === 'title', type: 'text',
        }));
        return [...prev, ...newOverlays];
      });
    }
  }, []);

  const handleScriptAll = useCallback((script) => {
    if (!script?.sections) return;
    let videoStart = tracks.video.length > 0 ? Math.max(...tracks.video.map(c => c.start + c.duration)) : 0;
    let audioStart = tracks.audio.length > 0 ? Math.max(...tracks.audio.map(c => c.start + c.duration)) : 0;
    const newVideos = [];
    const newAudios = [];
    const newTexts = [];

    script.sections.forEach((section, i) => {
      newVideos.push({
        id: Date.now() + i, name: section.title,
        url: '', type: 'image', start: videoStart, duration: section.duration || 10,
        color: section.type === 'intro' ? '#7c3aed' : section.type === 'outro' ? '#10b981' : '#f59e0b',
      });
      if (section.narration) {
        newAudios.push({
          id: Date.now() + i + 100, name: `קריינות: ${section.title}`,
          url: '', type: 'audio', start: audioStart, duration: section.duration || 10,
          color: '#6366f1', narrationText: section.narration,
        });
        audioStart += section.duration || 10;
      }
      if (section.screen_texts?.length > 0) {
        section.screen_texts.forEach((st, j) => {
          newTexts.push({
            id: Date.now() + i * 10 + j + 200, text: st.text,
            start: videoStart + j * 2, duration: 3,
            x: 50, y: st.style === 'title' ? 50 : st.style === 'subtitle' ? 65 : 85,
            fontSize: st.style === 'title' ? 40 : st.style === 'subtitle' ? 28 : 20,
            color: st.style === 'caption' ? '#ffff00' : '#ffffff', bold: st.style === 'title', type: 'text',
          });
        });
      }
      videoStart += section.duration || 10;
    });

    setTracks(prev => ({
      video: [...prev.video, ...newVideos],
      audio: [...prev.audio, ...newAudios],
    }));
    setTextOverlays(prev => [...prev, ...newTexts]);
  }, [tracks]);

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
      <Toolbar
        onAddText={addTextOverlay}
        onSplit={splitClip}
        selectedClip={selectedClip}
        tracks={tracks}
        textOverlays={[...textOverlays, ...subtitles.map(s => ({ ...s, ...subtitleStyle, id: s.id, type: 'text' }))]}
        duration={duration}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex flex-1 overflow-hidden">
        <MediaPanel
          mediaFiles={mediaFiles} setMediaFiles={setMediaFiles}
          onAddToTrack={addMediaToTrack} onAddAudioUrl={addAudioUrl}
          onAddVideoUrl={addVideoUrl} voiceProvider={voiceProvider}
          onScriptNarration={handleScriptNarration}
          onScriptSection={handleScriptSection}
          onScriptAll={handleScriptAll}
          audioClips={tracks.audio}
          subtitles={subtitles}
          setSubtitles={setSubtitles}
          subtitleStyle={subtitleStyle}
          setSubtitleStyle={setSubtitleStyle}
          onAddSticker={addSticker}
          onLoadTemplate={loadTemplate}
          tracks={tracks}
          textOverlays={textOverlays}
        />

        <PreviewPanel
          tracks={tracks}
          textOverlays={[...textOverlays, ...subtitles.map(s => ({ ...s, ...subtitleStyle, id: s.id, type: 'text' }))]}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          duration={duration}
          activeFilter={activeFilter}
          subtitleStyle={subtitleStyle}
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