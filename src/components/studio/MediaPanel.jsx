import React, { useRef, useState } from 'react';
import { Upload, Film, Image, Music, Plus } from 'lucide-react';
import TTSPanel from './TTSPanel';
import AvatarPanel from './AvatarPanel';
import ScriptGenerator from './ScriptGenerator';
import SubtitlesPanel from './SubtitlesPanel';
import AudioPanel from './AudioPanel';
import StickerPanel from './StickerPanel';
import TemplatesPanel from './TemplatesPanel';
import LibraryPanel from './LibraryPanel';
import ImageGeneratorPanel from './ImageGeneratorPanel';

export default function MediaPanel({ mediaFiles, setMediaFiles, onAddToTrack, onAddAudioUrl, onAddVideoUrl, voiceProvider, onScriptNarration, onScriptSection, onScriptAll, audioClips, subtitles, setSubtitles, subtitleStyle, setSubtitleStyle, onAddSticker, onLoadTemplate, tracks, textOverlays }) {
  const inputRef = useRef();
  const [activeTab, setActiveTab] = useState('media');

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setMediaFiles(prev => [...prev, ...arr]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const getIcon = (type) => {
    if (type.startsWith('video')) return <Film className="w-5 h-5 text-amber-400" />;
    if (type.startsWith('audio')) return <Music className="w-5 h-5 text-indigo-400" />;
    return <Image className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="w-56 flex flex-col bg-zinc-900 border-r border-zinc-800 overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors ${
            activeTab === 'media'
              ? 'text-white border-b-2 border-violet-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          מדיה
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors ${
            activeTab === 'library'
              ? 'text-white border-b-2 border-violet-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ספריה
        </button>
      </div>

      {/* Media tab */}
      {activeTab === 'media' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <TemplatesPanel tracks={tracks} textOverlays={textOverlays} onLoadTemplate={onLoadTemplate} mediaFiles={mediaFiles} />
            <ScriptGenerator onAddNarration={onScriptNarration} onAddSection={onScriptSection} onAddAllToTimeline={onScriptAll} />
            <SubtitlesPanel audioClips={audioClips} subtitles={subtitles} setSubtitles={setSubtitles} subtitleStyle={subtitleStyle} setSubtitleStyle={setSubtitleStyle} />
            <AudioPanel onAddAudio={onAddAudioUrl} />
            <StickerPanel onAddSticker={onAddSticker} />
            <ImageGeneratorPanel onAddVideoUrl={onAddVideoUrl} />
            <AvatarPanel onAddVideo={onAddVideoUrl} voiceProvider={voiceProvider} />
            <TTSPanel onAddAudio={onAddAudioUrl} />

            <div
              className="mx-3 mt-3 border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer hover:border-violet-500 transition-colors"
              onClick={() => inputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-1" />
              <p className="text-xs text-zinc-500">גרור או לחץ להעלאה</p>
              <p className="text-xs text-zinc-600 mt-0.5">וידאו, תמונה, אודיו</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </div>

            <div className="px-2 pb-2 mt-2 space-y-1">
              {mediaFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer group"
                  onClick={() => onAddToTrack(file)}
                  title="לחץ להוספה ל-timeline"
                >
                  {getIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400 flex-shrink-0" />
                </div>
              ))}
              {mediaFiles.length === 0 && (
                <p className="text-xs text-zinc-600 text-center mt-4">אין קבצים עדיין</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Library tab */}
      {activeTab === 'library' && (
        <LibraryPanel onAddAudioUrl={onAddAudioUrl} onAddVideoUrl={onAddVideoUrl} />
      )}
    </div>
  );
}