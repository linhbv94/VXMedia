# VXMedia1.2.7 — QA và checkpoint release
Ngày:2026-10-26. User giao QA/release với bộ icon mới, gồm thay đổi fullscreen cursor/Close đang có.

- Frontend build PASS;18Node updater/release tests PASS;2recent tests PASS. Rust lib compile/test PASS nhưng có0test, không gọi là nghiệm thu native.
- Regression browser chạy lại PASS bằng Chrome đã cài, profile fixture riêng. Gồm audio/video không ngắt khi mở ảnh/tab khác, A–B, source race, playback exclusivity, fullscreen cursor:none/hồi phục, Close gọi đúng1lần trên fixture Mac/Win. Bridge mô phỏng không thay kiểm native/WebView2.
- Lượt đầu test bị sandbox chặn localhost; sau cấp quyền chạy test thì thiếu Playwright browser. Dùng Chrome đã cài qua biến BROWSER_EXECUTABLE_PATH, không cài browser hoặc đổi profile user; test đạt.
- Bộ icon mới đã xem: biểu tượng play xanh, ba lớp kính trên nền trong suốt. Chưa claim icon hệ điều hành đã đổi từ source; kiểm icon trong gói updater/installer sau CI. Giữ appID/updater key.
- Chưa native GUI mới/Windows WebView2/Intel/updater old→new trong lượt này. Không sửa backend playback để thay đổi icon.

## Kết quả public

Đã publish stable [v1.2.7](https://github.com/linhbv94/VXMedia/releases/tag/v1.2.7), tag commit `4da0e4ded64950112745601cdad18b0e36bcca68`, PR #10 đã merge. Build run40357699955 và publish run40362353122 thành công. Manifest public và toàn bộ6assets HTTP200 không dùng đăng nhập; chữ ký updater/digest hợp lệ.

Icon trong cả hai gói Mac: ICNS byte-exact với source mới; ID/version/architecture đúng. Trích NSIS Windows bằng 7-Zip chính thức,7payload ICO trong PE byte-exact với icon mới; PE x64 version1.2.7. Evidence JSON kèm repo. Runtime native Windows/Intel và lượt update cũ→mới chưa test trong lượt này; không gộp với bằng chứng build/package/browser.

Lượt QA/release VXMedia này đã đóng theo quy ước Codex.
