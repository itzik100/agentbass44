import React, { useState, useRef, useCallback } from 'react';
import Toolbar from '@/components/studio/Toolbar';
import MediaPanel from '@/components/studio/MediaPanel';
import PreviewPanel from '@/components/studio/PreviewPanel';
import PropertiesPanel from '@/components/studio/PropertiesPanel';
import Timeline from '@/components/studio/Timeline';

export default function Studio() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tracks, setTracks] = useState({ video: [], audio: [] });
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textOverlays, setTextOverlays] = useState([]);
  const [activeFilter, setActiveFilter] = useState('none');
  const [zoom, setZoom] = useState(1);
  const duration = Math.max(
    ...tracks.video.map(c => c.start + c.duration),
    ...tracks.audio.map(c => c.start + c.duration),
    ...textOverlays.map(o => o.start + o.duration),
    10
  );

  const addMediaToTrack = useCallback((file) => {
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');
    const isImage = file.type.startsWith('image');
    const trackType = isAudio ? 'audio' : 'video';
    const existing = tracks[trackType];
    const lastEnd = existing.length > 0 ? Math.max(...existing.map(c => c.start + c.duration)) : 0;
    const newClip = {
      id: Date.now(),
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
      start: lastEnd,
      duration: isImage ? 5 : (isAudio ? 10 : 10),
      color: isAudio ? '#6366f1' : isImage ? '#10b981' : '#f59e0b',
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
      x: 50,
      y: 80,
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