# Đặc tả Kỹ thuật Module Đọc PDF (PDF Reader Module Specification)

> **Mã đặc tả:** `_spec8_pdf_reader_module`  
> **Phiên bản tài liệu:** `1.2.0-draft`  
> **Áp dụng dự kiến từ:** `v1.2.0`  
> **Dự án:** VXMedia (`media_tool`)  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [07_folder_tabs_multi_window.md](07_folder_tabs_multi_window.md) & [version_management.md](../version_management.md)

---

## 1. Bối cảnh & Tầm nhìn Sản phẩm (Product Vision)

### 1.1. Vấn đề Thực tế & Cơ hội Mở rộng
Trong quá trình vận hành VXMedia với 3 định dạng ban đầu (`image`, `video`, `audio`), người dùng thường xuyên làm việc với các thư mục dự án hỗn hợp (Mixed Asset Folders) chứa cả ảnh tư liệu, video demo, nhạc nền và các tệp tài liệu đặc tả, hợp đồng, storyboard dưới định dạng **PDF (`.pdf`)**.

Hiện tại:
- Khi gặp file `.pdf`, ứng dụng bỏ qua (không hiển thị trên Sidebar) hoặc người dùng buộc phải chuyển sang một ứng dụng PDF chuyên dụng nặng nề của bên thứ ba (Adobe Acrobat, Foxit, hoặc trình duyệt Chrome ngốn hàng trăm MB RAM).
- Trải nghiệm đứt gãy: Không thể vừa nghe nhạc nền/podcast ở tab Audio của VXMedia mà vừa đọc tài liệu PDF một cách đồng bộ trong cùng một cửa sổ làm việc nhẹ nhàng.

### 1.2. Định vị "Workspace Content Viewer" Toàn diện
Thay vì tạo ra một ứng dụng đọc PDF riêng biệt gây phân mảnh trải nghiệm và lãng phí hạ tầng, **VXMedia nâng cấp PDF trở thành Media Type thứ 4** bình đẳng với Image, Video, và Audio:

```text
VXMedia Core Architecture
 ├── 1. Image Viewer   (Zoom, Pan, Rotate, Spacebar Mark)
 ├── 2. Video Player   (Timeline, Volume, Seek, Auto-hide HUD)
 ├── 3. Audio Player   (A–B Loop, ID3 Metadata, Global Background Engine)
 └── 4. PDF Reader     (Cuộn dọc liên tục, Retina Zoom, Thumbnails, Native OS Print)
```

---

## 2. Mô hình Tư duy Cốt lõi & Luồng Nghiệp vụ (Mental Model & Business Flows)

### 2.1. Phối hợp với Hệ thống Tab & Âm thanh Toàn cục (Global Audio Coexistence)
Module PDF kế thừa 100% kiến trúc 4 tầng: `App → Windows → Tabs → Folder Sessions`:
1. **Phát nhạc ngầm liên tục khi đọc sách/tài liệu:** Khi người dùng mở nhạc ở Tab Audio (hoặc phát video/podcast), sau đó chuyển sang Tab PDF hoặc mở một file PDF trong cùng thư mục, luồng âm thanh từ `Global Audio Engine` **vẫn tiếp tục phát êm ái mà không bị ngắt quãng**. Thanh điều khiển `MiniAudioPill` hiển thị ở góc dưới cho phép tạm dừng hoặc đổi bài hát bất kỳ lúc nào.
2. **Tab Thư mục Độc lập:** Mở thư mục chứa PDF sẽ tạo hoặc tái sử dụng `FolderSession`. Sidebar nhận diện và hiển thị các file `.pdf` với biểu tượng màu đỏ đặc trưng.

```text
[Tab 1: /Music/Chill_BGM] (Audio đang phát ──► Persistent Engine)
          │
          ▼ Người dùng click chuyển Tab
[Tab 2: /Books/Tech_Specs]
          ├── Sidebar: file1.pdf, file2.pdf, diagram.png
          └── Viewport: <PdfViewer /> hiển thị tài liệu
                ├── Left Thumbnail Drawer (Thanh ảnh thu nhỏ)
                └── MiniAudioPill (Bật / Pause / Next nhạc góc dưới)
```

### 2.2. Quy tắc Điều phối Cạnh tranh Media
- **Audio + PDF:** Cùng tồn tại song song. Âm thanh tiếp tục phát bình thường.
- **Video + PDF:** Khi người dùng chuyển từ tab Video đang phát sang tab PDF, video tự động tạm dừng để tiết kiệm tài nguyên GPU. Khi quay lại tab Video, video giữ nguyên mốc thời gian tạm dừng.

---

## 3. Mở rộng Hệ thống Kiểu Dữ liệu (Type System Extensions)

### 3.1. Cập nhật `MediaType` và `MediaItem`
Bổ sung `'pdf'` vào liên hiệp kiểu dữ liệu cốt lõi:

```typescript
export type MediaType = 'image' | 'video' | 'audio' | 'pdf';

export interface MediaItem {
  name: string;
  path: string;
  media_type: MediaType;
  size?: number;
  extension?: string;
  pdf_page_count?: number;
}
```

### 3.2. Trạng thái Phiên Làm việc PDF (`PdfSessionState`)
Mỗi phiên đọc tài liệu PDF lưu giữ trạng thái đọc độc lập để khi người dùng chuyển qua lại giữa các tab, vị trí trang và độ thu phóng không bị mất:

```typescript
export interface PdfSessionState {
  currentPage: number;                  // Trang hiện tại (1-indexed)
  totalPages: number;                   // Tổng số trang
  zoom: number;                         // Tỷ lệ thu phóng (mặc định 1.0 = 100%, 0.5 → 4.0)
  fitMode: 'width' | 'page' | 'custom'; // Chế độ vừa chiều ngang / vừa trang
  rotation: number;                     // Xoay trang: 0 | 90 | 180 | 270 độ
  invertColor: boolean;                 // Đảo màu thông minh (Dark Mode cho PDF trắng)
  isThumbnailOpen: boolean;             // Bật/tắt thanh thumbnail bên trái
  scrollTop: number;                    // Vị trí cuộn pixel
}
```

---

## 4. Kiến trúc Render & Lõi Kỹ thuật (Technical Architecture)

### 4.1. Lựa chọn Lõi Render: Mozilla `pdfjs-dist`
- **Công nghệ lõi:** Sử dụng thư viện chuẩn công nghiệp **`pdfjs-dist`** của Mozilla Firefox.
- **Cơ chế hoạt động:**
  1. Frontend đọc file PDF qua giao thức `asset://` cục bộ hoặc fetch array buffer từ Tauri backend.
  2. `pdfjs-dist` phân tích cấu trúc PDF và dựng từng trang ra phần tử `<canvas>` bằng Web Worker nền (`pdf.worker.min.mjs`), hoàn toàn không làm đơ luồng giao diện chính.
  3. Dựng kèm một lớp văn bản trong suốt (`textLayer`) đặt khớp tuyệt đối phía trên Canvas để cho phép người dùng bôi đen, sao chép văn bản (`Cmd+C` / `Ctrl+C`).

### 4.2. Render Trang Ảo & Cuộn Dọc Liên Tục (Continuous Virtual Scrolling)
- **Cuộn dọc liên tục (Continuous Scroll):** Các trang được bố trí nối tiếp nhau theo chiều dọc trong container có `overflow-y-auto`, tạo trải nghiệm lướt đọc mượt mà như xem web.
- **Tối ưu RAM (Page Virtualization):** Đối với tài liệu dài (hàng trăm đến hàng nghìn trang), ứng dụng chỉ render các trang nằm trong khung nhìn cộng thêm 1 trang đệm phía trên và 1 trang phía dưới (`buffer: 1`). Các trang nằm ngoài vùng nhìn được gỡ bỏ Canvas và chỉ giữ placeholder có chiều cao tương ứng để giữ RAM luôn dưới 80 MB.
- **Hỗ trợ Màn hình Retina / 4K:** Kích thước Canvas được nhân với `window.devicePixelRatio` (thường là 2× trên macOS Retina) để đảm bảo chữ và các nét vẽ vector luôn sắc nét tuyệt đối, không bị vỡ hạt.

---

## 5. Thiết kế Giao diện (UI Wireframe) & Chuẩn hóa Thanh Điều khiển

### 5.1. Quy chuẩn Nhất quán Thanh Điều khiển Dưới (Shared Control Bar Visual Contract)
Thanh điều khiển phía dưới của PDF Reader tuân thủ **100% ngôn ngữ thiết kế thị giác (Visual Language)** của Viewer ảnh và Video Player:
- Cùng container kính mờ: `glass-panel rounded-2xl p-2.5 shadow-2xl max-w-4xl w-full`
- Tự động ẩn hiện đồng bộ với trạng thái HUD chung (`H`).

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [◄ Trước] [Tiếp ►] [Thmb] │ 🏷️ Tai_Lieu.pdf [Trang 1 / 48] │ [-] 100% [+] [W] [I] [🖨️ In] [↻]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Bố cục 3 Cụm Chuẩn mực:
1. **Cụm Bên Trái (Left Group - Vị trí cố định như Viewer/Player):**
   - **Nút Prev File (`ChevronLeft`) & Next File (`ChevronRight`):** Giữ nguyên đúng vị trí góc trái như Viewer/Player, dùng để chuyển sang tệp trước / tệp kế tiếp trong thư mục hiện tại.
   - **Nút Bật/Tắt Thumbnails (`PanelLeft`):** Ngay cạnh nút chuyển file, cho phép đóng/mở nhanh ngăn kéo ảnh thu nhỏ bên trái.
2. **Cụm Ở Giữa (Center Group - Thông tin Tệp & Trang):**
   - Tên tệp tin hiển thị font mono kèm icon: `🏷️ filename.pdf`
   - Bộ điều hướng trang: `Trang [ 1 ] / 48` (người dùng có thể gõ số trang trực tiếp và nhấn Enter để nhảy tới trang).
3. **Cụm Bên Phải (Right Group - Công cụ Đọc & In ấn):**
   - **Đặc thù PDF:** Loại bỏ nút Đánh dấu (`Mark`) và nút Toàn màn hình (`Fullscreen`) để nhường chỗ cho các thao tác đọc tài liệu.
   - **Bộ Zoom:** Nút `[-]`, ô tỷ lệ `100%`, nút `[+]`.
   - **Vừa chiều ngang (`W` - Fit Width):** Canh lề vừa khít màn hình.
   - **Chế độ Ban đêm (`I` - Invert):** Đảo màu nền giấy trắng thành đen chống mỏi mắt.
   - **Nút In ấn (`Cmd+P` / `Ctrl+P` - 🖨️):** Mở Print Dialog chuẩn của hệ điều hành.
   - **Xoay trang 90° (`R`):** Xoay tài liệu theo chiều kim đồng hồ.

### 5.2. Thanh Bên Ảnh Thu Nhỏ Trang (Left Sidebar Thumbnails) & Tối Ưu RAM
- **Vị trí & Giao diện:** Ngăn kéo bên trái có thể bật/tắt (Toggleable Left Drawer), đệm `pt-10 pb-20` an toàn dưới cụm 3 nút đèn giao thông (traffic lights) trên macOS.
- **Trải nghiệm:**
  - Hiển thị danh sách card thu nhỏ của từng trang kèm số trang bên dưới (`1`, `2`...).
  - Trang đang đọc trên màn hình sẽ có viền sáng Cyan (`ring-1 ring-cyan-400 bg-cyan-500/20`).
  - Click vào bất kỳ thumbnail nào sẽ cuộn mượt (`scrollIntoView`) đưa trang đó ra giữa màn hình.
- **Cơ chế Tiết kiệm RAM Tuyệt đối (Zero-Memory Waste via IntersectionObserver):**
  - Áp dụng `IntersectionObserver` với `rootMargin: '300px'`: Chỉ khi thumbnail cuộn tới gần vùng nhìn thấy (viewport), PDF.js mới giải mã trang và vẽ lên canvas kích thước 120px.
  - Các trang chưa cuộn đến chỉ hiển thị khung placeholder xương (skeleton) siêu nhẹ, tốn gần như 0 MB RAM.
  - Tổng dung lượng RAM chiếm dụng của toàn bộ thumbnail luôn duy trì ở mức tối thiểu **3 - 5 MB** ngay cả với tài liệu hàng trăm đến hàng ngàn trang.

### 5.3. Hỗ trợ In Ấn Chuẩn Hệ Điều Hành (Native OS Print Dialog)
- **Kích hoạt:** Bấm `Cmd+P` (macOS) hoặc `Ctrl+P` (Windows) hoặc click nút biểu tượng máy in 🖨️ trên thanh HUD.
- **Cơ chế kỹ thuật Native:**
  - **macOS:** Gọi trực tiếp qua Tauri backend Rust, sử dụng Apple `PDFKit.framework` (`[PDFDocument printOperationForPrintInfo:autoRotate:]`) tích hợp sâu vào hệ thống đồ họa Quartz/AppKit. Hộp thoại in chuẩn của macOS hiển thị tức thì với đầy đủ tính năng: chọn trang in, 2 mặt (duplex), bố cục giấy, color matching và xuất PDF. Tự động fallback sang Preview nếu gặp định dạng không tương thích.
  - **Windows:** Kích hoạt Windows Shell Print API (`Start-Process -Verb Print`) mở hộp thoại in chuẩn của Windows 11.
  - **Web / Fallback:** Kết hợp `window.print()` với bộ CSS `@media print` dàn trang chuẩn khổ in A4/Letter.

---

## 6. Bảng Phím tắt Thống nhất (Keyboard Shortcuts Mapping)

Tương thích chuẩn mực trên cả macOS và Windows 11:

| Tác vụ | Phím tắt macOS | Phím tắt Windows 11 | Ghi chú |
| :--- | :--- | :--- | :--- |
| **In tài liệu (Print)** | `Cmd + P` | `Ctrl + P` | Mở Print Dialog chuẩn OS |
| **Bật/Tắt Thumbnails** | `T` hoặc `Cmd + Alt + 1` | `T` hoặc `Ctrl + Alt + 1` | Hiện/ẩn thanh ảnh thu nhỏ bên trái |
| **Tệp tiếp theo trong folder** | `Mũi tên phải` | `Right Arrow` | Chuyển file kế tiếp trong thư mục |
| **Tệp trước trong folder** | `Mũi tên trái` | `Left Arrow` | Chuyển file trước trong thư mục |
| **Trang kế tiếp trong PDF** | `PageDown` / `J` / `Mũi tên xuống` | `PageDown` / `J` / `Down Arrow` | Cuộn đến trang sau của tài liệu |
| **Trang trước trong PDF** | `PageUp` / `K` / `Mũi tên lên` | `PageUp` / `K` / `Up Arrow` | Cuộn về trang trước của tài liệu |
| **Đầu tài liệu** | `Home` / `Cmd + Mũi tên lên` | `Home` / `Ctrl + Home` | Nhảy về trang 1 |
| **Cuối tài liệu** | `End` / `Cmd + Mũi tên xuống` | `End` / `Ctrl + End` | Nhảy đến trang cuối |
| **Phóng to (Zoom In)** | `Cmd + =` hoặc `+` | `Ctrl + =` hoặc `+` | Tăng 15% |
| **Thu nhỏ (Zoom Out)** | `Cmd + -` hoặc `-` | `Ctrl + -` hoặc `-` | Giảm 15% |
| **Về 100% (Reset Zoom)** | `Cmd + 0` | `Ctrl + 0` | Tỷ lệ gốc 1:1 |
| **Vừa Chiều rộng (Fit Width)** | `W` | `W` | Canh vừa mép ngang |
| **Vừa Khung hình (Fit Page)** | `F` | `F` | Canh vừa chiều cao |
| **Xoay trang 90°** | `R` | `R` | Xoay theo chiều kim đồng hồ |
| **Bật/Tắt Dark Mode** | `I` | `I` | Invert màu giấy đọc đêm |
| **Ẩn / Hiện HUD** | `H` | `H` | Toàn quyền tập trung đọc |
| **Ghim Cửa sổ On-Top** | `P` | `P` | Vừa đọc tài liệu vừa code |
| **Danh sách Tệp (Sidebar)** | `B` / `L` | `B` / `L` | Xem danh sách file trong thư mục |

---

## 7. Hợp đồng Backend & Hệ Điều hành (Backend & OS Integration)

### 7.1. Cập nhật Bộ quét Tệp Rust (`src-tauri/src/commands/fs_scan.rs`)
Thêm phần mở rộng `.pdf` vào danh sách nhận diện media:

```rust
pub fn classify_media_type(ext: &str) -> Option<&'static str> {
    match ext.to_lowercase().as_str() {
        // Hình ảnh
        "jpg" | "jpeg" | "png" | "webp" | "gif" | "svg" | "bmp" | "ico" | "avif" => Some("image"),
        // Video
        "mp4" | "mkv" | "webm" | "mov" | "avi" | "m4v" => Some("video"),
        // Âm thanh
        "mp3" | "wav" | "flac" | "ogg" | "aac" | "m4a" | "wma" | "aiff" => Some("audio"),
        // Tài liệu PDF
        "pdf" => Some("pdf"),
        _ => None,
    }
}
```

### 7.2. Cấu hình Đăng ký Đuôi Tệp Hệ điều hành (`tauri.conf.json`)
Bổ sung khai báo file association để macOS (Finder) và Windows (File Explorer) có thể liên kết tính năng "Open With" trực tiếp với VXMedia:

```json
{
  "ext": ["pdf"],
  "name": "PDF Document",
  "description": "Portable Document Format",
  "role": "Viewer"
}
```

---

## 8. Tiêu chuẩn Nghiệm thu QA (Acceptance Criteria)

- **AC-PDF-01 (Mở tệp đơn lẻ):** Mở ứng dụng với tham số đường dẫn file `.pdf`, ứng dụng tự động hiển thị tab đọc PDF và render trang 1 sắc nét.
- **AC-PDF-02 (Duyệt thư mục hỗn hợp):** Mở một thư mục chứa cả ảnh, video, nhạc và PDF; Sidebar hiển thị đầy đủ icon màu đỏ phân biệt cho các tệp PDF; click vào tệp PDF nào sẽ hoán đổi giao diện sang chế độ đọc PDF của tệp đó.
- **AC-PDF-03 (Âm thanh nền bền vững):** Đang phát một tệp âm thanh ở tab A, chuyển sang xem tệp PDF ở tab B, âm thanh tiếp tục phát bình thường không vấp giật; thanh `MiniAudioPill` phản hồi chính xác.
- **AC-PDF-04 (Cuộn dọc & Nhảy trang):** Cuộn dọc liên tục mượt mà; nhập số trang trực tiếp và bấm Enter lập tức nhảy đến đúng trang đó.
- **AC-PDF-05 (Thu phóng & Vừa màn hình):** Zoom tự do, `Fit Width`, `Fit Page` hoạt động chuẩn xác, chữ không bị vỡ trên màn hình Retina/HiDPI.
- **AC-PDF-06 (Bôi đen & Sao chép chữ):** Người dùng có thể quét chuột chọn văn bản trên trang PDF và bấm `Cmd+C` / `Ctrl+C` sao chép nội dung vào Clipboard hệ thống.
- **AC-PDF-07 (Chế độ Ban đêm Invert):** Bật chế độ Invert biến nền trắng thành nền tối dễ chịu, chống mỏi mắt.
- **AC-PDF-08 (Thanh Thumbnails bên trái):** Bấm phím `T` bật/tắt ngăn kéo ảnh thu nhỏ; click vào thumbnail bất kỳ cuộn ngay đến trang tương ứng; trang đang đọc có viền sáng viền Cyan.
- **AC-PDF-09 (In ấn chuẩn OS):** Bấm `Cmd+P` / `Ctrl+P` mở hộp thoại Print chuẩn của hệ điều hành; trang in sạch sẽ không dính thanh công cụ hay HUD.
- **AC-PDF-10 (Thanh Điều khiển Nhất quán & Chuyển File):** Thanh điều khiển khớp hoàn toàn visual với Viewer/Player; vị trí nút Prev/Next file giữ nguyên ở góc trái; không có nút Mark và Fullscreen.
- **AC-PDF-11 (Giải phóng Bộ nhớ):** Đóng tab PDF hoặc thoát app giải phóng toàn bộ Worker và bộ nhớ đệm Canvas, không rò rỉ RAM (Zero Leak).

---

## 9. Ranh giới Phạm vi Triển khai (Scope Boundary)

### Trong phạm vi V1.2.0 (In-Scope - Triển khai ngay):
* Hiển thị tài liệu PDF với hiệu năng cao theo cơ chế cuộn dọc liên tục (Continuous Scroll).
* Thanh điều khiển đồng bộ visual với Viewer/Player (nút chuyển file giữ nguyên vị trí góc trái, bỏ Mark và Fullscreen).
* Zoom mượt Retina, Fit Width, Fit Page, xoay trang 90°.
* Text Selection & Copy to Clipboard.
* Bộ điều hướng trang, nhảy trang bằng số.
* Ngăn kéo ảnh thu nhỏ bên trái (Left Sidebar Thumbnails) có thể bật/tắt (`T`).
* In ấn tài liệu qua Print Dialog chuẩn của OS (`Cmd+P` / `Ctrl+P`).
* Tích hợp thanh Sidebar danh sách tệp và thanh MiniAudioPill phát nhạc toàn cục.
* Hỗ trợ đầy đủ phím tắt trên macOS và Windows 11.

### 📌 Danh mục Backlog (Chuyển sang tương lai khi có nhu cầu cao):
* **Tìm kiếm văn bản trong PDF (Search Text / PDFFindController):** Lưu vào Backlog, sẽ thực hiện khi người dùng có nhu cầu tra cứu chuyên sâu.
* **Tối ưu Hộp thoại In In-App (Native Print Dialog Modal for macOS):** Tinh chỉnh `NSPrintOperation` gắn sheet trực tiếp vào cửa sổ App (In-App Print Dialog) thay vì chuyển tiếp an toàn qua Preview.
* **Chỉnh sửa nội dung PDF, thêm chú thích (Annotation), highlight bút vẽ, chữ ký số.**
* **Điền biểu mẫu PDF Form tương tác (Interactive Form Filling).**
* **Chuyển đổi định dạng PDF sang Word/Excel.**

## 10. Bảo vệ dung lượng đọc — safety fix 2026-10-30

- IPC `read_file_binary` chỉ nhận tệp thường, tối đa **128 MiB**. Kiểm metadata trước đọc và giới hạn số byte ngay trong vòng đọc để không bypass bằng file tăng dung lượng; nguồn không bị sửa.
- PDF trong giới hạn giữ nguyên byte, flow chọn file/render/chuyển tab và phím tắt. PDF vượt giới hạn trả lỗi rõ trong vùng lỗi hiện có, không thêm dialog hoặc bước xác nhận.
- Khi Tauri reject bằng chuỗi, PDF Viewer phải hiển thị chuỗi lỗi thay vì thay bằng lỗi PDF chung; sau đó user vẫn có thể mở PDF hợp lệ khác.
- Bằng chứng Rust/browser fixture lưu trong báo cáo safety fix cấp workspace; chưa coi đây là native Windows/WebView2 acceptance hoặc giới hạn tổng RAM của PDF.js khi giải mã một tài liệu phức tạp.
