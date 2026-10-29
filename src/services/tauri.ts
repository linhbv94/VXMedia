import { MediaListResponse, AudioMetadataResponse } from '../types';
import { getMockDirectoryMedia, MOCK_AUDIO_METADATA, SAMPLE_MEDIA_URLS } from './mockData';

// Check if running inside Tauri webview
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
};

/**
 * Convert file path to safe asset URL
 * Tauri asset protocol: asset://... or https://asset.localhost/...
 */
export async function getSafeMediaSrc(filePath: string): Promise<string> {
  if (isTauriEnvironment()) {
    try {
      const { convertFileSrc } = await import('@tauri-apps/api/core');
      return convertFileSrc(filePath);
    } catch (e) {
      console.warn('Failed to convertFileSrc from Tauri API:', e);
    }
  }
  // Browser fallback using sample mock URLs
  return SAMPLE_MEDIA_URLS[filePath] || filePath;
}

/**
 * IPC: get_directory_media
 */
export async function getDirectoryMedia(filePath: string): Promise<MediaListResponse> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<MediaListResponse>('get_directory_media', { filePath });
    } catch (error) {
      console.warn('Tauri invoke get_directory_media error, falling back to mock:', error);
    }
  }
  // Browser mock fallback
  return getMockDirectoryMedia(filePath);
}

/**
 * IPC: clipboard_files
 */
export async function clipboardFiles(filePaths: string[], isCut: boolean = false): Promise<boolean> {
  if (filePaths.length === 0) return false;

  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('clipboard_files', { filePaths, isCut });
    } catch (error) {
      console.warn('Tauri invoke clipboard_files error, falling back:', error);
    }
  }

  // Web Browser fallback: Write file paths into clipboard text
  try {
    const text = filePaths.join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard in browser:', e);
    return false;
  }
}

/**
 * IPC: read_audio_metadata
 */
export async function readAudioMetadata(filePath: string): Promise<AudioMetadataResponse> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<AudioMetadataResponse>('read_audio_metadata', { filePath });
    } catch (error) {
      console.warn('Tauri invoke read_audio_metadata error, falling back to mock:', error);
    }
  }

  // Browser mock fallback
  if (MOCK_AUDIO_METADATA[filePath]) {
    return MOCK_AUDIO_METADATA[filePath];
  }

  // Fallback metadata extracting filename
  const fileName = filePath.split(/[/\\]/).pop() || filePath;
  const title = fileName.replace(/\.[^/.]+$/, '');
  return {
    title,
    artist: 'Unknown Artist',
    duration_seconds: 0
  };
}

/**
 * IPC: set_always_on_top
 */
export async function setAlwaysOnTop(isPinned: boolean): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('set_always_on_top', { isPinned });
    } catch (error) {
      console.warn('Tauri invoke set_always_on_top error:', error);
    }
  }
  return isPinned;
}

/**
 * IPC: open_file_dialog
 */
export async function openFileDialog(): Promise<string | null> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<string | null>('open_file_dialog');
      return res;
    } catch (error) {
      console.warn('Tauri invoke open_file_dialog error:', error);
    }
  }
  return null;
}

/**
 * IPC: open_folder_dialog
 */
export async function openFolderDialog(): Promise<string | null> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<string | null>('open_folder_dialog');
      return res;
    } catch (error) {
      console.warn('Tauri invoke open_folder_dialog error:', error);
    }
  }
  return null;
}

/**
 * IPC: get_initial_media_file
 */
export async function getInitialMediaFile(): Promise<string | null> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<string | null>('get_initial_media_file');
      return res;
    } catch (error) {
      console.warn('Tauri invoke get_initial_media_file error:', error);
    }
  }
  return null;
}

/**
 * IPC: log_frontend for diagnostics
 */
export async function logFrontend(msg: string): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('log_frontend', { msg });
    } catch {}
  }
}

/**
 * Event: listen to open-media-file from OS Open With / Finder
 */
export async function listenOpenMediaFile(callback: (path: string) => void): Promise<() => void> {
  if (isTauriEnvironment()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const unlisten = await listen<string>('open-media-file', (event) => {
        callback(event.payload);
      });
      return unlisten;
    } catch (e) {
      console.warn('Failed to listen to open-media-file:', e);
    }
  }
  return () => {};
}

/**
 * Event: listen to menu open file/folder
 */
export async function listenMenuOpenEvents(
  onOpenFile: () => void,
  onOpenFolder: () => void,
  onOpenSettings?: () => void
): Promise<() => void> {
  if (isTauriEnvironment()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const u1 = await listen('trigger-open-file', () => onOpenFile());
      const u2 = await listen('trigger-open-folder', () => onOpenFolder());
      const u3 = onOpenSettings ? await listen('trigger-open-settings', () => onOpenSettings()) : () => {};
      return () => {
        u1();
        u2();
        u3();
      };
    } catch (e) {
      console.warn('Failed to listen to menu open events:', e);
    }
  }
  return () => {};
}

/**
 * Start native window dragging (move window)
 */
export async function startDragging(): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().startDragging();
    } catch (e) {
      console.warn('Failed to start dragging window:', e);
    }
  }
}

/**
 * Set traffic lights / window decorations visibility without destroying titleBarStyle: Overlay
 */
export async function setTrafficLightsVisible(visible: boolean): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_traffic_lights_visible', { visible });
    } catch (e) {
      console.warn('Failed to set traffic lights visibility:', e);
    }
  }
}

/**
 * Set window decorations (true for native titlebar, false for borderless/custom chrome)
 */
export async function setWindowDecorations(decorations: boolean): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().setDecorations(decorations);
    } catch (e) {
      console.warn('Failed to set window decorations:', e);
    }
  }
}

/**
 * Minimize current window
 */
export async function minimizeWindow(): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch (e) {
      console.warn('Failed to minimize window:', e);
    }
  }
}

/**
 * Toggle maximize / restore current window
 */
export async function toggleMaximizeWindow(): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
    } catch (e) {
      console.warn('Failed to toggle maximize window:', e);
    }
  }
}

/**
 * Close current window
 */
export async function closeWindow(): Promise<void> {
  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (e) {
      console.warn('Failed to close window:', e);
    }
  }
}

/**
 * Open a new Tauri window
 */
export async function createMediaWindow(label: string, title: string): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('create_media_window', { label, title });
      return true;
    } catch (e) {
      console.warn('Failed to create media window:', e);
      return false;
    }
  }
  return false;
}

/**
 * Read a local file directly as raw ArrayBuffer (zero-CORS, high performance)
 */
export async function readFileBinary(filePath: string): Promise<ArrayBuffer> {
  if (
    isTauriEnvironment() &&
    !filePath.startsWith('blob:') &&
    !filePath.startsWith('http:') &&
    !filePath.startsWith('https:') &&
    !filePath.startsWith('data:')
  ) {
    const { invoke } = await import('@tauri-apps/api/core');
    const res = await invoke<ArrayBuffer | Uint8Array | number[]>('read_file_binary', { filePath });
    if (res instanceof ArrayBuffer) return res;
    if (res instanceof Uint8Array) return res.buffer as ArrayBuffer;
    if (Array.isArray(res)) return new Uint8Array(res).buffer as ArrayBuffer;
    return res as ArrayBuffer;
  }
  const res = await fetch(filePath);
  return await res.arrayBuffer();
}

/**
 * Print a document via OS standard Print dialog
 */
export async function printFile(filePath: string): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('print_file', { filePath });
      return true;
    } catch (e) {
      console.warn('print_file IPC error:', e);
    }
  }
  window.print();
  return true;
}




/** Native fullscreen for desktop; DOM fullscreen only for browser preview. */
export async function setFullscreen(fullscreen: boolean): Promise<void> {
  if (isTauriEnvironment()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setFullscreen(fullscreen);
  } else if (fullscreen) {
    await document.documentElement.requestFullscreen();
  } else if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
}

export async function listenFullscreen(callback: (fullscreen: boolean) => void): Promise<() => void> {
  if (isTauriEnvironment()) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const appWindow = getCurrentWindow();
    let disposed = false;
    const refresh = async () => {
      const fullscreen = await appWindow.isFullscreen();
      if (!disposed) callback(fullscreen);
    };
    const unlisten = await appWindow.onResized(() => { void refresh().catch(console.warn); });
    try { await refresh(); } catch (error) { unlisten(); throw error; }
    return () => { disposed = true; unlisten(); };
  }
  const refresh = () => callback(Boolean(document.fullscreenElement));
  document.addEventListener('fullscreenchange', refresh);
  refresh();
  return () => document.removeEventListener('fullscreenchange', refresh);
}
