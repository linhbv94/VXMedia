import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ZoomIn,
  ZoomOut,
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

  // High-level UI states (synced lightly for badges & HUD)
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoomOsdVisible, setZoomOsdVisible] = useState<boolean>(false);

  // Direct DOM & Coordinates Refs for 60-120fps stutter-free performance
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const scaleRef = useRef<number>(1.0);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number }>({
    mouseX: 0,
    mouseY: 0,
    panX: 0,
    panY: 0,
  });

  // RAF & Trackpad Panning Stream Refs
  const rafIdRef = useRef<number | null>(null);
  const isTrackpadPanningRef = useRef(false);
  const trackpadPanTimeoutRef = useRef<any>(null);
  const syncStateTimeoutRef = useRef<any>(null);
  const zoomOsdTimerRef = useRef<any>(null);

  // Directly apply CSS transform onto image element without React re-render lag
  const applyTransform = useCallback((animate = false) => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = animate ? 'transform 0.15s ease-out' : 'none';
    img.style.transform = `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0px) scale(${scaleRef.current}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`;
  }, [rotation, isFlipped]);

  // Schedule a single RAF frame to flush DOM transforms
  const scheduleUpdate = useCallback(() => {
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      applyTransform(false);
      rafIdRef.current = null;
    });
  }, [applyTransform]);

  // Debounced React state sync for UI badges without blocking 120fps gesture stream
  const scheduleStateSync = useCallback(() => {
    if (syncStateTimeoutRef.current) {
      clearTimeout(syncStateTimeoutRef.current);
    }
    syncStateTimeoutRef.current = setTimeout(() => {
      setScale(scaleRef.current);
      setPan({ ...panRef.current });
    }, 60);
  }, []);

  // Load safe media source & reset zoom/pan on file change
  useEffect(() => {
    let isCancelled = false;
    setHasError(false);
    setRotation(0);
    setIsFlipped(false);

    scaleRef.current = 1.0;
    panRef.current = { x: 0, y: 0 };
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    setZoomOsdVisible(false);
    applyTransform(false);

    getSafeMediaSrc(item.path).then((src) => {
      if (!isCancelled) {
        setImageSrc(src);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [item.path, applyTransform]);

  const showZoomOsd = useCallback(() => {
    setZoomOsdVisible(true);
    if (zoomOsdTimerRef.current) {
      clearTimeout(zoomOsdTimerRef.current);
    }
    zoomOsdTimerRef.current = setTimeout(() => {
      setZoomOsdVisible(false);
    }, 1200);
  }, []);

  // Measure actual rendered size of the image relative to viewport padding
  const getImageRenderSize = useCallback(() => {
    const viewport = viewportRef.current;
    const img = imgRef.current;
    if (!viewport || !img || !img.naturalWidth || !img.naturalHeight) {
      return { width: 0, height: 0, containerWidth: 0, containerHeight: 0 };
    }
    const cw = viewport.clientWidth;
    const ch = viewport.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const containerRatio = cw / ch;
    const imageRatio = nw / nh;

    let renderWidth = cw;
    let renderHeight = ch;

    if (imageRatio > containerRatio) {
      renderWidth = cw;
      renderHeight = cw / imageRatio;
    } else {
      renderHeight = ch;
      renderWidth = ch * imageRatio;
    }

    if (mediaFitMode === 'limit_file_size') {
      renderWidth = Math.min(renderWidth, nw);
      renderHeight = Math.min(renderHeight, nh);
    }

    return {
      width: renderWidth,
      height: renderHeight,
      containerWidth: cw,
      containerHeight: ch,
    };
  }, [mediaFitMode]);

  // Boundary clamping to prevent image from escaping viewport
  const clampPan = useCallback(
    (targetX: number, targetY: number, targetScale: number) => {
      if (targetScale <= 1.0) {
        return { x: 0, y: 0 };
      }
      const { width, height, containerWidth, containerHeight } = getImageRenderSize();
      if (width === 0 || height === 0) {
        return { x: targetX, y: targetY };
      }

      const scaledW = width * targetScale;
      const scaledH = height * targetScale;

      const maxPanX = Math.max(0, (scaledW - containerWidth) / 2);
      const maxPanY = Math.max(0, (scaledH - containerHeight) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, targetX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, targetY)),
      };
    },
    [getImageRenderSize]
  );

  // Zoom centered at a focal point (clientX, clientY)
  const zoomAtPoint = useCallback(
    (newScale: number, clientX: number, clientY: number, animate = false) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const currentScale = scaleRef.current;
      const currentPan = panRef.current;

      const clampedScale = Math.max(1.0, Math.min(10.0, newScale));

      if (clampedScale <= 1.0) {
        scaleRef.current = 1.0;
        panRef.current = { x: 0, y: 0 };
        setScale(1.0);
        setPan({ x: 0, y: 0 });
        applyTransform(animate);
        showZoomOsd();
        return;
      }

      const cursorX = clientX - (rect.left + rect.width / 2);
      const cursorY = clientY - (rect.top + rect.height / 2);

      const ratio = clampedScale / currentScale;
      const targetPanX = cursorX - (cursorX - currentPan.x) * ratio;
      const targetPanY = cursorY - (cursorY - currentPan.y) * ratio;

      const clampedPan = clampPan(targetPanX, targetPanY, clampedScale);

      scaleRef.current = clampedScale;
      panRef.current = clampedPan;

      if (animate) {
        applyTransform(true);
        setScale(clampedScale);
        setPan(clampedPan);
      } else {
        scheduleUpdate();
        scheduleStateSync();
      }
      showZoomOsd();
    },
    [clampPan, applyTransform, scheduleUpdate, scheduleStateSync, showZoomOsd]
  );

  // Reset zoom to 100% Fit with smooth transition
  const handleResetZoom = useCallback(() => {
    scaleRef.current = 1.0;
    panRef.current = { x: 0, y: 0 };
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    applyTransform(true);
    showZoomOsd();
  }, [applyTransform, showZoomOsd]);

  // Zoom In button (+25%) with animation
  const handleZoomIn = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(scaleRef.current * 1.25, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  }, [zoomAtPoint]);

  // Zoom Out button (-25%) with animation
  const handleZoomOut = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(scaleRef.current / 1.25, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  }, [zoomAtPoint]);

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  // Re-apply transform when rotation changes
  useEffect(() => {
    applyTransform(true);
  }, [rotation, applyTransform]);

  // Double click: toggle between Fit (1.0x) and 2.0x at cursor
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, [role="button"], .glass-panel, [data-no-drag]')) {
      return;
    }
    if (scaleRef.current > 1.0) {
      handleResetZoom();
    } else {
      zoomAtPoint(2.0, e.clientX, e.clientY, true);
    }
  };

  // Mouse Down: Start dragging image if scale > 1.0, otherwise drag Tauri window
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, [role="button"], .glass-panel, [data-no-drag]')) {
      return;
    }

    if (scaleRef.current > 1.0) {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
    } else {
      startDragging();
    }
  };

  // Global mouse move & up listeners for smooth mouse dragging pan
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const targetX = dragStartRef.current.panX + dx;
      const targetY = dragStartRef.current.panY + dy;
      panRef.current = clampPan(targetX, targetY, scaleRef.current);
      scheduleUpdate();
      scheduleStateSync();
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [clampPan, scheduleUpdate, scheduleStateSync]);

  // Wheel listener with { passive: false }
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-hud-layer], button, [role="button"], .glass-panel')) {
        return;
      }

      e.preventDefault();

      // 1. Native Mac Trackpad Pinch-to-zoom (ctrlKey: true) or Cmd/Ctrl+Scroll
      if (e.ctrlKey || e.metaKey) {
        isTrackpadPanningRef.current = false;
        if (trackpadPanTimeoutRef.current) {
          clearTimeout(trackpadPanTimeoutRef.current);
          trackpadPanTimeoutRef.current = null;
        }
        const factor = Math.exp(-e.deltaY * 0.01);
        const targetScale = scaleRef.current * factor;
        zoomAtPoint(targetScale, e.clientX, e.clientY, false);
        return;
      }

      const currentScale = scaleRef.current;

      // 2. Mac Trackpad 2-finger Pan:
      // When zoomed in (scale > 1.0), 2-finger swipe with horizontal component (abs(deltaX) > 0.5)
      // or Shift+Wheel initiates/maintains a 2D pan stream. We keep pan active for 80ms to bridge frames within the same swipe.
      // Physical mouse wheels never have deltaX (always 0), so mouse wheel is NEVER caught here.
      const hasHorizontalPan = Math.abs(e.deltaX) > 0.5 || e.shiftKey;
      if (hasHorizontalPan && currentScale > 1.0) {
        isTrackpadPanningRef.current = true;
      }

      if (isTrackpadPanningRef.current && currentScale > 1.0) {
        if (trackpadPanTimeoutRef.current) {
          clearTimeout(trackpadPanTimeoutRef.current);
        }
        trackpadPanTimeoutRef.current = setTimeout(() => {
          isTrackpadPanningRef.current = false;
        }, 80);

        const targetPanX = panRef.current.x - e.deltaX;
        const targetPanY = panRef.current.y - e.deltaY;
        panRef.current = clampPan(targetPanX, targetPanY, currentScale);
        scheduleUpdate();
        scheduleStateSync();
        return;
      }

      // 3. Vertical Scroll (Physical Mouse Wheel & Pure Vertical Scroll):
      // ALWAYS Zoom In / Zoom Out smoothly across all scale levels (1.0x to 10.0x)!
      // - Scroll Up (deltaY < 0): Zoom In
      // - Scroll Down (deltaY > 0): Zoom Out (back to 1.0 Fit)
      // Never locks or degenerates into vertical image panning!
      if (Math.abs(e.deltaY) < 0.1) return;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const targetScale = currentScale * zoomFactor;
      zoomAtPoint(targetScale, e.clientX, e.clientY, false);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (trackpadPanTimeoutRef.current) {
        clearTimeout(trackpadPanTimeoutRef.current);
      }
    };
  }, [clampPan, zoomAtPoint, scheduleUpdate, scheduleStateSync]);

  // Keyboard shortcut listener for Zoom (0, Cmd+0, +, -)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === '0' || (isCmdOrCtrl && e.key === '0')) {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleResetZoom, handleZoomIn, handleZoomOut]);

  // Cursor style based on zoom state
  const getCursorClass = () => {
    if (scale > 1.0) {
      return isDragging ? 'cursor-grabbing' : 'cursor-grab';
    }
    return 'cursor-default';
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${getCursorClass()}`}
    >
      {/* Floating Zoom OSD Badge */}
      <div
        className={`absolute top-16 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 pointer-events-none select-none ${
          zoomOsdVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <button
          onClick={handleResetZoom}
          title="Click to reset (0)"
          className="bg-black/70 dark:bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xl flex items-center gap-2 pointer-events-auto text-white hover:bg-black/90 active:scale-95 transition-all"
        >
          <span className="text-xs font-mono font-semibold tracking-wide">
            🔍 {Math.round(scale * 100)}%
          </span>
          {scale > 1.0 && (
            <span className="text-[10px] text-cyan-400 font-sans uppercase font-medium bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">
              Fit
            </span>
          )}
        </button>
      </div>

      {/* Media Viewport */}
      <div
        ref={viewportRef}
        className="absolute inset-0 flex items-center justify-center p-6 pb-20 pt-12 overflow-hidden pointer-events-none"
      >
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
            ref={imgRef}
            src={imageSrc}
            alt={item.name}
            onError={() => setHasError(true)}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${scale}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
              transformOrigin: 'center center',
              transition: 'none',
              willChange: 'transform',
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
                <span className="truncate max-w-[240px] md:max-w-xs text-slate-800 dark:text-slate-200 font-semibold">
                  🏷️ {item.name}
                </span>
                <span className="shrink-0 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
                  [ {currentIndex + 1} / {totalCount} ]
                </span>
              </div>

              {/* Right: Mark, Copy/Cut, Zoom, Rotate, Fullscreen */}
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

                {/* Zoom Controls (HUD Pill) */}
                <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out (-)"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="Reset Zoom (0)"
                    className="px-1.5 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

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
