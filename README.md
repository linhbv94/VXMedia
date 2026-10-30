# VXMedia — Personal Media Viewer & Audio/Video Player

[![Release](https://img.shields.io/github/v/release/linhbv94/VXMedia?style=flat-square&color=06b6d4)](https://github.com/linhbv94/VXMedia/releases/latest)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-0284c7?style=flat-square)](https://github.com/linhbv94/VXMedia/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Ecosystem](https://img.shields.io/badge/part%20of-VXUtilities-0ea5e9?style=flat-square)](../_summary/master_overview.md)

Ứng dụng desktop cá nhân siêu nhẹ, đa nền tảng (Windows 11+ & macOS Apple Silicon / Intel), phục vụ duyệt và chọn lọc ảnh tốc độ cao, đồng thời phát video và âm thanh với khả năng kiểm soát phím tắt chuẩn xác, tính năng lặp đoạn A–B Loop kèm hạ/tăng âm thích ứng (Adaptive Audio Fade) và module đọc tài liệu PDF tích hợp.

> **Tôn chỉ:** *One App, One Codebase, Unified Modules: Viewer + Player + PDF Reader trên Shared Core thống nhất.*  
> **Phiên bản hiện tại:** `v1.2.8` — Thành viên trong hệ sinh thái [VXUtilities](../_summary/master_overview.md).

---

## 1. Tính năng nổi bật

* **Duyệt ảnh siêu tốc (High-Speed Image Viewer):** Nạp ảnh tức thì, hỗ trợ phóng to/thu nhỏ mượt mà, xoay ảnh, xem thông tin EXIF và đánh dấu hàng loạt (Batch Mark & Copy).
* **Trình phát Video & Nhạc chuyên sâu:**
  * **A–B Loop:** Lặp đoạn âm thanh/video chuẩn xác từng khung hình với thuật toán **Adaptive Audio Fade** chống giật/bụp tiếng.
  * **Phát ngầm đa nhiệm (Background Playback):** Nhạc và video tiếp tục phát ngầm khi người dùng chuyển sang đọc PDF hoặc duyệt ảnh mà không bị gián đoạn.
  * **Kiểm soát tốc độ linh hoạt:** Điều chỉnh tốc độ phát mượt mà từ 0.25x đến 4.0x.
* **Module đọc tài liệu PDF (v1.2.0+):** Hiển thị tài liệu PDF sắc nét với Retina Canvas rendering qua `pdfjs-dist`, hỗ trợ chế độ đọc sách ban đêm (Dark Mode Invert) và tìm kiếm nội dung.
* **Quản lý Tab thư mục & Đa cửa sổ:** Hỗ trợ mở nhiều thư mục cùng lúc trên các tab riêng biệt, kéo tách tab thành cửa sổ độc lập để so sánh media side-by-side.
* **Tự động cập nhật trực tiếp (Auto-Update):** Tích hợp thông báo cập nhật góc dưới màn hình, tải và cài đặt phiên bản mới chỉ với 1-click mà không cần rời ứng dụng.
* **100% Offline & Bảo mật:** Hoạt động hoàn toàn trên thiết bị của bạn, không thu thập dữ liệu cá nhân, không telemetry và không yêu cầu đăng nhập.

---

## 2. Tải xuống & Cài đặt

Tải bản phát hành mới nhất dành cho hệ điều hành của bạn tại [GitHub Releases](https://github.com/linhbv94/VXMedia/releases/latest):

* **macOS (Apple Silicon & Intel):** Tải tệp `.dmg` hoặc `.app.tar.gz`. Kéo ứng dụng vào thư mục `/Applications`.
* **Windows (x64):** Tải bộ cài `.msi` hoặc tệp thực thi `.exe` độc lập.

---

## 3. Ngăn xếp Công nghệ (Tech Stack)

| Tầng | Công nghệ | Chi tiết |
|---|---|---|
| **Desktop Shell** | [Tauri v2](https://v2.tauri.app/) (Rust) | Quản lý cửa sổ native, đa tab, phím tắt toàn cục, IPC hiệu năng cao |
| **Frontend UI** | React 19 + TypeScript + Vite + Tailwind CSS | Giao diện Dark-first (`#0f1117`), Electric Cyan accents, responsive layout |
| **PDF Engine** | Mozilla `pdfjs-dist` | Render vector PDF trực tiếp trên Canvas độ phân giải Retina |
| **Native OS Integration** | Win32 API & macOS Cocoa (`NSPasteboard`, `NSURL`) | Đưa tệp vào native clipboard (`CF_HDROP`), Quick Look |

---

## 4. Hướng dẫn Phát triển & Biên dịch

### Yêu cầu môi trường
* Node.js ≥ 20.x và npm
* Rust & Cargo ≥ 1.80
* macOS: Xcode Command Line Tools (SDK 27.0 baseline) / Windows: C++ Build Tools

### Các lệnh phát triển
```bash
# Cài đặt thư viện frontend
npm install

# Khởi chạy chế độ phát triển (Hot reload)
npm run tauri dev

# Chạy kiểm thử tự động phát nền (Playback E2E)
npm run test:playback

# Biên dịch gói ứng dụng hoàn chỉnh (.app / .msi)
npm run build
npm run tauri build -- --bundles app
```

---

## 5. Hệ thống Tài liệu Đặc tả Kỹ thuật (Specification Suite)

Toàn bộ tài liệu đặc tả chuẩn hóa phục vụ việc triển khai (Execution Ground Truth) nằm tại thư mục [docs/spec/](docs/spec/):

1. 📋 [00_system_overview.md](docs/spec/00_system_overview.md): Tổng quan hệ thống, kiến trúc 3 tầng và 8 pha triển khai.
2. 🔄 [01_business_process.md](docs/spec/01_business_process.md): Sơ đồ quy trình nghiệp vụ Swimlane (Open-With, Viewer Batch Copy, Player A-B Loop).
3. ⚙️ [02_feature_flow.md](docs/spec/02_feature_flow.md): Luồng tính năng chi tiết, Natural Sort, Mark State và Adaptive Audio Fade.
4. 🎨 [03_ui_wireframe.md](docs/spec/03_ui_wireframe.md): Bố cục giao diện, wireframe HUD và bảng phím tắt đối chiếu 1:1 giữa Windows và macOS.
5. 🗄️ [04_api_data.md](docs/spec/04_api_data.md): Hợp đồng dữ liệu và Tauri IPC Commands, kiểu dữ liệu TypeScript.
6. 🧪 [05_qa_acceptance.md](docs/spec/05_qa_acceptance.md): Tiêu chuẩn nghiệm thu Gherkin đến AC-25, ma trận trường hợp biên (Edge Cases).
7. 🎬 [06_demo_presentation.md](docs/spec/06_demo_presentation.md): Kịch bản trình diễn nghiệm thu 3 hồi (DoD Playbook).
8. 📑 [07_folder_tabs_multi_window.md](docs/spec/07_folder_tabs_multi_window.md): Quản lý Tab Thư mục & Đa Cửa sổ, Global Playback.
9. 📖 [08_pdf_reader_module.md](docs/spec/08_pdf_reader_module.md): Module Đọc PDF, Retina Canvas render và chế độ Dark Mode Invert.

---

## 6. Giấy phép & Bản quyền (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**.  
Xem toàn văn giấy phép tại tệp [LICENSE](LICENSE).

Bản quyền © 2026 Viet Linh Bui. Đã đăng ký toàn bộ quyền.
