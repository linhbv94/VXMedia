# Quy chế Quản lý Phiên bản & Lịch sử Phát hành (Version Management & Changelog)

> **Tài liệu:** `docs/version_management.md`  
> **Dự án:** VXMedia (`media_tool`)  
> **Phiên bản:** `v1.2.4`
> **Quy chuẩn:** Tuân thủ Semantic Versioning (SemVer 2.0.0) & Hướng dẫn [AGENTS.md](../../AGENTS.md)

---

## v1.2.4 — Video phát nền, fullscreen và Support (2026-10-09)
- HUD luôn hiện ở cửa sổ thường mờ còn 40% sau 2 giây idle; tương tác khôi phục 100%, media giữ nguyên độ sáng.
- Fullscreen native Tauri, HUD fullscreen ẩn ngay/di chuột hiện/idle 2 giây ẩn; khôi phục HUD cửa sổ thường khi thoát.
- Ẩn Windows controls và vô hiệu dải drag trong fullscreen; regression viewport video sau resize. Windows native còn cần QA.
- Video có tiếng giữ tiến độ và A–B khi mở ảnh/chuyển tab; thanh phát nền điều khiển đúng nguồn, audio/video nhường quyền phát.
- Support QR căn giữa, bỏ thông tin chuyển khoản và nút sao chép; làm sạch wording hiển thị.
- Trạng thái build/publish và giới hạn QA thực tế lưu tại [work_log.md](../../_summary/work_log.md); version nguồn không tự chứng minh release đã công khai.

## 1. Quy chuẩn Đánh số Phiên bản (Semantic Versioning 2.0.0)

Hệ thống áp dụng định dạng chuẩn: **`MAJOR.MINOR.PATCH`**

```text
v1.2.0
 │ │ └── PATCH: Sửa lỗi (Bug fixes), vá bảo mật, tinh chỉnh nhỏ không đổi giao diện lớn.
 │ └──── MINOR: Bổ sung tính năng mới, mở rộng hỗ trợ OS mà vẫn giữ tương thích ngược.
 └────── MAJOR: Thay đổi kiến trúc lớn, phá vỡ tính tương thích ngược (Breaking Changes).
```

### Quy tắc đồng bộ phiên bản (Version Sync Rules)
Từ v1.2.1, chạy `npm run version:set -- X.Y.Z` để đồng bộ cả ba cấu hình dưới đây và hai lockfile npm/Cargo. Phát hành đa nền tảng qua GitHub Actions theo [hướng dẫn release](release_guide.md).

Khi phát hành bản cập nhật mới, số phiên bản bắt buộc phải được cập nhật đồng nhất trên 3 tệp cấu hình cốt lõi:
1. [package.json](../package.json): trường `"version": "x.y.z"`
2. [src-tauri/Cargo.toml](../src-tauri/Cargo.toml): trường `version = "x.y.z"`
3. [src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json): trường `"version": "x.y.z"`

---

## 2. Quy trình Phát hành (Release Workflow)

```text
Phát triển / Fix bug ──► Build kiểm thử (Dev) ──► Chạy QA Smoke Test (AC-01..23) ──► Cập nhật Version ──► Build Release Bundle ──► Lưu vết Changelog
```

### Các bước đóng gói bản chính thức:
1. **Kiểm tra biên dịch Frontend:**
   ```bash
   npm run build
   ```
2. **Đóng gói Bundle tương ứng với hệ điều hành:**
   - **Trên macOS:**
     ```bash
     npx tauri build --bundles app
     ```
     *Output:* `src-tauri/target/release/bundle/macos/VXMedia.app`
   - **Trên Windows 11:**
     ```bash
     npx tauri build --bundles nsis,msi
     ```
     *Output:* `src-tauri/target/release/bundle/nsis/VXMedia_x64-setup.exe`
3. **Tiêu chuẩn Nghiệm thu Đầu ra (Release Gate):**
   - Đạt 100% các tiêu chí chấp thuận trong [docs/spec/05_qa_acceptance.md](spec/05_qa_acceptance.md), [docs/spec/07_folder_tabs_multi_window.md](spec/07_folder_tabs_multi_window.md) và [docs/spec/08_pdf_reader_module.md](spec/08_pdf_reader_module.md).
   - Kiểm tra Zero-Residue Quit: Thoát app sạch sẽ không giữ lại tiến trình ngầm chiếm dụng CPU/RAM.

---

## 3. Lịch sử Phiên bản (Changelog & Milestones)

### v1.2.4 — Giữ video có tiếng khi mở ảnh (2026-10-09)

- Sửa lỗi mở tab ảnh làm dừng/reset video trên Windows và macOS; giữ player, tiến độ và A–B khi quay lại.
- Thanh phát nền điều khiển nguồn vừa nghe, video/audio nhường quyền phát, xử lý hết file/đóng tab theo thư mục nguồn.
- Thêm regression video có tiếng và AC-24/AC-25; cần ghi riêng QA app Tauri native, không suy từ test WAV/Chromium.

### v1.2.3 — Settings và quyền sở hữu audio (2026-10-09)

- Đã phát hành; Cập nhật/Giới thiệu/Ủng hộ tác giả thành mục riêng, QR thật, tooltip và quyền sở hữu audio được rà soát.
- Regression WAV pass nhưng user phát hiện video có tiếng vẫn dừng/reset khi mở ảnh trên cả hai OS; bản sửa video được đưa vào v1.2.4.

### v1.2.2 — Icon và cập nhật đa nền tảng (2026-10-08)

- Đã phát hành icon mới và bộ cài/updater Windows x64, macOS Silicon/Intel; user xác nhận auto-update hoạt động trên Windows/macOS.

### v1.2.1 — GitHub Releases và cập nhật trong app (2026-10-07)

- Thêm Tauri Updater, tự kiểm tra khi mở bản đã cài và nút cập nhật trong Giới thiệu.
- Build Windows x64, macOS Apple Silicon/Intel trên runner GitHub tiêu chuẩn cho repo public; tạo release nháp và kiểm tra đủ platform trước publish.
- Ký gói cập nhật bằng khóa Tauri riêng miễn phí; macOS ký ad-hoc, Windows cài NSIS theo user.
- Sửa tương thích kiểu window handle và tham số OpenClipboard của adapter Windows.
- Thêm script đồng bộ version, kiểm thử luồng updater và hướng dẫn [phát hành/cài đặt](release_guide.md).
- Trạng thái: đã kiểm thử logic và build macOS cục bộ; chờ thêm GitHub secret, merge PR, build Windows/Intel và smoke test trước phát hành.


### 🌟 v1.2.0 — Module Đọc PDF Siêu tốc, In ấn Native & Ngăn kéo Ảnh Thu nhỏ
*Ngày phát hành:* 2026-10-06  
*Trọng tâm:* Nâng cấp VXMedia thành Workspace Content Viewer toàn diện với việc tích hợp **PDF thành Media Type thứ 4** bình đẳng cùng Image, Video và Audio.

#### 📖 Trình đọc PDF Hiệu năng cao (PDF Reader Module):
- **Lõi Mozilla `pdfjs-dist`:** Tích hợp Web Worker nền giải mã và dựng từng trang ra phần tử Canvas độ nét cao nhân với `window.devicePixelRatio` (sắc nét hoàn hảo trên màn hình Retina và 4K).
- **Cuộn dọc liên tục (Continuous Scroll):** Lướt đọc các trang nối tiếp mượt mà, tối ưu DOM ảo hóa giúp RAM luôn duy trì dưới 80 MB.
- **Thanh Điều khiển Nhất quán Thị giác (Visual Contract Alignment):**
  - Giữ nguyên container kính mờ `glass-panel rounded-2xl p-2.5` đồng bộ với Viewer ảnh và Video Player.
  - Vị trí nút Prev/Next file giữ nguyên ở góc trái, loại bỏ nút Mark và Fullscreen để nhường không gian cho các công cụ đọc tài liệu.
  - Ô nhập số trang trực tiếp: gõ số trang và nhấn Enter để nhảy tới trang tức thì.
  - Phóng to/thu nhỏ (+/-), vừa chiều ngang (`W` - Fit Width), xoay 90° (`R`), và chế độ đảo màu đọc đêm (`I` - Invert Dark Mode).
- **Ngăn kéo Ảnh Thu nhỏ Bên trái (Left Sidebar Thumbnails):** Bấm phím `T` để bật/tắt drawer ảnh thu nhỏ các trang; click vào trang nào lập tức cuộn mượt đến trang đó; trang hiện tại được viền sáng Cyan.
- **In ấn Chuẩn Hệ Điều Hành (Native OS Print):** Bấm `Cmd+P` / `Ctrl+P` hoặc click icon máy in 🖨️ mở trực tiếp Print Dialog của OS; CSS `@media print` dàn trang sạch sẽ chỉ in nội dung tài liệu.
- **Đồng bộ Âm thanh Nền Toàn cục:** Đang phát nhạc ở tab Audio, chuyển sang tab đọc PDF nhạc vẫn phát êm đềm liên tục, thanh `MiniAudioPill` cho phép điều khiển nhạc ở góc dưới.

### 🌟 v1.1.1 — Tự động Cuộn Danh sách Item Đang chọn & Hỗ trợ Giới thiệu Song ngữ Đa nền tảng
*Ngày phát hành:* 2026-10-06  
*Trọng tâm:* Tinh chỉnh trải nghiệm duyệt danh sách (Sidebar Auto-scroll), hỗ trợ hộp thoại Giới thiệu (About) song ngữ Việt - Anh đa nền tảng, thích ứng tối ưu cho Windows không có thanh MenuBar chuẩn macOS.

#### 🎯 Trải nghiệm Danh sách & Thao tác Chuột Tự nhiên:
- **Tự động Cuộn Danh sách tới Item Đang chọn (Sidebar Auto-scroll):** Khi đang mở xem một item và bật mở danh sách (`Sidebar`), danh sách sẽ tự động cuộn mượt mà (`scrollIntoView` block `center`) đến đúng vị trí của item đang chọn thay vì luôn hiển thị từ đầu danh sách. Hỗ trợ bám sát con trỏ khi chuyển bài.
- **Đóng Danh sách khi Click ra ngoài (Click-outside Dismiss):** Khi đang bật danh sách, người dùng có thể nhấp chuột bất kỳ đâu ra ngoài thanh danh sách (như vùng hiển thị ảnh, video hoặc khung nền) để đóng danh sách ngay lập tức mà không bắt buộc phải bấm nút [X].
- **Hiển thị Nút HUD khi Rê Chuột (Hover-Reveal HUD Button):** Khi HUD đang bị ẩn (`H`), toàn bộ giao diện thanh tiêu đề và thông tin media ẩn hoàn toàn. Tuy nhiên, khi người dùng rê chuột lên đúng vùng tọa độ của nút HUD ở góc trên bên phải, riêng nút HUD sẽ mượt mà hiện lên (`EyeOff` kèm viền sáng Cyan) để người dùng có thể nhấp chuột hiện lại HUD một cách trực quan bằng chuột mà không bắt buộc phải dùng phím bấm `H`. Khi rời chuột ra ngoài, nút tự động ẩn đi.

#### 🌐 Giới thiệu (About) Song ngữ & Thích ứng Giao diện Windows:
- **macOS MenuBar:** Menu hệ thống native `VXMedia > About VXMedia` được cập nhật đầy đủ credit song ngữ (Tiếng Việt & English), nêu bật triết lý định vị của ứng dụng và thông tin tác giả `by Viet Linh Bui`.
- **Windows Adaptation:** Do Windows sử dụng giao diện cửa sổ không viền (Frameless Custom Titlebar) và không có thanh menubar toàn cục, thông tin About được tích hợp thành tab chuyên biệt bên trong bảng Cài đặt (`SettingsModal`), đồng thời có thể mở nhanh qua:
  - Phím tắt chuẩn Windows: `F1`
  - Menu chuột phải (`ContextMenu`): Mục *Giới thiệu VXMedia...*
  - Biểu tượng bánh răng Cài đặt trên thanh `WindowBar`.
- **Nội dung Song ngữ:** Hỗ trợ chuyển đổi tức thì giữa Tiếng Việt và Tiếng Anh với 5 điểm khác biệt cốt lõi của VXMedia so với các trình phát truyền thống (Tốc độ khởi động siêu tốc, Adaptive Audio Fade, phím tắt A-B Loop, lọc ảnh Spacebar, bảo mật riêng tư 100% offline).

### 🌟 v1.1.0 — Quản lý Tab Thư mục, Phát nhạc Toàn cục & Đa Cửa sổ Độc lập
*Ngày phát hành:* 2026-10-06  
*Trọng tâm:* Nâng cấp toàn diện kiến trúc 4 tầng: `App ──► Windows ──► Tabs ──► Folder Sessions`. Bổ sung thanh tab thư mục, cơ chế phát nhạc ngầm liên tục khi duyệt ảnh, di chuyển tab sang cửa sổ độc lập mới, và hoàn thiện 100% độ sẵn sàng biên dịch cho Windows 11 qua kiểm định kép Dual-Agent cùng Codex CLI.

#### 🗂️ Quản lý Tab Thư mục (Folder Sessions & TabBar):
- **Kiến trúc FolderSession:** Mỗi thư mục là một session độc lập lưu trữ danh sách tệp, vị trí con trỏ duyệt (`currentIndex`) và bộ tệp được đánh dấu (`markedPaths: Set<string>`).
- **Quy tắc Điều hướng Thông minh:**
  - *Cùng thư mục:* Tự động tái sử dụng tab hiện có và di chuyển con trỏ tới tệp được chọn, không tạo tab trùng lặp.
  - *Khác thư mục:* Tự động mở tab mới cho thư mục đích.
- **Thanh TabBar Tích hợp:** Đặt tinh gọn trên thanh tiêu đề `WindowBar`, hỗ trợ badge đếm số tệp đã đánh dấu (`markedCount`), nút đóng tab (`x`), nút mở tab mới (`+`), và menu ngữ cảnh chuột phải (*Chuyển sang Cửa sổ Mới*, *Đóng Tab*, *Đóng các Tab khác*).

#### 🎵 Phát Âm thanh Toàn cục (Global Audio Playback & Persistent Engine):
- **Phần tử `<audio>` Bền vững:** Nâng cấp phần tử âm thanh lên tầng gốc của ứng dụng (`App.tsx`), giữ nguyên dòng phát nhạc liên tục khi người dùng chuyển sang tab duyệt ảnh hoặc chuyển qua thư mục khác.
- **Thanh Điều khiển Nổi MiniAudioPill:** Hiển thị viên thuốc kính mờ ở góc dưới màn hình khi đang phát nhạc ngầm trong lúc xem ảnh. Hiển thị tên bài hát, tiến trình thời gian thực, nút Play/Pause, nút chuyển bài kế tiếp (`Next`), và nút bấm 1-click nhảy trực tiếp về tab phát nhạc.
- **Điều phối Cạnh tranh Âm thanh/Video:** Khi phát một video ở bất kỳ tab nào, trình phát sẽ tự động tạm dừng âm thanh toàn cục để tránh trùng lặp tiếng.
- **Chuyển bài Nhạc Độc lập:** Hết bài hát hoặc bấm Next trên `MiniAudioPill` sẽ chuyển đúng bài kế tiếp trong danh sách bài hát của session âm thanh, không ảnh hưởng đến vị trí ảnh đang xem ở tab active.

#### 🪟 Kiến trúc Đa Cửa sổ Độc lập (Multi-Window Isolation):
- **Chuyển Session sang Cửa sổ Mới (Move to New Window):** Click chuột phải vào tab và chọn "Chuyển sang Cửa sổ Mới" để kích hoạt lệnh IPC `create_media_window`. Toàn bộ dữ liệu session (danh sách tệp, con trỏ, file đánh dấu) được đóng gói và chuyển giao nguyên vẹn sang cửa sổ mới.
- **Vòng đời Cửa sổ An toàn:** Sửa đổi sự kiện `WindowEvent::CloseRequested` trong `src-tauri/src/lib.rs` để ứng dụng chỉ thoát khi đóng cửa sổ cuối cùng (`remaining.len() <= 1`). Người dùng có thể đóng cửa sổ chính hoặc cửa sổ phụ mà không làm sập các cửa sổ còn lại.
- **Giao thức Đồng bộ Đa Cửa sổ:** Sử dụng `BroadcastChannel('vxmedia_bus')` để các cửa sổ chia sẻ trạng thái âm thanh và đồng bộ lệnh dừng/phát.

#### 🛡️ Kiểm định Kép & Vá Lỗi Sẵn sàng cho Windows 11 (Dual-Agent Codex Hardening):
- **Triệt tiêu Nguy cơ Deadlock Webview2:** Chuyển đổi lệnh `create_media_window` từ hàm đồng bộ sang `pub async fn` bất đồng bộ trên Tauri tokio runtime, tuân thủ nghiêm ngặt cảnh báo Webview2 của Tauri trên Windows.
- **Vá Lỗi Rules of Hooks (React):** Loại bỏ việc gọi `useMemo` bên trong biểu thức rẽ nhánh ternary khi xác định `markedPaths`, giải quyết triệt để lỗi crash React khi mở tab đầu tiên hoặc đóng tab cuối cùng.
- **Chuẩn hóa Windows Clipboard Ownership:** Truyền `hwnd` hợp lệ của cửa sổ vào `OpenClipboard(hwnd)` và kiểm tra `EmptyClipboard()`, đảm bảo `SetClipboardData` và `CF_HDROP` gán quyền sở hữu chính xác vào hệ điều hành Windows Explorer.
- **Phòng ngừa Kéo Cửa sổ Ngoài Ý muốn:** Bổ sung selector `[data-no-drag], [role="tab"], .tab-bar, .tab-item` vào bộ lọc sự kiện chuột `WindowBar`, đảm bảo thao tác click tab không kích hoạt lệnh kéo di chuyển cửa sổ.
- **Kiểm soát Phạm vi Shuffle:** Bổ sung ràng buộc đối chiếu độ dài `shuffledIndices.length === s.items.length` trước khi tra cứu chỉ số xáo trộn, ngăn ngừa crash màn hình trống khi chuyển đổi giữa các thư mục có số lượng tệp khác nhau.

### 🛠️ v1.0.1 — Chuẩn hóa Toggle & Sẵn sàng Build Windows 11
*Ngày phát hành:* 2026-10-06  
*Trọng tâm:* Chuẩn hóa UI điều khiển trình phát (Player HUD) và vá toàn diện 4 lỗi compiler Win32 để đảm bảo build suôn sẻ trên Windows 11.

#### 🎨 Cải tiến Giao diện (UI/UX Refinements):
- **Chuẩn hóa nút Toggle Shuffle & Repeat:**
  - Gỡ bỏ hoàn toàn khung viền (border) và nền (background box) của nút Shuffle.
  - Thống nhất cơ chế phản hồi thị giác: khi kích hoạt chỉ đổi màu icon sang cyan (`text-cyan-400`); không có khung bao quanh.
  - Nút Repeat hiển thị gọn gàng kèm số `1` hoặc `All` khi bật, và icon mờ khi tắt.

#### 🪟 Vá Lỗi & Tương thích Biên dịch Windows 11 (Dual-Agent Review Pass):
- **Khắc phục lỗi Compiler Tauri `RunEvent::Opened`:** Thêm cờ `#[cfg(target_os = "macos")]` bảo vệ match arm trong `src-tauri/src/lib.rs` (tránh lỗi `E0599` vì variant này không tồn tại trên Windows trong Tauri 2).
- **Vá chữ ký hàm `OpenClipboard` trong `windows 0.58`:** Chuyển đổi từ `.as_bool()` sang xử lý `Result<()>` trả về theo đúng đặc tả `windows-rs`.
- **Bổ sung feature `"Win32_System_Ole"` & hằng số `CF_HDROP`:** Khắc phục thiếu import hằng số định dạng clipboard file trong `Cargo.toml` và `clipboard.rs`.
- **Sửa kiểu tham số `SetClipboardData` & bọc RAII `ClipboardGuard`:** Truyền trực tiếp `HANDLE(h_global.0)` thay vì `Some(...)`, bổ sung RAII guard tự động gọi `CloseClipboard()` và giải phóng bộ nhớ khi xảy ra lỗi.
- **Hỗ trợ Dấu phân cách Thư mục Windows (`\`):** Cập nhật hàm bóc tách tên file trong `src/services/tauri.ts` để nhận diện cả `/` và `\`.
- **Đồng bộ Định dạng File Scanner:** Bổ sung đuôi `.ico`, `.m4v`, `.aiff` vào hàm phân loại media `fs_scan.rs`.

---

### 🚀 v1.0.0 — Bản Phát hành Nền tảng (Adapt tương đối cho macOS)
*Ngày phát hành:* 2026-10-06  
*Trọng tâm:* Hoàn thiện kiến trúc cơ bản của ứng dụng, hoàn thiện 2 module Viewer + Player và tương thích trải nghiệm người dùng trên hệ điều hành **macOS (Apple Silicon & Intel)**.

#### 🌟 Tính năng Cốt lõi (Core Features):
- **Kiến trúc One App, Shared Core:** Tích hợp 2 chế độ hiển thị linh hoạt trong cùng 1 cửa sổ:
  - **Module Viewer (Duyệt ảnh):** Hỗ trợ nạp ảnh siêu tốc, zoom, pan tự do, xoay 90°, lật ngang/dọc, thanh HUD mờ nổi phía trên tự ẩn.
  - **Module Player (Video & Audio):** Phát video mượt mà, hỗ trợ thẻ hiển thị audio chuyên dụng, tự động tải ID3 Metadata (tiêu đề, nghệ sĩ, ảnh bìa album).
- **Hệ thống Lặp A–B Đột phá (A–B Loop with Adaptive Audio Fade):** Đặt điểm [A] và [B] với độ trễ chuyển tiếp fade out/fade in siêu êm (0ms → 100ms), triệt tiêu hoàn toàn tiếng "pop" giật khi lặp âm thanh.
- **Duyệt Thư mục Tự nhiên (Natural Sort):** Sắp xếp thứ tự tệp theo chuẩn trực giác của con người (ví dụ: `img2.jpg` đứng trước `img10.jpg`).
- **Chọn lọc & Đánh dấu Tệp (Mark Session):** Đánh dấu nhiều tệp tin (`Mark`) và sao chép/cắt trực tiếp vào Clipboard hệ điều hành bằng phím tắt `Cmd+C` / `Cmd+X`.

#### 🍏 Thích ứng & Tối ưu hóa sâu cho macOS:
- **Tích hợp Titlebar Overlay chuẩn macOS:** Cấu hình `titleBarStyle: Overlay`, ẩn tiêu đề mặc định và căn chỉnh thẳng hàng tuyệt đối thanh công cụ WindowBar với cụm 3 nút đèn giao thông (Traffic Lights: Đỏ, Vàng, Xanh).
- **Khắc phục lỗi Mini PiP:**
  - Thiết kế thanh điều khiển Mini PiP dạng viên thuốc kính mờ `< [ ⏯ ] >` đặt ở góc dưới cùng, thanh timeline mảnh 2px.
  - **Fix lỗi rớt dòng Titlebar:** Sử dụng trực tiếp Cocoa API `standardWindowButton` để ẩn/hiện 3 nút hệ thống khi vào/ra chế độ PiP mà không phá vỡ style mask của cửa sổ, giải quyết triệt để lỗi bị đẩy thành 2 hàng tiêu đề sau khi thoát PiP.
- **Hỗ trợ Native File Association & "Open With":**
  - Đăng ký `CFBundleDocumentTypes` trong `Info.plist` cho toàn bộ định dạng ảnh, video và audio.
  - Xử lý lệch vòng đời Tauri 2.12.1 (sự kiện `RunEvent::Opened` đến trước `Ready`), đăng ký State ở tầng Builder kết hợp cơ chế AppleEvent Kernel Fallback để đảm bảo click đúp tệp hoặc chọn "Open With" từ Finder luôn tự động nạp tệp ngay lập tức (cả lúc app chưa chạy lẫn lúc đang chạy).
- **Lưu trữ Cấu hình Bền vững (Config Persistence):**
  - Lưu trạng thái chế độ lặp (`Repeat 1`, `Repeat All`, `Repeat Off`), mức âm lượng và cài đặt người dùng vào hệ thống Webview LocalStorage của macOS (`~/Library/Application Support/com.vxmedia.desktop/`).
  - Khôi phục chính xác chế độ lặp khi mở lại ứng dụng.
- **Bộ Biểu tượng macOS Chuẩn hóa (`icon.icns`):**
  - Chuyển đổi và đóng gói bộ icon native macOS 10 kích thước (16×16 đến 1024×1024 Retina chuẩn `ic12`, 842 KB) hiển thị sắc nét trên Dock và Finder.
- **Thoát Sạch Tuyệt đối (Zero-Residue Quit):** Lắng nghe sự kiện đóng cửa sổ để hủy tiến trình ngay tức thì, xóa sạch chấm tròn trên Dock macOS.

---

## 4. Lộ trình Phát triển Kế tiếp (Roadmap)

### 📌 v1.1.0 — Kiến trúc Tab Thư mục & Đa Cửa sổ (Phase 1) & Tương thích Windows 11
- [ ] **Kiến trúc Tab Thư mục (Folder Tabs):**
  - Quản lý phiên thư mục (`FolderSession`): Một tab đại diện cho một thư mục làm việc (Workspace).
  - Tái sử dụng tab khi mở tệp cùng thư mục; mở tab mới khi mở tệp khác thư mục.
  - Bảo toàn trạng thái zoom, pan, mark files và index khi chuyển đổi qua lại giữa các tab.
- [ ] **Phát lại Toàn cục (Global Playback Session):**
  - Tách rời luồng phát âm thanh (`<audio>`) ở cấp độ ứng dụng (App-Level).
  - Nghe nhạc ở tab Nhạc → chuyển sang xem ảnh ở tab Ảnh: nhạc tiếp tục phát mượt mà không bị ngắt.
  - Xử lý tranh chấp âm thanh: phát bài mới hoặc video thì bài cũ nhường quyền ngay lập tức.
- [ ] **Kiến trúc Đa Cửa sổ (Multi-Window Phase 1):**
  - Tích hợp lệnh `Chuyển sang Cửa sổ Mới (Move to New Window)` trên từng tab.
  - Tách và chuyển nguyên vẹn session sang cửa sổ Tauri mới độc lập phục vụ nhu cầu so sánh media side-by-side.
  - Đóng cửa sổ phụ an toàn, bảo toàn cửa sổ chính và luồng âm thanh toàn cục.
- [ ] **Tương thích & Đóng gói trên Windows 11:**
  - Kiểm tra hệ thống phím tắt `Ctrl` và tích hợp Clipboard `CF_HDROP`.
  - Đóng gói bộ cài tự động NSIS `.exe` (`VXMedia_x64-setup.exe`).

### 📌 v1.2.0 — Nâng cấp Hiệu năng & Tiện ích Mở rộng
- [ ] Tích hợp tính năng phím tắt gán đánh dấu nhanh theo số (Quick Rating / Tagging 1–5 sao).
- [ ] Hỗ trợ cấu hình tùy biến danh sách phím tắt tự do theo thói quen người dùng.
- [ ] Đóng gói file phân phối `.dmg` chính thức cho người dùng macOS.

---

## 5. Danh mục Chờ (Backlog — Future Capabilities)

> [!IMPORTANT]
> **TRẠNG THÁI: BACKLOG — CHƯA TRIỂN KHAI (NOT IMPLEMENTED)**  
> Các tính năng dưới đây nằm trong danh mục chờ của kiến trúc tương lai, **tuyệt đối KHÔNG triển khai ở v1.1.0**.

### ⏳ Detachable & Cross-Window Tabs (Phase 2 & Phase 3)
* **Kéo thả Tab bung Cửa sổ (Drag-to-Detach):** Kéo trực tiếp một Tab ra khỏi cửa sổ hiện tại để bung thành cửa sổ mới tại vị trí con trỏ chuột.
* **Kéo thả Tab qua lại giữa các Cửa sổ (Cross-Window Drag & Drop):** Kéo Tab từ Cửa sổ A thả sang thanh Tab của Cửa sổ B và ngược lại.
* *Lưu ý kiến trúc:* Kiến trúc v1.1.0 phải đảm bảo phân định quyền sở hữu `FolderSession` độc lập với `Window` để khi kích hoạt tính năng này ở tương lai không bị xung đột.

## Bản vá fullscreen chưa phát hành — 2026-10-26
- Cursor theo trạng thái HUD fullscreen; giữ hiện khi Settings/context menu mở.
- Close trong HUD fullscreen trên cả macOS/Windows, đóng trực tiếp qua bridge native. Không thay controls cửa sổ thường.
