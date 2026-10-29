import type {AppLanguage} from '../types';
import {SettingsShell,GeneralSettings,UpdatesSettings,AboutSettings,SupportSettings,commonSettingsTabs} from './shared/settings_ui';
import { AppUpdates } from './AppUpdates';
import { appVersion } from '../services/app_updater';
import {useState,useEffect} from 'react';
import {AppSettings,LoopFileMode} from '../types';
import { t } from '../services/i18n';
import { startDragging } from '../services/tauri';
import {Monitor,Play,HardDrive,Keyboard,PlaySquare} from 'lucide-react';
import qrImage from '../assets/qr.png';

export type SettingsTabType = 'general' | 'window_hud' | 'playback' | 'cache' | 'hotkeys' | 'updates' | 'about' | 'support';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  language?: AppLanguage;
  initialTab?: SettingsTabType | null;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  initialTab = null,
  onSaveSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [ramFreedNotice, setRamFreedNotice] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

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
      language: localSettings.language,
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

return (<SettingsShell theme={localSettings.theme} appName="VXMedia" language={localSettings.language} tabs={[commonSettingsTabs(localSettings.language)[0], {id:'window_hud',label:i18n.tab_window_hud,icon:<Monitor size={16}/>} ,{id:'playback',label:i18n.tab_playback,icon:<Play size={16}/>} ,{id:'cache',label:i18n.tab_cache,icon:<HardDrive size={16}/>} ,{id:'hotkeys',label:i18n.tab_hotkeys,icon:<Keyboard size={16}/>} , ...commonSettingsTabs(localSettings.language).slice(1)]} activeTab={activeTab} onTabChange={id=>setActiveTab(id as SettingsTabType)} onClose={onClose} onReset={handleResetDefaults}   onDrag={startDragging}>{activeTab === 'window_hud' && (<div className="space-y-5">
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
              </div>)}
{activeTab === 'playback' && (<div className="space-y-5">
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
              </div>)}
{activeTab === 'cache' && (<div className="space-y-5">
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
                    type="button"
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
              </div>)}
{activeTab === 'hotkeys' && (<div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                  {i18n.sec_hotkeys_title}
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  {[
                    { label: i18n.hk_prev_next_img, key: '← / →' },
                    { label: i18n.hk_prev_next_media, key: 'Cmd/Ctrl + ← / →' },
                    { label: i18n.hk_play_pause, key: 'Space' },
                    { label: i18n.hk_seek, key: '← / → , Shift + ← / →' },
                    { label: i18n.hk_jump_pct, key: '0 - 9' },
                    { label: i18n.hk_mark, key: 'M' },
                    { label: i18n.hk_copy_current, key: 'Cmd/Ctrl + C' },
                    { label: i18n.hk_copy_marked, key: 'Cmd/Ctrl + Shift + C' },
                    { label: i18n.hk_cut_marked, key: 'Cmd/Ctrl + Shift + X' },
                    { label: i18n.hk_set_ab, key: '[ / ]' },
                    { label: i18n.hk_toggle_ab, key: '\\' },
                    { label: i18n.hk_shuffle, key: 'S' },
                    { label: i18n.hk_loop_mode, key: 'L / R' },
                    { label: i18n.hk_volume, key: '↑ / ↓' },
                    { label: i18n.hk_mute, key: 'Shift + M' },
                    { label: i18n.hk_pin, key: 'P' },
                    { label: i18n.hk_sidebar, key: 'B' },
                    { label: i18n.hk_hud, key: 'H' },
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
              </div>)}
{activeTab === 'general' && <GeneralSettings language={localSettings.language} theme={localSettings.theme} themes={['system','dark','light','black']} onThemeChange={value => updateSetting('theme', value)} onLanguageChange={value => updateSetting('language', value)} />}
{activeTab === 'updates' && <UpdatesSettings language={localSettings.language} version={appVersion}><AppUpdates language={localSettings.language}/></UpdatesSettings>}
{activeTab === 'about' && <AboutSettings language={localSettings.language} appName="VXMedia" version={appVersion} tagline={i18n.about_tagline} description={i18n.about_diff_short} repository="https://github.com/linhbv94/VXMedia" icon={<PlaySquare/>} technologies={[i18n.about_tech_1,i18n.about_tech_2,i18n.about_tech_3]} />}
{activeTab === 'support' && <SupportSettings language={localSettings.language} qrSource={qrImage}/>}</SettingsShell>);
};
