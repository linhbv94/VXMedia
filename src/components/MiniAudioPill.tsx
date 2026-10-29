import React from 'react';
import { Music, Film, Play, Pause, SkipForward, ExternalLink } from 'lucide-react';
import { MediaItem, AppLanguage } from '../types';
import { t } from '../services/i18n';

interface MiniAudioPillProps {
  isPlaying: boolean;
  item: MediaItem | null;
  currentTime: number;
  duration: number;
  language?: AppLanguage;
  onTogglePlay: () => void;
  onNextTrack?: () => void;
  onJumpToAudioSession?: () => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const MiniAudioPill: React.FC<MiniAudioPillProps> = ({
  isPlaying,
  item,
  currentTime,
  duration,
  language = 'vi',
  onTogglePlay,
  onNextTrack,
  onJumpToAudioSession,
}) => {
  if (!item) return null;

  const i18n = t(language);
  const trackName = item.name.replace(/\.[^/.]+$/, '');
  const PlaybackIcon = item.media_type === 'video' ? Film : Music;

  return (
    <div
      data-no-drag
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className="fixed bottom-3 right-4 z-40 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl text-xs text-white select-none transition-all hover:bg-black/80 hover:border-cyan-400/50 group"
    >
      {/* Animated Music Icon */}
      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
        <PlaybackIcon className={`w-3 h-3 text-cyan-400 ${isPlaying ? 'animate-pulse' : 'opacity-60'}`} />
      </div>

      {/* Track Info */}
      <div className="flex flex-col max-w-[160px] truncate">
        <span className="font-medium text-slate-100 truncate text-[11px] leading-tight" title={trackName}>
          {trackName}
        </span>
        <span className="text-[10px] text-cyan-300/80 font-mono leading-tight">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        title={isPlaying ? i18n.pill_pause : i18n.pill_resume}
        className="p-1 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-white/15 transition-all active:scale-95 shrink-0"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-cyan-400" /> : <Play className="w-3.5 h-3.5 fill-cyan-400 ml-0.5" />}
      </button>

      {/* Next Track */}
      {onNextTrack && (
        <button
          onClick={onNextTrack}
          title={i18n.pill_next}
          className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition-all active:scale-95 shrink-0"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Jump to Audio Tab */}
      {onJumpToAudioSession && (
        <button
          onClick={onJumpToAudioSession}
          title={item.media_type === 'video' ? i18n.pill_open_video_tab : i18n.pill_open_audio_tab}
          className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/15 transition-all active:scale-95 shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
