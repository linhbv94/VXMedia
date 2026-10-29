import React, { useState, useEffect } from 'react';
import { MediaItem, AppLanguage } from '../types';
import { getSafeMediaSrc, startDragging } from '../services/tauri';
import { t } from '../services/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Copy,
  Scissors,
  Maximize2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface ViewerProps {
  item: MediaItem;
  currentIndex: number;
  totalCount: number;
  isMarked: boolean;
  markedCount: number;
  hudVisible: boolean;
  language: AppLanguage;
  isMiniPip?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleMark: () => void;
  onCopyMarked: () => void;
  onCutMarked: () => void;
  onToggleFullscreen: () => void;
  mediaFitMode?: 'scale_to_fit' | 'limit_file_size';
}

export const Viewer: React.FC<ViewerProps> = ({
  item,
  currentIndex,
  totalCount,
  isMarked,
  markedCount,
  hudVisible,
  language,
  isMiniPip = false,
  mediaFitMode = 'scale_to_fit',
  onPrev,
  onNext,
  onToggleMark,
  onCopyMarked,
  onCutMarked,
  onToggleFullscreen,
}) => {
  const i18n = t(language);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Load safe media source
  useEffect(() => {
    let isCancelled = false;
    setHasError(false);
    setRotation(0);
    setIsFlipped(false);

    getSafeMediaSrc(item.path).then((src) => {
      if (!isCancelled) {
        setImageSrc(src);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [item.path]);

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !(e.target as HTMLElement).closest('button, [role="button"], .glass-panel, [data-no-drag]')) {
      startDragging();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      {/* Media Viewport */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pb-20 pt-12 overflow-hidden pointer-events-none">
        {hasError ? (
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-3 text-center max-w-sm pointer-events-auto shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
              {i18n.corrupted_format}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {i18n.corrupted_desc}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={onPrev}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {i18n.prev}
              </button>
              <button
                onClick={onNext}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-semibold"
              >
                {i18n.next}
              </button>
            </div>
          </div>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={item.name}
            onError={() => setHasError(true)}
            style={{
              transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
              transition: 'transform 0.2s ease-out',
            }}
            className={
              mediaFitMode === 'limit_file_size'
                ? 'max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-auto shadow-2xl rounded-sm'
                : 'w-full h-full object-contain select-none pointer-events-auto shadow-2xl rounded-sm'
            }
          />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        )}
      </div>

      {/* Floating Bottom Action Bar (Part of HUD, with Info integrated in Center) */}
      <div
        data-hud-layer
        className={`absolute bottom-3 left-0 right-0 z-30 transition-all duration-200 pointer-events-none ${
          hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex justify-center px-4">
          {isMiniPip ? (
            /* MINI PIP IMAGE CONTROLS: COMPACT < [ 11 / 13 ] > FROSTED PILL */
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
              <span className="text-[11px] font-mono text-white/90 font-medium px-1">
                {currentIndex + 1} / {totalCount}
              </span>
              <button
                onClick={onNext}
                title={`${i18n.file_next} (→)`}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl px-3 h-12 flex items-center justify-between gap-3 max-w-4xl w-full shadow-2xl pointer-events-auto text-xs box-border">
              {/* Left: Prev / Next */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onPrev}
                  title={`${i18n.file_prev} (←)`}
                  className="h-8 flex items-center gap-1 px-2.5 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{i18n.file_prev}</span>
                </button>
                <button
                  onClick={onNext}
                  title={`${i18n.file_next} (→)`}
                  className="h-8 flex items-center gap-1 px-2.5 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span>{i18n.file_next}</span>
                  <ChevronRight className="w-4 h-4" />
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

              {/* Right: Mark, Copy/Cut, Rotate, Fullscreen */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Mark Toggle */}
                <button
                  onClick={onToggleMark}
                  title={`${i18n.mark} (M)`}
                  className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
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

                {/* Copy / Cut Marked */}
                {markedCount > 0 && (
                  <>
                    <button
                      onClick={onCopyMarked}
                      title={i18n.copy_marked_tooltip}
                      className="h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/30 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ({markedCount})</span>
                    </button>

                    <button
                      onClick={onCutMarked}
                      title={i18n.cut_marked_tooltip}
                      className="h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-300 dark:border-rose-500/30 transition-all"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Cut</span>
                    </button>
                  </>
                )}

                {/* Rotate Button */}
                <button
                  onClick={handleRotate}
                  title={i18n.rotate}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

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
          )}
        </div>
      </div>
    </div>
  );
};
