mod commands;

use commands::dialog::InitialMediaState;
use tauri::menu::{AboutMetadataBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager, WindowEvent};

#[cfg(target_os = "macos")]
fn rebuild_mac_app_menu(app: &tauri::AppHandle, lang: &str) {
    let is_en = lang.eq_ignore_ascii_case("en");
    let open_file_label = if is_en { "Open File…" } else { "Mở tệp…" };
    let open_folder_label = if is_en { "Open Folder…" } else { "Mở thư mục…" };
    let settings_label = if is_en { "Settings…" } else { "Cài đặt…" };
    let file_menu_label = if is_en { "File" } else { "Tệp" };
    let edit_menu_label = if is_en { "Edit" } else { "Chỉnh sửa" };
    let about_comments = if is_en {
        "Ultra-lightweight personal media player & viewer"
    } else {
        "Trình duyệt ảnh & phát media cá nhân siêu nhẹ"
    };
    let about_credits = if is_en {
        "Bùi Việt Linh\nUltra-lightweight audio, video, image, and PDF viewer.\nGitHub: https://github.com/linhbv94/VXMedia"
    } else {
        "Bùi Việt Linh\nTiện ích phát nhạc, video, xem ảnh và tài liệu PDF siêu nhẹ.\nGitHub: https://github.com/linhbv94/VXMedia"
    };

    let build_menu = || -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
        let open_file = MenuItemBuilder::with_id("open_file", open_file_label)
            .accelerator("CmdOrCtrl+O")
            .build(app)?;
        let open_folder = MenuItemBuilder::with_id("open_folder", open_folder_label)
            .accelerator("CmdOrCtrl+Shift+O")
            .build(app)?;
        let open_settings = MenuItemBuilder::with_id("open_settings", settings_label)
            .accelerator("CmdOrCtrl+,")
            .build(app)?;
        let mut about_builder = AboutMetadataBuilder::new()
            .name(Some("VXMedia"))
            .version(Some(env!("CARGO_PKG_VERSION")))
            // Empty AppKit build version prevents fallback to CFBundleVersion.
            .short_version(Some(""))
            .copyright(Some("© 2026 Bùi Việt Linh. All rights reserved."))
            .authors(Some(vec!["Bùi Việt Linh".into()]))
            .comments(Some(about_comments))
            .website(Some("https://github.com/linhbv94/VXMedia"))
            .website_label(Some("GitHub — VXMedia"))
            .credits(Some(about_credits));
        about_builder = about_builder.icon(Some(tauri::include_image!("icons/icon.png")));

        let app_submenu = SubmenuBuilder::new(app, "VXMedia")
            .about(Some(about_builder.build()))
            .separator()
            .item(&open_settings)
            .separator()
            .services()
            .separator()
            .hide()
            .hide_others()
            .show_all()
            .separator()
            .quit()
            .build()?;

        let file_submenu = SubmenuBuilder::new(app, file_menu_label)
            .item(&open_file)
            .item(&open_folder)
            .separator()
            .close_window()
            .build()?;

        let edit_submenu = SubmenuBuilder::new(app, edit_menu_label)
            .undo()
            .redo()
            .separator()
            .cut()
            .copy()
            .paste()
            .select_all()
            .build()?;

        MenuBuilder::new(app)
            .item(&app_submenu)
            .item(&file_submenu)
            .item(&edit_submenu)
            .build()
    };

    if let Ok(menu) = build_menu() {
        let _ = app.set_menu(menu);
    }
}

#[tauri::command]
fn set_app_language(app: tauri::AppHandle, lang: String) {
    #[cfg(target_os = "macos")]
    rebuild_mac_app_menu(&app, &lang);
    #[cfg(not(target_os = "macos"))]
    let _ = (app, lang);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(InitialMediaState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            commands::dialog::debug_log(&format!("Single-instance secondary launch with argv: {:?}, cwd: {}", argv, cwd));
            let target_win = app.get_webview_window("main");
            for arg in argv.into_iter().skip(1) {
                if arg.starts_with('-') {
                    continue;
                }
                let clean_raw = commands::dialog::clean_file_url_or_path(&arg);
                let p = std::path::Path::new(&clean_raw);
                let resolved_path = if p.is_relative() && !cwd.is_empty() {
                    std::path::Path::new(&cwd).join(p)
                } else {
                    p.to_path_buf()
                };

                if resolved_path.exists() {
                    let path_str = resolved_path.to_string_lossy().to_string();
                    if let Some(ref win) = target_win {
                        let _ = win.emit("open-media-file", &path_str);
                        let _ = win.unminimize();
                        let _ = win.set_focus();
                    }
                }
            }
        }))
        .setup(|app| {

            #[cfg(target_os = "macos")]
            {
                if let Some(main_win) = app.get_webview_window("main") {
                    commands::window::sync_mac_traffic_lights(&main_win);
                }
                rebuild_mac_app_menu(app.handle(), "vi");
            }

            #[cfg(target_os = "windows")]
            {
                if let Some(main_win) = app.get_webview_window("main") {
                    let _ = main_win.set_decorations(false);
                }
            }

            Ok(())
        })
        .on_menu_event(|app_handle, event| match event.id().as_ref() {
            "open_file" => {
                let _ = app_handle.emit("trigger-open-file", ());
            }
            "open_folder" => {
                let _ = app_handle.emit("trigger-open-folder", ());
            }
            "open_settings" => {
                if let Some(win) = app_handle.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
                let _ = app_handle.emit("trigger-open-settings", ());
            }
            _ => {}
        })
        .on_window_event(|window, event| {
            #[cfg(target_os = "macos")]
            if matches!(
                event,
                WindowEvent::Resized(_) | WindowEvent::Focused(true) | WindowEvent::ScaleFactorChanged { .. }
            ) {
                if let Some(webview) = window.app_handle().get_webview_window(window.label()) {
                    commands::window::sync_mac_traffic_lights(&webview);
                }
            }
            if let WindowEvent::CloseRequested { .. } = event {
                // Only exit application if this is the last open window
                let remaining = window.app_handle().webview_windows();
                if remaining.len() <= 1 {
                    window.app_handle().exit(0);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            set_app_language,
            commands::fs_scan::get_directory_media,
            commands::clipboard::clipboard_files,
            commands::metadata::read_audio_metadata,
            commands::set_always_on_top,
            commands::set_traffic_lights_visible,
            commands::dialog::open_file_dialog,
            commands::dialog::open_folder_dialog,
            commands::dialog::get_initial_media_file,
            commands::dialog::log_frontend,
            commands::window::create_media_window,
            commands::fs_scan::read_file_binary,
            commands::print_file
        ])
        .build(tauri::generate_context!())
        .expect("error while building media_tool");

    commands::dialog::debug_log(&format!("Rust process starting. Args: {:?}", std::env::args().collect::<Vec<_>>()));

    app.run(|app_handle, event| {
        match &event {
            #[cfg(target_os = "macos")]
            tauri::RunEvent::Opened { urls } => {
                commands::dialog::debug_log(&format!("RunEvent::Opened received with {} urls: {:?}", urls.len(), urls));
                for url in urls {
                    let file_path = if let Ok(path) = url.to_file_path() {
                        Some(path.to_string_lossy().to_string())
                    } else if url.scheme() == "file" {
                        Some(url.path().to_string())
                    } else {
                        None
                    };

                    commands::dialog::debug_log(&format!("RunEvent::Opened resolved file_path: {:?}", file_path));

                    if let Some(path_str) = file_path {
                        // 1. Cache for get_initial_media_file() on cold start
                        if let Some(state) = app_handle.try_state::<InitialMediaState>() {
                            if let Ok(mut lock) = state.0.lock() {
                                *lock = Some(path_str.clone());
                                commands::dialog::debug_log(&format!("Saved path to InitialMediaState: {}", path_str));
                            }
                        } else {
                            commands::dialog::debug_log("CRITICAL: try_state::<InitialMediaState>() returned None in RunEvent::Opened!");
                        }

                        // 2. Emit to frontend if webview is already running and listening
                        let emit_res = app_handle.emit("open-media-file", path_str.clone());
                        commands::dialog::debug_log(&format!("Emitted open-media-file: {:?}", emit_res));

                        // 3. Bring window to front
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.unminimize();
                            let _ = win.set_focus();
                        }
                    }
                }
            }
            tauri::RunEvent::Ready => {
                commands::dialog::debug_log("RunEvent::Ready received");
            }
            _ => {}
        }
    });
}
