# VXMedia 1.2.8 — QA và phát hành native SDK 27.0
Ngày: 2026-10-27. User giao release sau migration SDK cụm traffic lights.

- Đồng bộ giao diện nút đóng, thu nhỏ và phóng to (traffic lights) trên macOS sang chuẩn native SDK 27.0.
- Giữ nguyên toàn bộ engine playback, app ID, khóa updater, cấu hình đa nền tảng và icon.
- Tích hợp gate tự chứa `scripts/macos_sdk_gate.mjs`, wrapper `scripts/tauri_sdk.mjs` bảo vệ direct cargo build và npm wrapper.
- CI cập nhật runner macOS Silicon và Intel sang `xcode-27` để đảm bảo SDK 27.0 thật trên cả hai gói macOS.
- Local QA: 18 Node update tests + 2 recent opening tests + Vite production build + cargo test lib đạt 100%. Gate SDK 27.0 trên binary bundle local và codesign verification đạt 100%.
