import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MediaItem, AudioMetadataResponse, ABLoopState, LoopFileMode, AppLanguage } from '../types';
import { getSafeMediaSrc, readAudioMetadata, startDragging } from '../services/tauri';
import { audioEngine } from '../services/audioEngine';
import { Timeline } from './Timeline';
import { t } from '../services/i18n';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Maximize2,
  Star,
  Copy,
  Scissors,
  Music,
} from 'lucide-react';

interface PlayerProps {
  item: MediaItem;
  currentIndex: number;
  totalCount: number;
  isMarked: boolean;
  markedCount: number;
  hudVisible: boolean;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  loopFileMode: LoopFileMode;
  seekShortSec: number;
  seekLongSec: number;
  abLoopCrossfadeMs: number;
  language: AppLanguage;
  isMiniPip?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleMark: () => void;
  onCopyMarked: () => void;
  onCutMarked: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleLoopFile: () => void;
  onToggleFullscreen: () => void;
  sharedAudioRef?: React.RefObject<HTMLAudioElement | null>;
  sharedVideoRef?: React.RefObject<HTMLVideoElement | null>;
  videoSessionId?: string;
  onVideoPlaybackChange?: (el: HTMLVideoElement) => void;
  onPlaylistNext?: () => void;
  isActive?: boolean;
  audioSessionId?: string;
  onAudioSourceChange?: (item: MediaItem, sessionId: string) => void;
  mediaFitMode?: 'scale_to_fit' | 'limit_file_size';
}

export const Player: React.FC<PlayerProps> = ({
  item,
  currentIndex,
  totalCount,
  isMarked,
  markedCount,
  hudVisible,
  volume,
  isMuted,
  shuffle,
  loopFileMode,
  seekShortSec,
  seekLongSec,
  abLoopCrossfadeMs,
  language,
  isMiniPip = false,
  mediaFitMode = 'scale_to_fit',
  isActive = true,
  audioSessionId,
  onAudioSourceChange,
  onPrev,
  onNext,
  onToggleMark,
  onCopyMarked,
  onCutMarked,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleLoopFile,
  onToggleFullscreen,
  sharedAudioRef,
  sharedVideoRef,
  videoSessionId,
  onVideoPlaybackChange,
  onPlaylistNext,
}) => {
  const i18n = t(language);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [resolvedSource, setResolvedSource] = useState<{ path: string; src: string } | null>(null);
  const mediaSrc = resolvedSource?.path === item.path ? resolvedSource.src : '';
  const [audioMeta, setAudioMeta] = useState<AudioMetadataResponse | null>(null);

  // A-B Loop State
  const [abLoop, setAbLoop] = useState<ABLoopState>({
    point_a: null,
    point_b: null,
    is_active: false,
    fade_duration_ms: abLoopCrossfadeMs,
  });

  const isAudio = item.media_type === 'audio';
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    mediaRef.current = el;
    if (sharedVideoRef) sharedVideoRef.current = el;
  }, [sharedVideoRef]);

  // Load safe source & audio metadata
  useEffect(() => {
    let isCancelled = false;

    // Reset A-B loop when switching media file
    setAbLoop({
      point_a: null,
      point_b: null,
      is_active: false,
      fade_duration_ms: abLoopCrossfadeMs,
    });

    const isSameAudioAlreadyPlaying =
      isAudio &&
      sharedAudioRef?.current &&
      sharedAudioRef.current.dataset.currentPath === item.path;

    if (isSameAudioAlreadyPlaying && sharedAudioRef?.current) {
      setCurrentTime(sharedAudioRef.current.currentTime);
      setDuration(sharedAudioRef.current.duration || 0);
      setIsPlaying(!sharedAudioRef.current.paused);
    } else {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }

    getSafeMediaSrc(item.path).then((src) => {
      if (!isCancelled) setResolvedSource({ path: item.path, src });
    }).catch(console.warn);

    if (isAudio) {
      readAudioMetadata(item.path).then((meta) => {
        if (!isCancelled) setAudioMeta(meta);
      }).catch(console.warn);
    } else {
      setAudioMeta(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [item.path, isAudio, abLoopCrossfadeMs, sharedAudioRef]);

  // Sync volume & mute to media element and audio engine
  useEffect(() => {
    if (isAudio && sharedAudioRef?.current) {
      mediaRef.current = sharedAudioRef.current;
    }
  }, [isAudio, sharedAudioRef]);

  useEffect(() => {
    const el = mediaRef.current;
    if (el) {
      el.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
      el.muted = isMuted;
      audioEngine.setVolume(volume, isMuted);
    }
  }, [volume, isMuted]);

  // Hook media element to Web Audio Engine & Autoplay on media source load
  useEffect(() => {
    const el = mediaRef.current;
    if (el && mediaSrc) {
      audioEngine.init(el);
      audioEngine.setVolume(volume, isMuted);

      // Only video autoplays here; audio using sharedAudioRef is managed in the dedicated effect below
      if (!isAudio || !sharedAudioRef) {
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              if (err.name !== 'AbortError') {
                console.warn('Autoplay prevented or failed:', err);
              }
              setIsPlaying(false);
            });
        }
      }
    }
  }, [mediaSrc, isAudio, sharedAudioRef]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(console.warn);
    } else {
      el.pause();
    }
  }, []);

  // Handle Seek Target
  const handleSeek = useCallback(
    (target: number) => {
      const el = mediaRef.current;
      if (!el || duration <= 0) return;
      const clamped = Math.max(0, Math.min(duration, target));
      el.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration]
  );

  // Seek short/long
  const seekRelative = useCallback(
    (seconds: number) => {
      const el = mediaRef.current;
      if (!el) return;
      handleSeek(el.currentTime + seconds);
    },
    [handleSeek]
  );


  // Time update listener & A-B Loop enforcement
  const onTimeUpdate = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    const now = el.currentTime;
    setCurrentTime(now);
    if (!isAudio) onVideoPlaybackChange?.(el as HTMLVideoElement);

    // Check A-B loop boundary
    if (
      abLoop.is_active &&
      abLoop.point_a !== null &&
      abLoop.point_b !== null &&
      now >= abLoop.point_b
    ) {
      const fadeMs = audioEngine.calculateFadeDurationMs(abLoop.point_a, abLoop.point_b);
      audioEngine.performLoopTransition(el, abLoop.point_a, volume, fadeMs);
    }
  }, [abLoop, volume, isAudio, onVideoPlaybackChange]);

  // On Ended
  const onEnded = useCallback(() => {
    if (loopFileMode === 'single') {
      const el = mediaRef.current;
      if (el) {
        el.currentTime = 0;
        el.play().catch(console.warn);
      }
    } else if (loopFileMode === 'all') {
      (onPlaylistNext || onNext)();
    } else {
      setIsPlaying(false);
    }
  }, [loopFileMode, onNext, onPlaylistNext]);

  // Wire up shared audio element listeners and source
  useEffect(() => {
    if (!isAudio || !sharedAudioRef?.current) return;
    const el = sharedAudioRef.current;
    mediaRef.current = el;

    const isSamePathAlreadyLoaded = el.dataset.currentPath === item.path;
    if (mediaSrc && audioSessionId) {
      el.dataset.originSessionId = audioSessionId;
      onAudioSourceChange?.(item, audioSessionId);
    }

    if (mediaSrc && !isSamePathAlreadyLoaded) {
      el.dataset.currentPath = item.path;
      el.src = mediaSrc;
      el.load();
      el.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err.name !== 'AbortError') console.warn(err);
          setIsPlaying(false);
        });
    } else if (isSamePathAlreadyLoaded) {
      // Sync progress & playing state directly from uninterrupted running element
      setCurrentTime(el.currentTime);
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
      setIsPlaying(!el.paused);
    }

    const handleLoadedMetadata = () => {
      setDuration(el.duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', handleLoadedMetadata);
    el.addEventListener('play', handlePlay);
    el.addEventListener('pause', handlePause);
    // App owns playlist completion; do not advance it a second time here.

    if (el.duration && !isNaN(el.duration)) {
      setDuration(el.duration);
    }
    setIsPlaying(!el.paused);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
      el.removeEventListener('play', handlePlay);
      el.removeEventListener('pause', handlePause);
    };
  }, [isAudio, sharedAudioRef, mediaSrc, item, audioSessionId, onAudioSourceChange, onTimeUpdate]);

  // Set Point A (Click again at unchanged position cancels A)
  const handleSetPointA = () => {
    if (abLoop.point_a !== null && Math.abs(currentTime - abLoop.point_a) < 0.25) {
      setAbLoop((prev) => ({
        ...prev,
        point_a: null,
        is_active: false,
      }));
      return;
    }

    setAbLoop((prev) => ({
      ...prev,
      point_a: currentTime,
      is_active: prev.point_b !== null && currentTime < prev.point_b,
      fade_duration_ms:
        prev.point_b !== null
          ? audioEngine.calculateFadeDurationMs(currentTime, prev.point_b)
          : prev.fade_duration_ms,
    }));
  };

  // Set Point B (Click again at unchanged position cancels B)
  const handleSetPointB = () => {
    if (abLoop.point_b !== null && Math.abs(currentTime - abLoop.point_b) < 0.25) {
      setAbLoop((prev) => ({
        ...prev,
        point_b: null,
        is_active: false,
      }));
      return;
    }

    if (abLoop.point_a === null) {
      if (currentTime <= 0.2) return;
      setAbLoop({
        point_a: 0,
        point_b: currentTime,
        is_active: true,
        fade_duration_ms: audioEngine.calculateFadeDurationMs(0, currentTime),
      });
      return;
    }

    let bVal = currentTime;
    if (bVal <= abLoop.point_a) {
      bVal = Math.min(duration, abLoop.point_a + 1.0);
    }

    const fadeMs = audioEngine.calculateFadeDurationMs(abLoop.point_a, bVal);
    setAbLoop((prev) => ({
      ...prev,
      point_b: bVal,
      is_active: true,
      fade_duration_ms: fadeMs,
    }));
  };

  // Drag Point A on timeline
  const handleDragPointA = (newA: number) => {
    setAbLoop((prev) => ({
      ...prev,
      point_a: newA,
      is_active: prev.point_b !== null && newA < prev.point_b,
      fade_duration_ms:
        prev.point_b !== null
          ? audioEngine.calculateFadeDurationMs(newA, prev.point_b)
          : prev.fade_duration_ms,
    }));
  };

  // Drag Point B on timeline
  const handleDragPointB = (newB: number) => {
    setAbLoop((prev) => ({
      ...prev,
      point_b: newB,
      is_active: prev.point_a !== null && newB > prev.point_a,
      fade_duration_ms:
        prev.point_a !== null
          ? audioEngine.calculateFadeDurationMs(prev.point_a, newB)
          : prev.fade_duration_ms,
    }));
  };

  // Toggle A-B Loop
  const handleToggleABLoop = () => {
    if (abLoop.point_a !== null && abLoop.point_b !== null) {
      setAbLoop((prev) => ({ ...prev, is_active: !prev.is_active }));
    }
  };

  // Render Loop File Button Icon/Label
  const renderLoopFileBtn = () => {
    switch (loopFileMode) {
      case 'single':
        return (
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            <Repeat1 className="w-4 h-4" />
            <span className="text-[11px] font-bold leading-none">1</span>
          </span>
        );
      case 'all':
        return (
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            <Repeat className="w-4 h-4" />
            <span className="text-[11px] font-bold leading-none">All</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400">
            <Repeat className="w-4 h-4" />
          </span>
        );
    }
  };

  // Listen to keyboard dispatcher events (0..9 jumps, arrows seek, space play, A-B loop)
  useEffect(() => {
    if (!isActive) return;
    const onSeekPercentEvt = (e: Event) => {
      const custom = e as CustomEvent<{ percent: number }>;
      if (custom.detail && duration > 0) {
        handleSeek(duration * custom.detail.percent);
      }
    };

    const onSeekRelativeEvt = (e: Event) => {
      const custom = e as CustomEvent<{ seconds: number }>;
      if (custom.detail) {
        seekRelative(custom.detail.seconds);
      }
    };

    const onTogglePlayEvt = () => {
      togglePlay();
    };

    const onSetPointAEvt = () => {
      handleSetPointA();
    };

    const onSetPointBEvt = () => {
      handleSetPointB();
    };

    const onToggleABLoopEvt = () => {
      handleToggleABLoop();
    };

    window.addEventListener('player:seek-percent', onSeekPercentEvt);
    window.addEventListener('player:seek-relative', onSeekRelativeEvt);
    window.addEventListener('player:toggle-play', onTogglePlayEvt);
    window.addEventListener('player:set-point-a', onSetPointAEvt);
    window.addEventListener('player:set-point-b', onSetPointBEvt);
    window.addEventListener('player:toggle-ab-loop', onToggleABLoopEvt);

    return () => {
      window.removeEventListener('player:seek-percent', onSeekPercentEvt);
      window.removeEventListener('player:seek-relative', onSeekRelativeEvt);
      window.removeEventListener('player:toggle-play', onTogglePlayEvt);
      window.removeEventListener('player:set-point-a', onSetPointAEvt);
      window.removeEventListener('player:set-point-b', onSetPointBEvt);
      window.removeEventListener('player:toggle-ab-loop', onToggleABLoopEvt);
    };
  }, [isActive, duration, handleSeek, seekRelative, togglePlay, currentTime, abLoop]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      e.button === 0 &&
      !target.closest('button, input, select, textarea, [role="button"], [role="slider"], video, .glass-panel, [data-no-drag]')
    ) {
      startDragging();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      {/* 1. MEDIA DISPLAY VIEWPORT */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {isAudio ? (
          /* AUDIO CARD VIEW */
          <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full glass-panel rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Spinning Vinyl Album Art */}
            <div className="relative w-44 h-44 rounded-full overflow-hidden shadow-2xl border-4 border-slate-700/60 bg-slate-950 flex items-center justify-center group">
              {audioMeta?.artwork_data_url ? (
                <img
                  src={audioMeta.artwork_data_url}
                  alt={audioMeta.title || item.name}
                  className={`w-full h-full object-cover ${
                    isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
                  }`}
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950/40 ${
                    isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
                  }`}
                >
                  <Music className="w-16 h-16 text-cyan-400/60" />
                </div>
              )}
              {/* Vinyl Center Hole */}
              <div className="absolute w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 shadow-inner" />
            </div>

            {/* Audio Info */}
            <div className="text-center space-y-1.5 w-full">
              <h2 className="text-lg font-bold tracking-tight truncate">
                {audioMeta?.title || item.name.replace(/\.[^/.]+$/, '')}
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate">
                {audioMeta?.artist || 'Unknown Artist'}
                {audioMeta?.album ? ` • ${audioMeta.album}` : ''}
                {audioMeta?.year ? ` (${audioMeta.year})` : ''}
              </p>
            </div>

            {!sharedAudioRef && (
              <audio
                ref={(el) => {
                  mediaRef.current = el;
                }}
                src={mediaSrc}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={() => {
                  if (mediaRef.current) setDuration(mediaRef.current.duration);
                }}
                onEnded={onEnded}
              />
            )}
          </div>
        ) : (
          /* VIDEO VIEW */
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={attachVideo}
              data-current-path={item.path}
              data-origin-session-id={videoSessionId}
              src={mediaSrc || undefined}
              onClick={togglePlay}
              onPlay={() => {
                setIsPlaying(true);
                if (sharedAudioRef?.current && !sharedAudioRef.current.paused) {
                  sharedAudioRef.current.pause();
                }
                if (sharedVideoRef?.current) onVideoPlaybackChange?.(sharedVideoRef.current);
              }}
              onPause={() => {
                setIsPlaying(false);
                if (sharedVideoRef?.current) onVideoPlaybackChange?.(sharedVideoRef.current);
              }}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={() => {
                if (mediaRef.current) setDuration(mediaRef.current.duration);
                if (sharedVideoRef?.current) onVideoPlaybackChange?.(sharedVideoRef.current);
              }}
              onEnded={onEnded}
              className={
                mediaFitMode === 'limit_file_size'
                  ? 'max-w-full max-h-full w-auto h-auto object-contain cursor-pointer select-none'
                  : 'w-full h-full object-contain cursor-pointer select-none'
              }
            />
          </div>
        )}
      </div>

      {/* 2. MINI PIP: COMPACT FROSTED PILL < [ ⏯ ] > (MATCHING VIEWER SIZE & PLACEMENT) */}
      {isMiniPip && (
        <div
          data-hud-layer
          className={`absolute bottom-3 left-0 right-0 z-30 transition-all duration-200 pointer-events-none ${
            hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex justify-center px-4">
            <div
              data-no-drag
              className="bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-2xl flex items-center gap-2 pointer-events-auto select-none"
            >
              <button
                onClick={onPrev}
                title={`${i18n.file_prev} (←)`}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                title={`${i18n.play_pause} (Space)`}
                className="p-1 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-white/20 transition-all active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-cyan-400" />
                ) : (
                  <Play className="w-4 h-4 fill-cyan-400 ml-0.5" />
                )}
              </button>
              <button
                onClick={onNext}
                title={`${i18n.file_next} (→)`}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MINI PIP: HAIRLINE THIN BOTTOM PROGRESS LINE (2px) */}
      {isMiniPip && (
        <div
          data-no-drag
          className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto"
        >
          <div
            className="w-full h-[2px] hover:h-[4px] transition-all duration-150 bg-black/40 cursor-pointer group relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.max(0, Math.min(1, clickX / rect.width));
              handleSeek(pct * duration);
            }}
          >
            <div className="w-full h-full bg-white/20 relative">
              <div
                className="h-full bg-cyan-400 group-hover:bg-cyan-300 transition-colors relative"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-xs transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULL WINDOW FLOATING CONTROL BAR (HUD) */}
      {!isMiniPip && (
        <div
          data-hud-layer
          className={`absolute bottom-4 left-0 right-0 z-30 transition-all duration-200 pointer-events-none ${
            hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex justify-center px-4">
            <div className="glass-panel rounded-2xl p-3 flex flex-col gap-2 max-w-4xl w-full shadow-2xl pointer-events-auto">
              {/* Timeline Progress */}
              <Timeline
                currentTime={currentTime}
                duration={duration}
                abLoop={abLoop}
                onSeek={handleSeek}
                onSetPointA={handleDragPointA}
                onSetPointB={handleDragPointB}
              />

              {/* ROW 1: PLAY/PAUSE, <<, <, >, >>, SHUFFLE, REPEAT, A, B, LOOP AB (LEFT) │ VOLUME (RIGHT) */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                {/* Left-Aligned Group: Play/Pause, Rewind/Forward, Shuffle, Repeat, A-B */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    title={i18n.play_pause}
                    className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md transition-all active:scale-95 mr-1"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-slate-950" />
                    ) : (
                      <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                    )}
                  </button>

                  {/* << (-5s) */}
                  <button
                    onClick={() => seekRelative(-seekLongSec)}
                    title={i18n.rewind_5s}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* < (-1s) */}
                  <button
                    onClick={() => seekRelative(-seekShortSec)}
                    title={i18n.rewind_1s}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* > (+1s) */}
                  <button
                    onClick={() => seekRelative(seekShortSec)}
                    title={i18n.forward_1s}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* >> (+5s) */}
                  <button
                    onClick={() => seekRelative(seekLongSec)}
                    title={i18n.forward_5s}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-1"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>

                  {/* Shuffle */}
                  <button
                    onClick={onToggleShuffle}
                    title={i18n.shuffle}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                      shuffle
                        ? 'text-cyan-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Repeat / Loop File */}
                  <button
                    onClick={onCycleLoopFile}
                    title={i18n.loop_file}
                    className="p-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center"
                  >
                    {renderLoopFileBtn()}
                  </button>

                  {/* A-B Loop Group */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/30 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5 ml-1">
                    <button
                      onClick={handleSetPointA}
                      title={i18n.set_a}
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-100 dark:bg-cyan-500/20 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 text-cyan-800 dark:text-cyan-300 transition-colors"
                    >
                      A {abLoop.point_a !== null ? `(${abLoop.point_a.toFixed(1)}s)` : ''}
                    </button>

                    <button
                      onClick={handleSetPointB}
                      title={i18n.set_b}
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 transition-colors"
                    >
                      B {abLoop.point_b !== null ? `(${abLoop.point_b.toFixed(1)}s)` : ''}
                    </button>

                    <button
                      onClick={handleToggleABLoop}
                      disabled={abLoop.point_a === null || abLoop.point_b === null}
                      title={i18n.toggle_ab}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        abLoop.is_active
                          ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30'
                      }`}
                    >
                      AB {abLoop.is_active ? `(${abLoop.fade_duration_ms}ms)` : 'Off'}
                    </button>
                  </div>
                </div>

                {/* Right-Aligned Group: Volume (Loa + Slider) */}
                <div className="flex items-center gap-1.5 shrink-0 pl-3">
                  <button
                    onClick={onToggleMute}
                    title={`${i18n.hk_mute} (Shift+M)`}
                    className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-16 accent-cyan-600 dark:accent-cyan-400 h-1 bg-slate-300 dark:bg-slate-700/60 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              {/* ROW 2: PREV/NEXT FILE (LEFT) │ INFO TÊN FILE & STT (CENTER) │ MARK & FULLSCREEN (RIGHT) */}
              <div className="h-9 flex items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-white/5 text-xs">
                {/* Left: Prev / Next File */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={onPrev}
                    title={`${i18n.file_prev} (Cmd/Ctrl + ←)`}
                    className="h-8 flex items-center gap-1 px-2.5 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{i18n.file_prev}</span>
                  </button>

                  <button
                    onClick={onNext}
                    title={`${i18n.file_next} (Cmd/Ctrl + →)`}
                    className="h-8 flex items-center gap-1 px-2.5 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <span>{i18n.file_next}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center: File Info (Tên file & Số thứ tự) */}
                <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2 font-mono text-[11px] h-8">
                  <span className="truncate max-w-[260px] md:max-w-md text-slate-800 dark:text-slate-200 font-semibold">
                    🏷️ {item.name}
                  </span>
                  <span className="shrink-0 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
                    [ {currentIndex + 1} / {totalCount} ]
                  </span>
                </div>

                {/* Right: Mark, Copy/Cut, Fullscreen */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={onToggleMark}
                    title={`${i18n.mark} (M)`}
                    className={`h-8 flex items-center gap-1 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      isMarked
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 border-transparent hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isMarked ? 'text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span>{isMarked ? i18n.marked : i18n.mark}</span>
                  </button>

                  {markedCount > 0 && (
                    <>
                      <button
                        onClick={onCopyMarked}
                        title={i18n.copy_marked_tooltip}
                        className="h-8 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/30 transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy ({markedCount})</span>
                      </button>

                      <button
                        onClick={onCutMarked}
                        title={i18n.cut_marked_tooltip}
                        className="h-8 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-300 dark:border-rose-500/30 transition-all"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Cut</span>
                      </button>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={onToggleFullscreen}
                    title={`${i18n.fullscreen} (F)`}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
