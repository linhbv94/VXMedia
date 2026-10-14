import { AppUpdates } from './AppUpdates';
import { appVersion } from '../services/app_updater';
import React, { useState, useEffect } from 'react';
import { AppSettings, ThemeMode, AppLanguage, LoopFileMode } from '../types';
import { t } from '../services/i18n';
import { startDragging } from '../services/tauri';
import { X, Sliders, Play, HardDrive, Keyboard, RotateCcw, Info, Sparkles, Coffee, ExternalLink, PlaySquare, Heart } from 'lucide-react';
import qrImage from '../assets/qr.png';

export type SettingsTabType = 'general' | 'playback' | 'cache' | 'hotkeys' | 'updates' | 'about' | 'support';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  language?: AppLanguage;
  initialTab?: SettingsTabType;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  initialTab = 'general',
  onSaveSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>(initialTab);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [ramFreedNotice, setRamFreedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const i18n = t(localSettings.language);

  if (!isOpen) return null;

  const handleClearRam = () => {
    setRamFreedNotice(true);
    setTimeout(() => setRamFreedNotice(false), 2000);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
      single_instance: true,
      auto_pin: false,
      hud_hide_delay_ms: 2000,
      theme: 'system',
      language: 'vi',
      seek_short_sec: 1.0,
      seek_long_sec: 5.0,
      ab_loop_crossfade_ms: 45,
      default_loop_file: 'all',
      autoplay_next: true,
      volume: 0.8,
      media_fit_mode: 'scale_to_fit',
    };
    setLocalSettings(defaults);
    onSaveSettings(defaults);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      {/* Top 32px Drag Strip across modal backdrop */}
      <div
        data-tauri-drag-region
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onMouseDown={(e) => {
          if (e.button === 0) startDragging();
        }}
        className="absolute top-0 left-0 w-full h-8 z-10 pointer-events-auto"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-20 w-full max-w-2xl h-[560px] max-h-[calc(100dvh-32px)] bg-white dark:bg-[#141821] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col text-xs transition-colors duration-200"
      >
        {/* Header */}
        <div
          data-tauri-drag-region
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          onMouseDown={(e) => {
            if (
              e.button === 0 &&
              !(e.target as HTMLElement).closest('button, input, select, textarea, [role="button"]')
            ) {
              startDragging();
            }
          }}
          className="h-14 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-black/20 shrink-0 cursor-default select-none"
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {i18n.settings_title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar + Main Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Tab Sidebar */}
          <div className="w-48 border-r border-slate-200 dark:border-white/10 p-3 space-y-1.5 bg-slate-50/50 dark:bg-black/20 overflow-y-auto shrink-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'general'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{i18n.tab_general}</span>
            </button>

            <button
              onClick={() => setActiveTab('playback')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'playback'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{i18n.tab_playback}</span>
            </button>

            <button
              onClick={() => setActiveTab('cache')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'cache'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>{i18n.tab_cache}</span>
            </button>

            <button
              onClick={() => setActiveTab('hotkeys')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'hotkeys'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>{i18n.tab_hotkeys}</span>
            </button>

            <div className="my-2 border-t border-slate-200 dark:border-white/10" />

            <button
              onClick={() => setActiveTab('updates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'updates'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>{i18n.tab_updates}</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'about'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{i18n.tab_about}</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-left transition-all ${
                activeTab === 'support'
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-semibold shadow-2xs'
                  : 'text-amber-700/90 dark:text-amber-400/90 hover:bg-amber-500/10 hover:text-amber-900 dark:hover:text-amber-200'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{i18n.tab_support}</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-6 bg-white dark:bg-[#141821]">
            {/* TAB 1: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                {/* Window & System Behavior */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_window_behavior}
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={localSettings.single_instance}
                        onChange={(e) => updateSetting('single_instance', e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 accent-cyan-600"
                      />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {i18n.single_instance}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {i18n.single_instance_desc}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={localSettings.auto_pin}
                        onChange={(e) => updateSetting('auto_pin', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 accent-cyan-600"
                      />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {i18n.auto_pin}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* HUD Auto-hide delay */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.hud_hide_delay}
                  </h4>
                  <select
                    value={localSettings.hud_hide_delay_ms}
                    onChange={(e) => updateSetting('hud_hide_delay_ms', Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 font-medium shadow-2xs"
                  >
                    <option value={1000}>{i18n.hud_1s}</option>
                    <option value={2000}>{i18n.hud_2s}</option>
                    <option value={3000}>{i18n.hud_3s}</option>
                    <option value={0}>{i18n.hud_never}</option>
                  </select>
                </div>

                {/* Theme & Colors (Adaptive OS / Dark / Light / Black) */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_theme_colors}
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'system'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'system'}
                        onChange={() => updateSetting('theme', 'system' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_system}</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'dark'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'dark'}
                        onChange={() => updateSetting('theme', 'dark' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_dark}</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'light'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'light'}
                        onChange={() => updateSetting('theme', 'light' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_light}</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === 'black'
                          ? 'bg-cyan-50/80 dark:bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                          : 'bg-slate-50/70 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={localSettings.theme === 'black'}
                        onChange={() => updateSetting('theme', 'black' as ThemeMode)}
                        className="text-cyan-600 accent-cyan-600"
                      />
                      <span className="font-medium text-xs">{i18n.theme_black}</span>
                    </label>
                  </div>
                </div>

                {/* Language Switcher (Tiếng Việt / English) */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_language}
                  </h4>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="language"
                        checked={localSettings.language === 'vi'}
                        onChange={() => updateSetting('language', 'vi' as AppLanguage)}
                        className="text-cyan-600 accent-cyan-600 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        🇻🇳 {i18n.lang_vi}
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="language"
                        checked={localSettings.language === 'en'}
                        onChange={() => updateSetting('language', 'en' as AppLanguage)}
                        className="text-cyan-600 accent-cyan-600 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        🇺🇸 {i18n.lang_en}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLAYBACK */}
            {activeTab === 'playback' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.sec_seek_steps}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        {i18n.seek_short}
                      </label>
                      <select
                        value={localSettings.seek_short_sec}
                        onChange={(e) => updateSetting('seek_short_sec', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-2xs font-medium"
                      >
                        <option value={1.0}>1.0s</option>
                        <option value={2.0}>2.0s</option>
                        <option value={3.0}>3.0s</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        {i18n.seek_long}
                      </label>
                      <select
                        value={localSettings.seek_long_sec}
                        onChange={(e) => updateSetting('seek_long_sec', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-2xs font-medium"
                      >
                        <option value={5.0}>5.0s</option>
                        <option value={10.0}>10.0s</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-1">
                    {i18n.sec_ab_fade}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    {i18n.ab_fade_desc}
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={localSettings.ab_loop_crossfade_ms}
                      onChange={(e) => updateSetting('ab_loop_crossfade_ms', Number(e.target.value))}
                      className="flex-1 accent-cyan-600 dark:accent-cyan-400"
                    />
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold min-w-[50px] text-right">
                      {localSettings.ab_loop_crossfade_ms} ms
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={localSettings.autoplay_next}
                      onChange={(e) => updateSetting('autoplay_next', e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 accent-cyan-600"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                      {i18n.autoplay_next}
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-3">
                    {i18n.default_loop_mode}
                  </h4>
                  <select
                    value={localSettings.default_loop_file}
                    onChange={(e) => updateSetting('default_loop_file', e.target.value as LoopFileMode)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 shadow-2xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">{i18n.loop_all_desc}</option>
                    <option value="single">{i18n.loop_single_desc}</option>
                    <option value="off">{i18n.loop_off_desc}</option>
                  </select>
                </div>

                {/* Media Scaling: Scale to fit vs Limit to file size */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                    {i18n.sec_media_scaling}
                  </h4>
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="media_fit_mode"
                        value="scale_to_fit"
                        checked={(localSettings.media_fit_mode || 'scale_to_fit') === 'scale_to_fit'}
                        onChange={() => updateSetting('media_fit_mode', 'scale_to_fit')}
                        className="mt-0.5 text-cyan-600 accent-cyan-600"
                      />
                      <div className="text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {i18n.scale_to_fit}
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                          {i18n.scale_to_fit_desc}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="media_fit_mode"
                        value="limit_file_size"
                        checked={localSettings.media_fit_mode === 'limit_file_size'}
                        onChange={() => updateSetting('media_fit_mode', 'limit_file_size')}
                        className="mt-0.5 text-cyan-600 accent-cyan-600"
                      />
                      <div className="text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {i18n.limit_file_size}
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                          {i18n.limit_file_size_desc}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CACHE */}
            {activeTab === 'cache' && (
              <div className="space-y-5">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl text-emerald-900 dark:text-emerald-300">
                  <h4 className="font-semibold mb-1">
                    {i18n.sec_cache_arch}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/80">
                    {i18n.cache_arch_desc}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{i18n.ram_usage}</span>
                    <p className="text-xs text-cyan-700 dark:text-cyan-400 font-mono mt-0.5 font-semibold">
                      {i18n.ram_optimal}
                    </p>
                  </div>
                  <button
                    onClick={handleClearRam}
                    className="px-3.5 py-1.5 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <span>{i18n.btn_clear_ram}</span>
                  </button>
                </div>

                {ramFreedNotice && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    {i18n.ram_cleared}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HOTKEYS */}
            {activeTab === 'hotkeys' && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                  {i18n.sec_hotkeys_title}
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  {[
                    { label: 'Ảnh trước / sau:', key: '← / →' },
                    { label: 'File media trước / sau:', key: 'Cmd/Ctrl + ← / →' },
                    { label: 'Phát / Tạm dừng:', key: 'Space' },
                    { label: 'Tua ±1s / ±5s:', key: '← / → , Shift + ← / →' },
                    { label: 'Nhảy mốc 0% - 90%:', key: '0 - 9' },
                    { label: 'Đánh dấu tệp:', key: 'M' },
                    { label: 'Copy tệp hiện tại:', key: 'Cmd/Ctrl + C' },
                    { label: 'Copy tất cả Đã Mark:', key: 'Cmd/Ctrl + Shift + C' },
                    { label: 'Cut tất cả Đã Mark:', key: 'Cmd/Ctrl + Shift + X' },
                    { label: 'Đặt điểm lặp A / B:', key: '[ / ]' },
                    { label: 'Bật/Tắt Lặp đoạn A-B:', key: '\\' },
                    { label: 'Bật/Tắt Xáo trộn:', key: 'S' },
                    { label: 'Chế độ Lặp Tệp:', key: 'L hoặc R' },
                    { label: 'Tăng / Giảm Âm lượng:', key: '↑ / ↓' },
                    { label: 'Bật/Tắt tiếng (Mute):', key: 'Shift + M' },
                    { label: 'Ghim trên cùng:', key: 'P' },
                    { label: 'Danh sách thư mục:', key: 'B' },
                    { label: 'Ẩn / Hiện HUD:', key: 'H' },
                  ].map((hk, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5"
                    >
                      <span className="text-slate-600 dark:text-slate-400">{hk.label}</span>
                      <span className="font-mono text-cyan-800 dark:text-cyan-300 font-semibold bg-white dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 shadow-2xs">
                        {hk.key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: UPDATES */}
            {activeTab === 'updates' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                        <span>{i18n.tab_updates}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {localSettings.language === 'vi'
                          ? 'Kiểm tra phiên bản mới nhất và tải bản cập nhật tự động từ GitHub Releases.'
                          : 'Check for new releases and download updates automatically from GitHub Releases.'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 rounded-full border border-cyan-300 dark:border-cyan-500/30">
                      v{appVersion}
                    </span>
                  </div>
                </div>

                <AppUpdates language={localSettings.language} />
              </div>
            )}

            {/* TAB 6: ABOUT */}
            {activeTab === 'about' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Khung 1: Thông tin ứng dụng */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0 font-bold text-2xl">
                    <PlaySquare className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {i18n.about_app_name}
                      </h3>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 rounded-full border border-cyan-300 dark:border-cyan-500/30">
                        v{appVersion}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {i18n.about_tagline}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                      <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                        {i18n.about_author}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <a
                        href="https://github.com/linhbv94/VXMedia"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-mono text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>github.com/linhbv94/VXMedia</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Khung 2: Giới thiệu ngắn 2-3 câu về công dụng / điểm nổi bật */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{i18n.about_diff_title}</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {i18n.about_diff_short}
                  </p>
                </div>

                {/* Khung 3: Danh sách tính năng then chốt */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {localSettings.language === 'vi' ? 'Công nghệ nền tảng:' : 'Core Technologies:'}
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      {localSettings.language === 'vi'
                        ? 'Tauri v2 + Rust Core Engine'
                        : 'Tauri v2 + Rust Core Engine'}
                    </li>
                    <li>React 19 + TypeScript + Tailwind CSS</li>
                    <li>
                      {localSettings.language === 'vi'
                        ? 'Kiến trúc Zero-Disk-Cache quản lý bộ nhớ thông minh'
                        : 'Zero-Disk-Cache architecture for smart memory management'}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 7: SUPPORT AUTHOR */}
            {activeTab === 'support' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Banner mở đầu ấm áp */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{i18n.support_title}</span>
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {i18n.support_thank_note}
                    </p>
                  </div>
                </div>

                {/* Card QR nổi bật căn giữa */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center shadow-sm">
                  {/* Mã QR với nền trắng tương phản cao để quét nhạy */}
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 flex flex-col items-center justify-center">
                    <img
                      src={qrImage}
                      alt="VietQR Code"
                      className="w-52 h-auto object-contain rounded-lg"
                    />
                    <span className="text-[11px] font-semibold text-emerald-800 mt-2 font-mono tracking-wider">
                      VietQR • Napas247
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-sm leading-relaxed">
                    {i18n.support_scan_hint}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-14 px-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-black/30 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{i18n.btn_defaults}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold transition-all shadow-sm active:scale-95"
          >
            {i18n.btn_close}
          </button>
        </div>
      </div>
    </div>
  );
};
