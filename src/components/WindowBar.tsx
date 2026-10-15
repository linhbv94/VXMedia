import React, { useState, useRef, useEffect } from 'react';
import { Pin, Eye, EyeOff, ListFilter, Settings, FolderOpen, Folder, X, Minus, Square, PlaySquare } from 'lucide-react';
import { AppLanguage } from '../types';
import { t } from '../services/i18n';
import { startDragging, closeWindow, minimizeWindow, toggleMaximizeWindow, setWindowDecorations } from '../services/tauri';
import { RecentButton } from './recent_button';

interface WindowBarProps {
  isFullscreen?: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  hudVisible: boolean;
  onToggleHud: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenFile?: () => void;
  onOpenFolder?: () => void;
  onSelectRecentFile?: (path: string) => void;
  onSelectRecentFolder?: (path: string) => void;
  language: AppLanguage;
  isMiniPip?: boolean;
  isAutoHide?: boolean;
  tabBarContent?: React.ReactNode;
}

export const WindowBar: React.FC<WindowBarProps> = ({
  isFullscreen = false,
  isPinned,
  onTogglePin,
  hudVisible,
  onToggleHud,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onOpenFile,
  onOpenFolder,
  onSelectRecentFile,
  onSelectRecentFolder,
  language,
  isMiniPip = false,
  isAutoHide = false,
  tabBarContent,
}) => {
  const i18n = t(language);
  const isMac = typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh/.test(navigator.userAgent));
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isMac) {
      setWindowDecorations(false);
    }
  }, [isMac]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.button === 0 &&
      !(e.target as HTMLElement).closest(
        'button, input, select, textarea, [role="button"], [role="tab"], [data-no-drag], .tab-bar, .tab-item'
      )
    ) {
      startDragging();
    }
  };

  const windowsMenus: Record<string, Array<{ label: string; shortcut?: string; action: () => void }>> = {
    [i18n.menu_file || 'Tệp']: [
      ...(onOpenFile ? [{ label: i18n.open_file, shortcut: isMac ? 'Cmd+O' : 'Ctrl+O', action: onOpenFile }] : []),
      ...(onOpenFolder ? [{ label: i18n.open_folder, shortcut: isMac ? 'Cmd+Shift+O' : 'Ctrl+Shift+O', action: onOpenFolder }] : []),
      { label: i18n.settings, shortcut: 'Cmd/Ctrl+,', action: onOpenSettings },
      { label: language === 'vi' ? 'Đóng cửa sổ' : 'Close Window', shortcut: 'Alt+F4', action: () => closeWindow() },
    ],
    [i18n.menu_view || 'Xem']: [
      { label: hudVisible ? 'Ẩn HUD' : 'Hiện HUD', shortcut: 'H', action: onToggleHud },
      { label: i18n.folder_list, shortcut: 'B', action: onToggleSidebar },
      { label: isPinned ? i18n.pinned : i18n.pin, shortcut: 'P', action: onTogglePin },
    ],
    [i18n.menu_help || 'Trợ giúp']: [
      { label: i18n.settings, action: onOpenSettings },
    ],
  };

  return (
    <div
      data-hud-layer
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      inert={isFullscreen && !hudVisible}
      style={{ WebkitAppRegion: isFullscreen ? 'no-drag' : 'drag', opacity: isFullscreen && !hudVisible ? 0 : 'var(--hud-opacity, 1)' } as React.CSSProperties}
      className={`absolute top-0 left-0 w-full h-8 ${
        isMiniPip
          ? 'px-2'
          : isMac
          ? 'pl-[82px] pr-3'
          : 'pl-2 pr-2'
      } flex items-center justify-between z-40 transition-all duration-200 select-none ${
        hudVisible
          ? 'bg-gradient-to-b from-black/80 via-black/45 to-transparent pointer-events-auto'
          : 'bg-transparent pointer-events-none'
      }`}
    >
      {/* Left: Brand (Mac) or Menu Bar (Windows) + Tabs & Quick Open */}
      <div className={`flex items-center gap-2 max-w-[calc(100%-260px)] transition-opacity duration-200 ${
        hudVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* macOS Brand: Icon + App Title (System font) */}
        {!isMiniPip && isMac && (
          <div className="flex items-center gap-1.5 shrink-0">
            <PlaySquare className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-semibold tracking-wide text-slate-200 shrink-0 leading-none">
              {i18n.app_title}
            </span>
          </div>
        )}

        {/* Windows Menus (Icon & Title hidden per desktop UI standard) */}
        {!isMiniPip && !isMac && (
          <div ref={menuRef} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex items-center gap-0.5 text-slate-300 shrink-0">
            {Object.keys(windowsMenus).map((menuKey) => (
              <div key={menuKey} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === menuKey ? null : menuKey)}
                  onMouseEnter={() => {
                    if (activeMenu !== null) setActiveMenu(menuKey);
                  }}
                  className={`px-2 py-1 rounded text-xs transition-colors hover:bg-white/10 hover:text-white ${
                    activeMenu === menuKey ? 'bg-white/15 text-cyan-300 font-semibold' : ''
                  }`}
                >
                  {menuKey}
                </button>

                {activeMenu === menuKey && (
                  <div className="absolute left-0 top-full mt-1 min-w-[200px] rounded-lg bg-slate-900/95 backdrop-blur-md py-1 z-50 shadow-2xl border border-white/10">
                    {windowsMenus[menuKey].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          item.action();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-200 transition-colors"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[10px] text-slate-400 font-mono ml-3">{item.shortcut}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Open File */}
        {onOpenFile && !isMiniPip && (
          <RecentButton
            type="file"
            storageKey="vxmedia_recent_files"
            label={i18n.open_file || 'Mở tệp'}
            title={`${i18n.open_file || 'Mở tệp'} (${isMac ? 'Cmd+O' : 'Ctrl+O'})`}
            icon={<FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            onMainClick={onOpenFile}
            onSelectRecent={(path) => {
              if (onSelectRecentFile) onSelectRecentFile(path);
              else if (onOpenFile) onOpenFile();
            }}
            emptyLabel="Chưa có tệp gần đây"
          />
        )}

        {/* Quick Open Folder */}
        {onOpenFolder && !isMiniPip && (
          <RecentButton
            type="folder"
            storageKey="vxmedia_recent_folders"
            label={i18n.open_folder || 'Mở thư mục'}
            title={`${i18n.open_folder || 'Mở thư mục'} (${isMac ? 'Cmd+Shift+O' : 'Ctrl+Shift+O'})`}
            icon={<Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            onMainClick={onOpenFolder}
            onSelectRecent={(path) => {
              if (onSelectRecentFolder) onSelectRecentFolder(path);
              else if (onOpenFolder) onOpenFolder();
            }}
            emptyLabel="Chưa có thư mục gần đây"
          />
        )}

        {/* Tab Bar Content */}
        {!isMiniPip && tabBarContent}
      </div>

      {/* Right: Actions */}
      <div
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center gap-1"
      >
        {/* Pin on Top Button */}
        <button
          onClick={onTogglePin}
          title={isPinned ? 'Bỏ ghim (P)' : 'Ghim trên cùng (P)'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all leading-none ${
            hudVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${
            isPinned
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
              : 'text-slate-200 hover:text-white hover:bg-white/15 border border-transparent'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45 text-cyan-300' : ''}`} />
          {!isMiniPip && <span>{isPinned ? i18n.pinned : i18n.pin}</span>}
        </button>

        {isMiniPip && (
          <button
            onClick={() => closeWindow()}
            title="Đóng cửa sổ"
            className={`p-1 rounded text-slate-300 hover:text-white hover:bg-rose-500/80 transition-all leading-none ${
              hudVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {!isMiniPip && (
          <>
            {/* Toggle HUD Button */}
            <button
              onClick={onToggleHud}
              disabled={isAutoHide}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              title={
                isAutoHide
                  ? (language === 'vi' ? 'Đang bật tự động ẩn HUD (Cài đặt)' : 'HUD auto-hide is enabled (Settings)')
                  : (hudVisible ? 'Ẩn HUD (H)' : 'Hiện HUD (H)')
              }
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium transition-all duration-150 leading-none pointer-events-auto ${
                isAutoHide
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : hudVisible
                  ? 'text-slate-200 hover:text-white hover:bg-white/15 border border-transparent opacity-100'
                  : 'opacity-0 hover:opacity-100 bg-slate-900/90 hover:bg-slate-900 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 backdrop-blur-md shadow-lg shadow-black/50'
              }`}
            >
              {hudVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{i18n.hud}</span>
            </button>

            {/* Toggle Sidebar Button */}
            <button
              onClick={onToggleSidebar}
              data-toggle-sidebar="true"
              title="Danh sách tệp (B)"
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all leading-none ${
                hudVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              } ${
                isSidebarOpen
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/15 border border-transparent'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{i18n.folder_list}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title={i18n.settings}
              className={`p-1 rounded text-slate-200 hover:text-white hover:bg-white/15 border border-transparent transition-all leading-none ${
                hudVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Windows Window Controls (Hidden on macOS) */}
        {!isMiniPip && !isMac && !isFullscreen && (
          <div className="flex items-center ml-2 border-l border-white/15 pl-1.5">
            <button
              type="button"
              onClick={() => minimizeWindow()}
              title="Minimize"
              className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleMaximizeWindow()}
              title="Maximize / Restore"
              className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => closeWindow()}
              title="Close"
              className="p-1 text-slate-300 hover:text-white hover:bg-rose-500 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
