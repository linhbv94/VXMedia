import React, { useState, useRef, useEffect } from 'react';
import { Folder, FolderOpen, X, Plus, ExternalLink, MoreVertical } from 'lucide-react';
import { RecentButton } from './recent_button';
import { FolderSession } from '../types/session';
import { AppLanguage } from '../types';
import { t } from '../services/i18n';

interface TabBarProps {
  sessions: FolderSession[];
  activeSessionId: string | null;
  language?: AppLanguage;
  onSelectTab: (sessionId: string) => void;
  onCloseTab: (sessionId: string) => void;
  onCloseOtherTabs?: (sessionId: string) => void;
  onMoveTabToNewWindow: (sessionId: string) => void;
  onNewTab: () => void;
  onSelectRecentFolder?: (path: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  sessions,
  activeSessionId,
  language = 'vi',
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onMoveTabToNewWindow,
  onNewTab,
  onSelectRecentFolder,
}) => {
  const i18n = t(language);
  const [contextMenuSessionId, setContextMenuSessionId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuSessionId(null);
        setMenuPos(null);
      }
    };
    if (contextMenuSessionId) {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenuSessionId]);

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuSessionId(sessionId);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div
      data-no-drag
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full select-none"
    >
      {sessions.map((session) => {
        const isActive = session.id === activeSessionId;
        const markedCount = session.markedPaths ? session.markedPaths.size : 0;

        return (
          <div
            key={session.id}
            onClick={() => onSelectTab(session.id)}
            onContextMenu={(e) => handleContextMenu(e, session.id)}
            className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all border max-w-[180px] shrink-0 ${
              isActive
                ? 'bg-white/15 dark:bg-white/10 text-white border-white/20 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
            }`}
            title={session.folderPath}
          >
            {/* Folder Icon */}
            {isActive ? (
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 shrink-0" />
            )}

            {/* Folder Name */}
            <span className="truncate leading-none">{session.folderName}</span>

            {/* Marked Items Count Badge */}
            {markedCount > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[10px] font-mono leading-none bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shrink-0">
                {markedCount}
              </span>
            )}

            {/* Options button (three dots) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, session.id);
              }}
              title={i18n.tab_options}
              className="opacity-0 group-hover:opacity-100 hover:bg-white/15 rounded p-0.5 text-slate-400 hover:text-white transition-all ml-0.5 shrink-0"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {/* Close Tab Button */}
            {sessions.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(session.id);
                }}
                title={i18n.tab_close}
                className="opacity-0 group-hover:opacity-100 hover:bg-rose-500/60 rounded p-0.5 text-slate-400 hover:text-white transition-all shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* New Tab (+) Button */}
      <RecentButton type="folder" storageKey="vxmedia_recent_folders" label=""
        title={i18n.tab_new_folder} icon={<Plus className="w-3.5 h-3.5" />} showChevron={false}
        onMainClick={onNewTab} onSelectRecent={(path) => onSelectRecentFolder?.(path)}
        buttonClassName="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-transparent transition-all shrink-0"
        emptyLabel={i18n.empty_recent_folders} />

      {/* Context Menu Popup */}
      {contextMenuSessionId && menuPos && (
        <div
          ref={menuRef}
          style={{ top: `${menuPos.y}px`, left: `${menuPos.x}px` }}
          className="fixed z-50 min-w-[200px] glass-panel rounded-xl py-1 px-1 shadow-2xl border border-white/15 text-xs text-slate-200"
        >
          <button
            onClick={() => {
              onMoveTabToNewWindow(contextMenuSessionId);
              setContextMenuSessionId(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 text-left transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>{i18n.tab_move_new_win}</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          {sessions.length > 1 && onCloseOtherTabs && (
            <button
              onClick={() => {
                onCloseOtherTabs(contextMenuSessionId);
                setContextMenuSessionId(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left transition-colors"
            >
              <span>{i18n.tab_close_others}</span>
            </button>
          )}

          <button
            onClick={() => {
              onCloseTab(contextMenuSessionId);
              setContextMenuSessionId(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 text-left transition-colors"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>{i18n.tab_close_this}</span>
          </button>
        </div>
      )}
    </div>
  );
};
