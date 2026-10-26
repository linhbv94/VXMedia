# VXMedia1.2.7 — QA và checkpoint release
Ngày:2026-10-26. User giao QA/release với bộ icon mới, gồm thay đổi fullscreen cursor/Close đang có.

- Frontend build PASS;18Node updater/release tests PASS;2recent tests PASS. Rust lib compile/test PASS nhưng có0test, không gọi là nghiệm thu native.
- Regression browser chạy lại PASS bằng Chrome đã cài, profile fixture riêng. Gồm audio/video không ngắt khi mở ảnh/tab khác, A–B, source race, playback exclusivity, fullscreen cursor:none/hồi phục, Close gọi đúng1lần trên fixture Mac/Win. Bridge mô phỏng không thay kiểm native/WebView2.
- Lượt đầu test bị sandbox chặn localhost; sau cấp quyền chạy test thì thiếu Playwright browser. Dùng Chrome đã cài qua biến BROWSER_EXECUTABLE_PATH, không cài browser hoặc đổi profile user; test đạt.
- Bộ icon mới đã xem: biểu tượng play xanh, ba lớp kính trên nền trong suốt. Chưa claim icon hệ điều hành đã đổi từ source; kiểm icon trong gói updater/installer sau CI. Giữ appID/updater key.
- Chưa native GUI mới/Windows WebView2/Intel/updater old→new trong lượt này. Không sửa backend playback để thay đổi icon.

Đang chuẩn bị tag1.2.7; chưa publish tại checkpoint này.
