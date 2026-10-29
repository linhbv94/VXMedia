use std::path::Path;
use url::Url;

/// Supported media extensions for file picker
const MEDIA_EXTENSIONS: &[&str] = &[
    "jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "ico", "avif",
    "mp4", "mkv", "webm", "mov", "avi", "m4v",
    "mp3", "wav", "flac", "ogg", "aac", "m4a", "wma", "aiff",
];

/// Shared state holding the initial media file opened via OS association or RunEvent::Opened
#[derive(Default)]
pub struct InitialMediaState(pub std::sync::Mutex<Option<String>>);

#[tauri::command]
pub async fn open_file_dialog() -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .set_title("Chọn tệp Media")
        .add_filter("Tệp Media", MEDIA_EXTENSIONS)
        .pick_file()
        .await;

    Ok(file.map(|f| f.path().to_string_lossy().to_string()))
}

#[tauri::command]
pub async fn open_folder_dialog() -> Result<Option<String>, String> {
    let folder = rfd::AsyncFileDialog::new()
        .set_title("Chọn thư mục chứa Media")
        .pick_folder()
        .await;

    Ok(folder.map(|f| f.path().to_string_lossy().to_string()))
}

pub fn debug_log(msg: &str) {
    if !cfg!(debug_assertions) {
        let _ = msg;
        return;
    }
    let path = std::env::temp_dir().join("vxmedia_debug_open.log");
    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
    {
        use std::io::Write;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let _ = writeln!(file, "[{}] {}", now, msg);
    }
}

#[tauri::command]
pub fn log_frontend(msg: String) {
    debug_log(&format!("[Frontend] {}", msg));
}

pub fn clean_file_url_or_path(raw: &str) -> String {
    if raw.starts_with("file://") {
        if let Ok(url) = Url::parse(raw) {
            if let Ok(file_path) = url.to_file_path() {
                return file_path.to_string_lossy().to_string();
            }
        }
        return raw.trim_start_matches("file://").to_string();
    }
    raw.to_string()
}

#[cfg(target_os = "macos")]
fn get_file_from_apple_event() -> Option<String> {
    use cocoa::base::{id, nil};
    use objc::{msg_send, sel, sel_impl};
    use std::ffi::CStr;

    unsafe {
        let manager_cls = objc::runtime::Class::get("NSAppleEventManager")?;
        let manager: id = msg_send![manager_cls, sharedAppleEventManager];
        if manager == nil {
            return None;
        }
        let event: id = msg_send![manager, currentAppleEvent];
        if event == nil {
            return None;
        }

        let event_class: u32 = msg_send![event, eventClass];
        let event_id: u32 = msg_send![event, eventID];
        debug_log(&format!("AppleEvent detected: class=0x{:x}, id=0x{:x}", event_class, event_id));

        // 'aevt' = 0x61657674, 'odoc' = 0x6f646f63
        if event_class != 0x61657674 || event_id != 0x6f646f63 {
            return None;
        }

        // keyDirectObject = '----' = 0x2d2d2d2d
        let param: id = msg_send![event, paramDescriptorForKeyword: 0x2d2d2d2du32];
        if param == nil {
            debug_log("AppleEvent keyDirectObject param is nil");
            return None;
        }

        let count: isize = msg_send![param, numberOfItems];
        let target_desc: id = if count > 0 {
            msg_send![param, descriptorAtIndex: 1isize]
        } else {
            param
        };

        if target_desc == nil {
            return None;
        }

        let ns_str: id = msg_send![target_desc, stringValue];
        if ns_str != nil {
            let utf8_ptr: *const std::os::raw::c_char = msg_send![ns_str, UTF8String];
            if !utf8_ptr.is_null() {
                let s = CStr::from_ptr(utf8_ptr).to_string_lossy().to_string();
                if !s.is_empty() {
                    let cleaned = clean_file_url_or_path(&s);
                    debug_log(&format!("AppleEvent extracted path: {}", cleaned));
                    return Some(cleaned);
                }
            }
        }

        // Try coerce to typeUTF8Text ('utxt' = 0x75747874)
        let coerced: id = msg_send![target_desc, coerceToDescriptorWithDescriptorType: 0x75747874u32];
        if coerced != nil {
            let ns_str: id = msg_send![coerced, stringValue];
            if ns_str != nil {
                let utf8_ptr: *const std::os::raw::c_char = msg_send![ns_str, UTF8String];
                if !utf8_ptr.is_null() {
                    let s = CStr::from_ptr(utf8_ptr).to_string_lossy().to_string();
                    if !s.is_empty() {
                        let cleaned = clean_file_url_or_path(&s);
                        debug_log(&format!("AppleEvent coerced path: {}", cleaned));
                        return Some(cleaned);
                    }
                }
            }
        }
    }
    None
}

#[tauri::command]
pub fn get_initial_media_file(state: tauri::State<InitialMediaState>) -> Option<String> {
    debug_log("get_initial_media_file command called");

    // 1. Check if an initial file was captured by RunEvent::Opened (macOS Open With / Finder)
    if let Ok(mut lock) = state.0.lock() {
        if let Some(path) = lock.take() {
            debug_log(&format!("get_initial_media_file found path in InitialMediaState: {}", path));
            return Some(path);
        }
    }

    // 2. Check native macOS AppleEvent directly from Cocoa
    #[cfg(target_os = "macos")]
    {
        if let Some(path) = get_file_from_apple_event() {
            debug_log(&format!("get_initial_media_file found path via AppleEvent: {}", path));
            return Some(path);
        }
    }

    // 3. Check command-line arguments (Windows Open With / Explorer / CLI args)
    let args: Vec<String> = std::env::args().collect();
    debug_log(&format!("get_initial_media_file checking CLI args: {:?}", args));
    for arg in args.into_iter().skip(1) {
        if arg.starts_with('-') {
            continue;
        }

        let clean_path = clean_file_url_or_path(&arg);
        let path = Path::new(&clean_path);
        if path.exists() {
            debug_log(&format!("get_initial_media_file found valid path from CLI args: {}", clean_path));
            return Some(clean_path);
        }
    }

    debug_log("get_initial_media_file returning None");
    None
}
