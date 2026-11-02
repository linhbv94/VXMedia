# System Specification Overview: Media Tool (`_spec0_system`)

> **Tên sản phẩm:** Cross-Platform Personal Media Viewer & Player (`media_tool`)  
> **Phiên bản tài liệu:** 1.0.0 (V1 Planning & Architecture)  
> **Ngày cập nhật:** 2026-10-01  
> **Nền tảng mục tiêu:** Windows 11+ (x64) & macOS (Apple Silicon ưu tiên)  
> **Đối tượng tài liệu:** Lead Developer, Dev Agents, Test Agents, Product Owner  

---

## 1. Tôn chỉ & Tầm nhìn Sản phẩm (Product Vision)

**Media Tool** là ứng dụng desktop cá nhân siêu nhẹ, đa nền tảng, được xây dựng với nguyên tắc: **Một ứng dụng, một kho mã nguồn duy nhất (One App, One Codebase), hai phân hệ logic độc lập: Viewer và Player trên nền Shared Core.**

Ứng dụng sinh ra nhằm phục vụ nhu cầu làm việc hàng ngày của Owner:
1. **Trải nghiệm tương tác đồng nhất:** Hành vi duyệt, phím tắt và phản hồi nhất quán giữa Windows và macOS (thay vì phụ thuộc vào sự khác biệt giữa Windows Photos/Media Player và macOS Preview/QuickTime).
2. **Kiểm soát hoàn toàn phím tắt & luồng công việc (Workflow):** Tối ưu hóa tối đa cho thao tác bằng bàn phím (Keyboard-first), loại bỏ các thanh công cụ cồng kềnh.
3. **Tiện ích siêu nhẹ (Lightweight Utility):** Tốc độ mở file tức thì, chuyển file liền mạch, tiêu tốn ít tài nguyên khi chạy nền.
4. **Hợp nhất ảnh, video và âm thanh trong một công cụ:** Không cần chuyển đổi qua lại giữa nhiều ứng dụng rời rạc khi duyệt tài nguyên media trong thư mục.

> **Tôn chỉ cốt lõi:**  
> *"Định dạng media có thể thay đổi, nhưng trải nghiệm tương tác cốt lõi phải luôn luôn nhất quán và đoán định trước được."*

Ứng dụng **KHÔNG** cạnh tranh với các phần mềm chuyên sâu như VLC, IINA, Photos, hay phần mềm biên tập chuyên nghiệp. V1 tập trung giải quyết triệt để bài toán: **Duyệt nhanh → Chọn lọc nhanh → Phát media mượt mà với độ chính xác cao.**

---

## 2. Bản đồ Hồ sơ Đặc tả (Specification Index)

Toàn bộ các tài liệu đặc tả kỹ thuật chi tiết được kết nối bằng đường dẫn tương đối:

- 📋 [01_business_process.md](01_business_process.md): Sơ đồ Swimlane vĩ mô, luồng Open-With từ OS & Ma trận Quyết định Điều phối Media (`_spec1_business_process`)
- 🔄 [02_feature_flow.md](02_feature_flow.md): Chi tiết Luồng Logic, Cơ chế Sắp xếp Tự nhiên (Natural Sort), State Machine cho Mark, Timeline Seek & A-B Loop (`_spec2_feature_flow`)
- 🎨 [03_ui_wireframe.md](03_ui_wireframe.md): Đặc tả Giao diện Tối giản (Minimalist HUD), Layout Viewer, Layout Player & Bảng Hợp đồng Phím tắt Chuẩn (`_spec3_ui_wireframe`)
- 🗄️ [04_api_data.md](04_api_data.md): Hợp đồng Dữ liệu, Schema IPC Commands giữa Tauri Rust và Frontend TypeScript, Native OS Clipboard Specs (`_spec4_api_data`)
- 🧪 [05_qa_acceptance.md](05_qa_acceptance.md): Tiêu chuẩn Nghiệm thu Gherkin (AC-01 → AC-12), Ma trận Edge Cases & Checklist Kiểm thử Khói (`_spec5_qa_acceptance`)
- 🎬 [06_demo_presentation.md](06_demo_presentation.md): Kịch bản Trình diễn Demo (DoD Playbook) & Hướng dẫn Thiết lập Bộ Dữ liệu Mẫu Fixtures (`_spec6_demo_presentation`)

---

## 3. Kiến trúc Tổng thể Hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình 3 tầng phân định ranh giới rõ ràng:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Media Tool Desktop App                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Phân hệ Viewer (Ảnh)        │    Phân hệ Player (Audio / Video)   │
│  - Render hình ảnh tối ưu        │  - Trình phát Video / Audio         │
│  - Duyệt lùi / tới siêu tốc      │  - Seek theo tỉ lệ 0–9 & ±1s, ±5s   │
│  - Đánh dấu file (Mark / Unmark) │  - Thiết lập vòng lặp A–B Loop      │
│  - Copy / Cut file references OS │  - Adaptive Audio Fade khi lặp đoạn │
│  - Xoay / Lật / Phóng to thu nhỏ │  - Volume Control qua GainNode & OSD│
│  - Context Menu chuột phải       │  - Shuffle & Loop File (All/1/Off)  │
│                                  │  - Đọc & hiển thị Audio Metadata    │
├──────────────────────────────────┴─────────────────────────────────────┤
│                    Shared Core (Lõi dùng chung)                        │
│  - Điều hướng thư mục cục bộ (File navigation & Enumeration)           │
│  - Thuật toán sắp xếp tên file tự nhiên (Natural Sorting)              │
│  - Trạng thái đánh dấu phiên làm việc (Session Mark State: Set<Path>)  │
│  - Hệ thống xử lý phím tắt thống nhất (Keyboard Dispatcher)            │
│  - Chế độ Ghim trên cùng (Pin on Top) & Responsive Mini PiP Mode       │
│  - Thoát sạch hoàn toàn khi bấm [X] (Không chạy ngầm trên macOS Dock) │
│  - Quản lý vòng đời ứng dụng & sự kiện mở file từ OS (Open-with)       │
├────────────────────────────────────────────────────────────────────────┤
│                 Platform Adapters (Ranh giới Hệ điều hành)             │
│  - Windows Adapter: Win32 Clipboard (CF_HDROP), Explorer Association   │
│  - macOS Adapter: NSPasteboard (NSURL / Filenames), Finder Integration │
└────────────────────────────────────────────────────────────────────────┘
```

### Chi tiết Stack Công nghệ Được Chọn:
1. **Desktop Framework:** **Tauri 2.x** (Rust Core + Web Frontend).
   - Siêu nhẹ, chiếm dụng RAM và dung lượng cài đặt thấp hơn Electron rất nhiều.
   - Rust đảm nhiệm tầng truy cập hệ thống tệp cục bộ, quản lý clipboard native và tương tác OS.
2. **Frontend UI:** **TypeScript + React + Vite**.
   - Giao diện phản hồi cực nhanh, quản lý state trực quan.
   - Styling: Sử dụng Plain CSS / CSS Modules hoặc Tailwind CSS tinh gọn, không kéo các thư viện UI component nặng nề.
3. **Media Engine (Audio / Video):**
   - Nghiên cứu tích hợp **libmpv** hoặc tận dụng khả năng giải mã media bản địa (HTML5 Media / Native Webview / GStreamer bindings) thông qua giai đoạn Technical Spike (Phase 0).
   - **Quy tắc tuyệt đối:** Không tự viết bộ giải mã (codec/demuxer). Tái sử dụng các engine truyền thông hoàn thiện.
4. **Image Rendering:**
   - Sử dụng cơ chế giải mã hình ảnh của Webview nền tảng (hỗ trợ JPG, PNG, WebP, GIF, AVIF). Nếu định dạng nào gặp rào cản sẽ bổ sung adapter giải mã ở Rust.

---

## 4. Định dạng Media Hỗ trợ (V1 Scope)

| Nhóm Media | Định dạng Được Hỗ trợ | Cơ chế Xử lý V1 |
| :--- | :--- | :--- |
| **Hình ảnh (Images)** | `JPEG`, `JPG`, `PNG`, `WebP`, `GIF`, `AVIF` *(nếu webview hỗ trợ ổn định)* | Giải mã trực tiếp trên Webview / Rust Image pipeline. Hỗ trợ duyệt tới/lui và đánh dấu. |
| **Video** | `MP4`, `MOV`, `WebM`, `MKV` | Phát qua Media Engine. Hỗ trợ Play/Pause, Seek phím tắt, A–B Loop. |
| **Âm thanh (Audio)** | `MP3`, `WAV`, `FLAC`, `M4A` | Phát âm thanh, đọc thẻ ID3/Metadata (Title, Artist, Album, Year, Track, Artwork), A–B Loop và Adaptive Fade. |

---

## 5. Ranh giới Nghiệp vụ & Phạm vi (Scope Matrix)

| Hạng mục | Trong phạm vi V1 (In-Scope) | Tuyệt đối Ngoài phạm vi V1 (Out-of-Scope) |
| :--- | :--- | :--- |
| **Tích hợp YouTube** | Hoàn toàn không có trong V1. | Cấm tích hợp yt-dlp, cấm tải video stream YouTube, cấm nhúng YouTube player ở V1. |
| **Thư viện / Cơ sở dữ liệu** | Trạng thái Session tạm thời trong RAM (Đóng app là xóa mark). | Không lưu database (SQLite), không tạo Media Library, không Favorites vĩnh viễn, không Tagging/Rating. |
| **Chỉnh sửa Media** | Chỉ đọc (Read-only). | Không crop, xoay vĩnh viễn, chỉnh màu, render subtitle, cắt ghép video/audio, convert định dạng. |
| **Quét Thư mục** | Quét các file cùng cấp trong thư mục chứa file đang mở. | Không quét đệ quy (recursive scan) cây thư mục con ở V1. |
| **Đám mây & Tài khoản** | Chạy Offline 100% trên máy cục bộ. | Không tài khoản, không login, không Cloud Sync, không Tracking Analytics từ xa, không mạng xã hội. |
| **Tính năng Nâng cao** | Adaptive Audio Fade cho vòng lặp A–B (thuần thuật toán volume). | Không crossfade trộn âm thanh 2 bài, không EQ, không DSP chuyên sâu, không DLNA/AirPlay. |

---

## 6. Lộ trình Triển khai Chuẩn (8 Implementation Phases)

Toàn bộ quá trình hiện thực hóa công cụ được chia làm 8 giai đoạn tuần tự:

```text
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7
(Spike)     (Core)      (Viewer)    (Player)    (A-B Loop)  (Audio)     (Platform)  (Polish/QA)
```

1. **Phase 0 — Technical Spike (Kiểm định Kiến trúc):**
   - Dựng prototype tối giản kiểm tra khả năng build Tauri 2 trên macOS Apple Silicon và Windows 11.
   - Thử nghiệm việc phát video, audio, lệnh tua và cơ chế đưa file references vào clipboard native của OS.
   - Kiểm định giải pháp Web Audio API GainNode cho Adaptive Audio Fade (0–100ms) để xác nhận độ trơn tru và không độ trễ.
2. **Phase 1 — Shared Core (Lõi dùng chung):**
   - Xây dựng module Rust quét thư mục, phân loại đuôi file, sắp xếp tự nhiên (`natural_sort`).
   - Xây dựng state in-memory quản lý danh sách file đã đánh dấu (`MarkSession`).
   - Thiết lập khung điều hướng sự kiện phím tắt (Keyboard Dispatcher).
   - Tích hợp cơ chế Single-Instance bắt sự kiện click đúp file từ hệ điều hành.
3. **Phase 2 — Phân hệ Viewer (Trình xem ảnh hoàn thiện):**
   - Dựng giao diện xem ảnh tối giản, hiển thị ảnh chất lượng cao.
   - Cơ chế Zoom & Pan đa cử chỉ siêu mượt: Cuộn con lăn chuột lên/xuống để Zoom In/Out, kéo chuột để Pan khi đang zoom, hỗ trợ cử chỉ bản địa Mac Trackpad (Pinch-to-zoom 2 ngón và Two-finger Pan), tự động giới hạn biên và phân xử quyền kéo cửa sổ Tauri.
   - Điều hướng Previous/Next qua mũi tên trái/phải, tự động reset zoom về Fit view khi chuyển file.
   - Thao tác nhấn `M` để Mark/Unmark, hiển thị số lượng đã mark.
   - Nhấn `Ctrl+C` (Win) hoặc `Cmd+C` (Mac) sao chép danh sách file đã mark vào OS clipboard. Người dùng có thể dán ngay vào Explorer / Finder.
4. **Phase 3 — Phân hệ Player Core (Trình phát cơ bản):**
   - Tích hợp playback video/audio: Play / Pause bằng `Space`.
   - Tua dòng thời gian: `0–9` (nhảy theo 0% → 90% timeline), Mũi tên trái/phải (±1s), Shift + Mũi tên (±5s).
   - Chuyển file media trước/sau: `Ctrl/Cmd + Left/Right`.
5. **Phase 4 — Vòng lặp A–B Loop & Adaptive Audio Fade:**
   - Phím tắt `[` đặt điểm A, `]` đặt điểm B. Phím tắt/Nút bấm bật tắt chế độ lặp.
   - Xử lý mượt mà chuyển đoạn: Tính toán thời lượng fade thích ứng dựa trên độ dài đoạn lặp để chống giật âm lượng.
6. **Phase 5 — Trải nghiệm Âm thanh & Metadata:**
   - Đọc metadata bài hát (Title, Artist, Album, Year, Track) và nhúng bìa đĩa (Album Art).
   - Thiết kế giao diện nghe nhạc thanh lịch, thông tin hiển thị dạng read-only.
7. **Phase 6 — Tích hợp Sâu Nền tảng (Platform Integration):**
   - Cấu hình File Association (Open With) cho các định dạng mục tiêu trên Windows và macOS.
   - Đóng gói ứng dụng thành file cài đặt độc lập (.msi / .exe trên Win, .dmg / .app trên Mac).
8. **Phase 7 — Đánh bóng & Kiểm thử Nghiệm thu (Polish / QA):**
   - Kiểm thử toàn diện 18 tiêu chí nghiệm thu (AC-01 → AC-18).
   - Kiểm tra các trường hợp biên: file hỏng, thư mục rỗng, file bị xóa khi đang mở.

---

## 7. Bốn Quyết định Kỹ thuật Chiến lược & Lý do Đề xuất (Strategic Decisions & Rationale)

Nhằm đảm bảo sản phẩm đạt đúng tiêu chí **"Siêu nhẹ, Tốc độ cao, Không cồng kềnh và Dễ bảo trì"**, 4 quyết định kỹ thuật nền tảng sau đây đã được chuẩn hóa vào kiến trúc:

### Quyết định 1: Ưu tiên HTML5 Media + Web Audio API thay vì nhúng trực tiếp `libmpv`
* **Đề xuất:** Sử dụng pipeline Media bản địa của Webview (AVFoundation trên macOS, Media Foundation trên Windows) kết hợp **Web Audio API (`GainNode`)** để xử lý âm lượng và vòng lặp. Chỉ sử dụng Rust stream/remux cục bộ khi gặp định dạng container hiếm như `.mkv`.
* **Lý do đề xuất:**
  1. *Tránh xung đột giao diện Webview:* Tauri 2 render qua Webview. Việc ép một cửa sổ đồ họa bản địa bên ngoài của `libmpv` (OpenGL/Metal) lồng vào trong Webview rất dễ gây giật khung hình, nhấp nháy khi phóng to/thu nhỏ cửa sổ và xung đột lớp hiển thị (Z-Index).
  2. *Dung lượng siêu nhẹ:* Nhúng `libmpv` sẽ buộc phải kèm theo hàng chục MB thư viện liên kết động (`.dylib`/`.dll`), làm phình to kích thước bộ cài và dễ bị hệ điều hành chặn chữ ký số (Gatekeeper / SmartScreen). Trong khi đó, HTML5 Media tận dụng 100% phần cứng giải mã có sẵn của macOS/Windows nên ứng dụng chỉ nặng vài Megabytes.
  3. *Adaptive Fade hoàn hảo 0ms:* Web Audio API `GainNode` cho phép điều khiển đường cong âm lượng chính xác đến từng mili-giây với độ trễ bằng 0, không phụ thuộc vào độ trễ giao tiếp IPC của engine ngoài.

### Quyết định 2: Tách biệt Native OS Clipboard Adapters (`CF_HDROP` & `NSPasteboard`)
* **Đề xuất:** Triển khai độc lập trong `src/platform/windows.rs` (dùng `CF_HDROP` qua Win32 API) và `src/platform/macos.rs` (dùng `NSPasteboardTypeFileURL` qua Cocoa API).
* **Lý do đề xuất:**
  - Clipboard mặc định của trình duyệt/Webview chỉ hỗ trợ copy văn bản hoặc dữ liệu ảnh dạng pixel blob. Nó không thể tạo ra "tệp vật lý ảo" để Windows Explorer hoặc macOS Finder hiểu được lệnh `Paste` tệp.
  - Việc đưa logic này xuống tầng Rust cấp thấp giúp ứng dụng tương tác trực tiếp với API của hệ điều hành, vượt qua rào cản bảo mật (Sandbox) của Webview và đảm bảo việc dán file diễn ra trơn tru 100%.

### Quyết định 3: Triển khai Single-Instance & Đồng bộ Sự kiện Open-With
* **Đề xuất:** Tích hợp `tauri-plugin-single-instance` để chỉ duy trì duy nhất một tiến trình ứng dụng; bắt sự kiện Apple Event `kAEOpenDocuments` trên macOS và tham số dòng lệnh trên Windows.
* **Lý do đề xuất:**
  - Thói quen của người dùng là click đúp liên tục vào nhiều ảnh hoặc video khác nhau trong thư mục để xem. Nếu không có cơ chế Single-Instance, hệ điều hành sẽ khởi tạo hàng chục cửa sổ Media Tool chạy song song, gây ngốn RAM và làm đơ máy.
  - Cơ chế Single-Instance giúp chuyển đổi tệp media tức thì trên chính cửa sổ đang mở và tự động đẩy cửa sổ lên phía trước (Focus Window).

### Quyết định 4: Chiến lược Phát triển & Xác thực Đa Nền tảng (macOS Local + CI Cross-Build)
* **Đề xuất:** Phát triển và kiểm thử tương tác trực tiếp (Hot-reload, Browser Subagent, Video Demo) trên môi trường **macOS Apple Silicon** hiện tại; cô lập logic Windows trong `src/platform/windows.rs` và thiết lập kịch bản build tự động (GitHub Actions) để xuất bộ cài Windows 11.
* **Lý do đề xuất:**
  - Giúp tốc độ phát triển và kiểm thử vòng lặp diễn ra tức thì tại máy của Owner mà không bị gián đoạn.
  - Đảm bảo tính tương thích và sự đồng nhất 1:1 trên Windows 11 thông qua quy trình kiểm thử khói chuẩn hóa (22-step smoke test).

### Quyết định 5: Chiến lược Kiểm soát Bộ nhớ & Không để lại Rác Cache (Zero-Disk-Cache & Clean-on-Exit)
* **Đề xuất:** 
  1. *Không sinh Thumbnail Cache lưu xuống ổ cứng:* Danh sách tệp trong Right Sidebar chỉ hiển thị icon vector SVG phân loại (`🖼️`, `▶`, `🎵`) và tên file, không giải mã hàng loạt ảnh thu nhỏ lưu xuống đĩa.
  2. *Bộ nhớ trượt RAM 3-Slot (3-Slot Sliding Window Memory):* Trong RAM chỉ lưu tối đa 3 ảnh (`i-1`, `i`, `i+1`). Chuyển ảnh mới là hủy tham chiếu giải phóng ngay ảnh cũ (Garbage Collection).
  3. *Tắt Disk Cache của Webview & Tự dọn khi Đóng App (Clean-on-Exit):* Cấu hình cờ tắt cache HTTP trong Tauri (`--disable-http-cache`). Khi tắt app (`on_window_event: Destroyed`), Rust tự động xóa sạch toàn bộ thư mục file tạm.
* **Lý do đề xuất:**
  - Các app viewer/player thông thường rất hay âm thầm tích tụ vài GB cache ảnh thu nhỏ (Thumbnails) và webview cache (`EBWebView` trên Windows, `WebKit` trên Mac), làm đầy ổ đĩa C:.
  - Chiến lược này đảm bảo Media Tool luôn giữ đúng tôn chỉ **"Siêu nhẹ, Tốc độ cao, Không biến máy tính thành bãi rác"**.

---

## 8. Quy chuẩn Biểu tượng Ứng dụng & Đóng gói (.icns cho macOS & .ico cho Windows)

### 8.1. Hiện tượng "Icon bị biến thành Glass" trên macOS Web App
* **Nguyên nhân:** Khi tạo Web App bằng tính năng *"Add to Dock"* của Safari (từ macOS Sonoma 14+), nếu website chỉ cung cấp favicon vuông phẳng (Flat square PNG) mà không có hình dạng bo góc siêu elip (Apple Squircle) kèm vùng lề an toàn (Safe-area padding), hệ điều hành macOS sẽ **tự động bọc một lớp đĩa kính mờ (Translucent Glass Plate), tạo viền vát 3D (Bevel sheen) và đổ bóng nổi** lên trên icon nhằm ép nó vừa khít với lưới thiết kế của Dock.
* **Đối với Ứng dụng Desktop Bản địa (Tauri):**
  - Ứng dụng được đóng gói thành tệp bundle native `.app` chứa tệp tài nguyên biểu tượng độc lập **`icon.icns`**.
  - macOS hiển thị **chính xác 100% từng pixel và layer thiết kế gốc** trong tệp `.icns`, hoàn toàn không tự ý can thiệp, không phủ kính và không bọc viền ngoài.

### 8.2. Chiến Lược Biểu Tượng Phân Tách Theo Nền Tảng (Cross-Platform Dual-Icon Strategy)
Do ngôn ngữ thiết kế của macOS (Apple HIG) và Windows 11 (Microsoft Fluent Design) hoàn toàn khác nhau về quy chuẩn hiển thị thanh Dock / Taskbar, hệ thống áp dụng chiến lược **2 bản thiết kế độc lập**:

| Nền tảng | Phong cách hiển thị | Cấu trúc file nguồn (1024×1024 px) | Định dạng đóng gói cuối cùng |
| :--- | :--- | :--- | :--- |
| **macOS (Apple Silicon / Intel)** | **Squircle Plate + Object Trắng** | Khung vẽ 1024×1024, ở giữa là đĩa Squircle 824×824 có màu nền fill (Gradient / Dark / Accent), lồng hình **Object màu trắng** bên trong; viền ngoài chừa lề trong suốt 100px. | **`src-tauri/icons/icon.icns`** (chỉ macOS Bundle `.app` sử dụng) |
| **Windows 11 (x64)** | **Nền Trong Suốt + Object Fill (Frameless)** | Khung vẽ 1024×1024, **nền 100% trong suốt**, không có khung hộp chữ nhật bao quanh; chỉ có hình **Object được fill màu nổi bật** thả nổi trực tiếp trên Taskbar. | **`src-tauri/icons/icon.ico`** (chỉ Windows `.exe` / `.msi` sử dụng) |

### 8.3. Quy Trình Xuất & Đồng Bộ Biểu Tượng Tự Động (Dual Build Workflow)
1. **Chuẩn bị 2 tệp nguồn:**
   - `app_icon_mac.png` (bản có nền Squircle + Object trắng).
   - `app_icon_win.png` (bản nền trong suốt + Object fill màu).
2. **Quy trình đóng gói song song:**
   - *Bước 1 (Sinh icon cho Mac):* Chạy `npx @tauri-apps/cli icon app_icon_mac.png` → Tauri sinh `icon.icns` chuẩn cho macOS.
   - *Bước 2 (Sinh icon cho Windows):* Chạy `npx @tauri-apps/cli icon app_icon_win.png -o src-tauri/icons-win` rồi sao chép tệp `icon.ico` và các file `32x32.png`, `128x128.png` đè vào `src-tauri/icons/`.
   - Kết quả: Thư mục `src-tauri/icons/` chứa đúng file `icon.icns` của Mac và `icon.ico` của Windows mà không hề xung đột lẫn nhau. Khi build bản Mac, Tauri chỉ đọc `.icns`; khi build bản Win, Tauri chỉ đọc `.ico`.

### 8.4. Quy Chuẩn Tích Hợp Hệ Điều Hành (OS File Associations, Seamless Window & Native Menus)
1. **Khử Lặp Thanh Tiêu Đề (Seamless Titlebar):**
   - Thiết lập `titleBarStyle: "Overlay"` và `hiddenTitle: true` trong `tauri.conf.json`.
   - Cửa sổ không hiển thị dải header giả hay thanh đen tiêu đề tách biệt; 3 nút Traffic Light gốc của macOS (Đỏ, Vàng, Xanh) được tích hợp trực tiếp vào góc trên bên trái của giao diện ứng dụng.
   - Thanh công cụ HUD chừa khoảng đệm an toàn `pl-20` (padding-left 80px) để không che lấp các nút điều khiển của OS.
2. **Đăng Ký Đề Xuất Mở Tệp (Recommended App / File Associations):**
   - Khai báo `bundle.fileAssociations` cho 3 nhóm định dạng:
     * **Audio:** `mp3, wav, flac, ogg, aac, m4a, wma, aiff`.
     * **Video:** `mp4, mkv, webm, mov, avi, m4v`.
     * **Image:** `jpg, jpeg, png, webp, gif, svg, bmp, ico, avif`.
   - Kết quả: Khi người dùng nhấp chuột phải vào bất kỳ tệp media nào trong Finder/Explorer và chọn *Open With*, hệ điều hành sẽ tự động đề xuất **VXMedia** trong danh sách ứng dụng phù hợp nhất.
3. **Menu Bar Hệ Thống & Bộ Điều Khiển Mở Tệp (Native Menus & Dialogs):**
   - Menu hệ thống **File**: Hỗ trợ *Mở tệp...* (`Cmd+O`), *Mở thư mục...* (`Cmd+Shift+O`) và *Đóng cửa sổ* (`Cmd+W`).
   - Tích hợp hộp thoại tệp bản địa (`rfd` / Cocoa NSOpenPanel) và cơ chế kéo-thả trực tiếp (Drag & Drop) tệp hoặc thư mục vào cửa sổ.
   - Bắt sự kiện hệ thống `RunEvent::Opened` để tự động phát ngay khi người dùng mở tệp từ Finder hoặc kéo tệp vào icon app trên Dock.

---

## 9. Tiêu chuẩn Thực thi cho AI Execution Agent

Khi Dev Agent nhận lệnh triển khai mã nguồn, bắt buộc tuân thủ:
1. **Phân tách Module rõ ràng:** Tuyệt đối không viết lẫn lộn logic của Viewer vào Player. Mọi hàm logic chung phải chuyển về `src/core`.
2. **Không phân mảnh OS Logic:** Tuyệt đối không rải rác các câu lệnh kiểm tra điều kiện hệ điều hành (`if windows ... if macos ...`) trong giao diện hoặc logic nghiệp vụ. Toàn bộ khác biệt nền tảng phải được đóng gói bên trong thư mục `src/platform/`.
3. **Không tự ý mở rộng Scope:** Khi gặp câu hỏi "Liệu có nên thêm tính năng này không?", mặc định câu trả lời là **KHÔNG** trừ khi có chỉ thị trực tiếp từ Product Owner.
4. **Không phụ thuộc thư viện rác:** Giữ số lượng dependencies ở mức tối thiểu.
5. **Tiêu chuẩn đặt tên & Đường dẫn:** Tuân thủ chuẩn **snake_case** cho tên file, thư mục; không dùng dấu gạch ngang `-`; sử dụng relative links cho tài liệu.

