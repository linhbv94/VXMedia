# Feature Flow & Logic Specification: Media Tool (`_spec2_feature_flow`)

> **Phiên bản:** 1.1.0
> **Ngày cập nhật:** 2026-10-09
> **Phân loại đặc tả:** Luồng Tính năng, Thuật toán, Máy trạng thái (State Machine) & Xử lý biên  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [01_business_process.md](01_business_process.md)  

---

## 1. Thuật toán Sắp xếp Tự nhiên (Natural Sort Algorithm)

Khi mở một tệp bất kỳ trong thư mục, hệ thống quét toàn bộ thư mục cha và bắt buộc phải áp dụng thuật toán **Sắp xếp tự nhiên (Natural Sort)** thay vì sắp xếp từ điển (Alphabetical/ASCII sort).

### A. Sự khác biệt cốt lõi:
- **Sắp xếp theo mã ASCII thuần (Sai quy chuẩn):**  
  `01.jpg` → `02.jpg` → `10.jpg` → `03.jpg` (Do ký tự '1' đứng trước ký tự '0'/'3').
- **Sắp xếp Tự nhiên (Natural Sort - Chuẩn mực V1):**  
  `01.jpg` → `02.jpg` → `03.jpg` → `10.jpg` → `100.jpg`.

### B. Logic triển khai thuật toán trên Rust Backend:
```rust
// Phân rã chuỗi tên file thành các phần: Khối văn bản và Khối số nguyên
fn natural_sort_key(s: &str) -> Vec<SortChunk> {
    // Tách "img12_test.png" thành [Chunk::Text("img"), Chunk::Number(12), Chunk::Text("_test.png")]
    // So sánh theo thứ tự từng chunk: Chunk::Number so sánh giá trị số nguyên u64
}
```

### C. Quy trình Xử lý Danh sách File (File Enumeration Pipeline):
1. Đọc danh sách file cùng cấp trong thư mục cha (không duyệt đệ quy).
2. Lọc bỏ file ẩn (bắt đầu bằng dấu chấm `.`), file hệ thống (`Thumbs.db`, `.DS_Store`).
3. Lọc lấy các file có đuôi nằm trong danh sách định dạng hỗ trợ (khớp với nhóm đang mở).
4. Áp dụng `natural_sort` trên tên file (chữ hoa/chữ thường không phân biệt - case-insensitive).
5. Xác định chỉ mục hiện tại: `current_index = list.find_index(opened_file_path)`.

---

## 2. Luồng Tính năng Phân hệ Viewer (Image Viewer Flows)

```mermaid
stateDiagram-v2
    [*] --> Idle: Mở ảnh đầu tiên
    Idle --> LoadingImage: Nhấn Mũi tên Trái / Phải
    LoadingImage --> Displaying: Tải thành công
    LoadingImage --> ErrorState: File hỏng / Bị xóa
    
    Displaying --> MarkToggle: Nhấn phím M
    MarkToggle --> Displaying: Cập nhật Set<FilePath> & UI Counter
    
    Displaying --> CopyingFiles: Nhấn Ctrl+C / Cmd+C
    CopyingFiles --> CopiedToast: Ghi thành công vào OS Clipboard
    CopiedToast --> Displaying: Tự tắt Toast sau 2 giây
    
    ErrorState --> LoadingImage: Nhấn Mũi tên chuyển sang ảnh khác
```

### Chi tiết các bước xử lý:
1. **Hiển thị Ảnh (Image Rendering):**
   - Sử dụng thẻ `<img>` tối ưu hóa của HTML5/React hoặc Object URL bản địa.
   - Bố cục `object-fit: contain` đảm bảo ảnh luôn nằm trọn vẹn trong vùng hiển thị cửa sổ mà không bị méo tỉ lệ.
   - Nền cửa sổ sử dụng màu xám đen trung tính (`#0f1117`) để làm nổi bật độ tương phản của ảnh.
2. **Cơ chế Tải trước Nhẹ (Lightweight Preloading):**
   - Để chuyển ảnh tức thì không có màn hình đen giật cục, khi đang xem ảnh ở vị trí `i`, hệ thống tự động khởi tạo ngầm đối tượng `Image()` trong bộ nhớ cho vị trí `i - 1` và `i + 1`.
   - **Tuyệt đối không tải trước toàn bộ thư mục** để tránh tràn bộ nhớ RAM khi thư mục có hàng nghìn ảnh RAW/JPG độ phân giải lớn.
3. **Cơ chế Đánh dấu (Mark State):**
   - Quản lý bằng cấu trúc `Set<string>` (lưu đường dẫn tuyệt đối của file).
   - Khi nhấn `M`:
     - Nếu `markedSet.has(path)`: Xóa khỏi Set, trạng thái `is_marked = false`.
     - Nếu chưa: Thêm vào Set, trạng thái `is_marked = true`.
   - Cập nhật số đếm trên HUD: `Marked: ${markedSet.size}`.
4. **Cơ chế Sao chép & Di chuyển File Ra OS (Native Clipboard Copy & Cut):**
   - **Sao chép DUY NHẤT file hiện tại:** Khi nhấn `Cmd+C` (Mac) hoặc `Ctrl+C` (Win) hoặc bấm nút `[📋 Copy Ảnh này]`:
     - Ứng dụng chỉ đưa đường dẫn của file đang mở vào OS Clipboard.
     - Bắn Toast: *"✓ Đã sao chép file hiện tại vào Clipboard"*.
   - **Sao chép HÀNG LOẠT file đã đánh dấu:** Khi bấm nút `[📦 Copy Đã Mark (N)]` hoặc nhấn `Cmd/Ctrl + Shift + C`:
     - Ứng dụng lấy toàn bộ mảng file trong `markedSet` đưa vào OS Clipboard.
     - Bắn Toast: *"✓ Đã sao chép N tệp vào Clipboard"*.
   - **CẮT / DI CHUYỂN file đã đánh dấu (Cut Marked):** Khi bấm nút `[✂️ Cut Đã Mark (N)]` hoặc nhấn `Cmd/Ctrl + X`:
     - Gọi Tauri command `clipboard_files(paths, is_cut = true)`.
     - **Trên Windows:** Thiết lập thuộc tính `Preferred DropEffect = DROPEFFECT_MOVE (0x2)` vào clipboard Win32. Khi sang File Explorer nhấn `Ctrl+V`, các tệp vật lý sẽ được di chuyển (Move) sang thư mục đích.
     - **Trên macOS:** Do macOS Finder không hỗ trợ `Cmd+X` cho file (Apple quy chuẩn Move qua tổ hợp `Option + Cmd + V`), ứng dụng sẽ đưa mảng `NSURL` vào `NSPasteboard` kèm cờ Cut. Khi sang Finder, người dùng nhấn **`Option + Cmd + V`** để di chuyển các tệp đã cắt.
     - Bắn Toast: *"✂️ Đã cắt N tệp vào Clipboard (Nhấn Option+Cmd+V để di chuyển)"*.

---

## 3. Luồng Duyệt Thư mục Hỗn hợp & Tự động Chuyển Đổi (Mixed Folder Flow)

Khi một thư mục chứa lẫn lộn cả Ảnh (`.jpg`, `.png`), Video (`.mp4`, `.mov`) và Âm thanh (`.mp3`):
1. **Lập chỉ mục Thống nhất (Unified File Index):** Rust Core quét và sắp xếp toàn bộ media hợp lệ theo `natural_sort`.
2. **Tự động Hoán đổi Phân hệ (Dynamic Hot-Swap):**
   - Đang ở file ảnh (`01.jpg`) → Bấm Next → Gặp file video (`02.mp4`):
     - Giao diện Viewer mờ đi, phân hệ Video Player lập tức được khởi tạo và render khung phát video.
   - Đang ở file video (`02.mp4`) → Bấm Next → Gặp file ảnh (`03.jpg`):
     - Giao diện Viewer hiển thị ảnh; video vẫn phát nền và giữ tiến độ/A–B. Chỉ tạm dừng khi người dùng yêu cầu hoặc phát nguồn khác; đóng tab nguồn thì dừng và giải phóng nguồn phát.
3. **Quy tắc Phím tắt Điều hướng:**
   - **Tại phân hệ Viewer (Ảnh):** Do không có timeline, phím `Mũi tên Trái / Phải` (`←` / `→`) hoặc `Cmd/Ctrl + ←` / `→` đều có tác dụng chuyển file trước / sau.
   - **Tại phân hệ Player (Video / Audio):** Phím `←` / `→` đảm nhiệm chức năng tua ±1s. Để chuyển sang file tiếp theo trong danh sách hỗn hợp, bắt buộc sử dụng **`Cmd + →` (macOS)** hoặc **`Ctrl + →` (Windows)**.
   - **Nút bấm trên UI:** Hai nút bấm **`[◀ File]`** và **`[File ▶]`** luôn cố định trên giao diện của cả Viewer và Player, giúp người dùng dùng chuột chuyển file liền mạch không cần nhớ phím tắt.
4. **Cơ chế Chặn Xung đột Phím tắt (Keyboard Dispatcher Input Focus Guard):**
   - Khi người dùng đang tương tác với ô nhập liệu (ví dụ: gõ số giây tua trong Cài đặt, đổi tên file) hoặc khi đang mở Hộp thoại Cài đặt (`isSettingsOpen == true`):
   - Keyboard Dispatcher lập tức **tạm khóa toàn bộ phím tắt toàn cục** (`Space`, `M`, `P`, `H`, `B`, `[` / `]`, mũi tên...).
   - Tránh hiện tượng vừa gõ số trong ô input vừa vô tình làm nhảy video, toggle HUD hay đánh dấu tệp ở nền dưới.

---

## 4. Luồng Tính năng Phân hệ Player (Audio / Video Playback)

### A. Máy Trạng thái Playback (Playback State Machine)

```mermaid
stateDiagram-v2
    [*] --> Stopped: Nạp tệp Media
    Stopped --> Playing: Nhấn Space / Tự động phát
    Playing --> Paused: Nhấn Space
    Paused --> Playing: Nhấn Space
    
    Playing --> Seeking: Tua thời gian (Phím số 0-9 / Mũi tên)
    Paused --> Seeking: Tua thời gian
    Seeking --> Playing: Hoàn tất Seek (nếu trước đó đang Play)
    Seeking --> Paused: Hoàn tất Seek (nếu trước đó đang Pause)
```

### B. Hợp đồng Tua Thời gian (Seek Keyboard Contract & Boundary Clamping)

Mọi thao tác tua bắt buộc phải tuân theo quy tắc chặn biên nghiêm ngặt:
`newTime = clamp(targetTime, 0, duration)` (trong đó `clamp(val, min, max) = max(min, min(val, max))`)

| Thao tác Phím | Công thức Tính toán Mục tiêu | Xử lý Biên (Clamping) |
| :--- | :--- | :--- |
| **Phím `0` đến `9`** | `target = (key_number × 0.10) × duration` | Phím `0` về đúng `0.0s`, phím `5` về đúng 50%, phím `9` về đúng 90% timeline. |
| **Mũi tên Trái (`←`)** | `target = currentTime - 1.0` | Nếu `currentTime < 1.0s` → Về đúng `0.0s` (Không sinh số âm). |
| **Mũi tên Phải (`→`)** | `target = currentTime + 1.0` | Nếu `target > duration` → Về đúng `duration` (Dừng ở cuối video). |
| **Shift + Mũi tên Trái** | `target = currentTime - 5.0` | Nhảy lùi 5 giây; chặn dưới tại `0.0s`. |
| **Shift + Mũi tên Phải** | `target = currentTime + 5.0` | Nhảy tới 5 giây; chặn trên tại `duration`. |
| **Ctrl/Cmd + Mũi tên** | Chuyển sang file trước/sau trong danh sách | Reset toàn bộ trạng thái A–B Loop và nạp file mới. |

---

## 5. Đặc tả Vòng lặp A–B Loop & Thuật toán Adaptive Audio Fade

Vòng lặp A–B cho phép người dùng lặp đi lặp lại một phân đoạn nhất định của video hoặc audio.

### A. Máy Trạng thái Vòng lặp A–B (A–B Loop State Machine)

```mermaid
stateDiagram-v2
    [*] --> LoopIdle: Khởi tạo file mới (A = null, B = null)
    
    LoopIdle --> PointASet: Nhấn phím '[' (Gán A = currentTime)
    PointASet --> LoopActive: Nhấn phím ']' (Gán B = currentTime VỚI ĐIỀU KIỆN B > A)
    
    PointASet --> PointASet: Nhấn phím '[' lần nữa (Cập nhật lại điểm A mới)
    
    LoopActive --> LoopDisabled: Nhấn nút/phím tắt Tắt Loop
    LoopDisabled --> LoopActive: Nhấn nút/phím tắt Bật lại Loop (Giữ nguyên A & B)
    
    LoopActive --> LoopIdle: Chuyển sang file khác (Reset hoàn toàn)
    LoopActive --> PointASet: Nhấn phím '[' để thiết lập lại từ đầu
```

### B. Quy tắc Hợp lệ của Điểm A và B:
1. **Điểm A:** Được xác lập khi người dùng nhấn `[`. Lúc này `pointA = currentTime`.
2. **Điểm B:** Được xác lập khi người dùng nhấn `]`.
   - Nếu `currentTime > pointA`: Thiết lập thành công `pointB = currentTime`, tự động kích hoạt vòng lặp `isLoopActive = true`.
   - Nếu `currentTime ≤ pointA`: Bỏ qua hoặc gán `pointB = min(duration, pointA + 1.0)` để đảm bảo luôn thỏa mãn điều kiện `pointA < pointB`.
3. Khi người dùng chủ động tua thời gian (`seek`) ra ngoài khoảng `[pointA, pointB]`: Tạm dừng vòng lặp hoặc tự động kéo con trỏ playback quay trở lại điểm A.
4. **Xử lý Keyframe & Độ trễ Tua Video (Video Keyframe & FastSeek Optimization):**
   - Đối với video có khoảng cách I-Frame (Keyframe) lớn (từ 2s - 5s): Khi lặp từ B về A, lệnh gán `currentTime = pointA` có thể bị khựng nhẹ nếu A không rơi trúng Keyframe.
   - Ứng dụng ưu tiên gọi `video.fastSeek(pointA)` (nếu engine Webview hỗ trợ) để nhảy tới keyframe gần nhất trước khi render chính xác, đồng thời tận dụng Hardware Decoding của AVFoundation (macOS) và Media Foundation (Windows) để giảm thiểu độ trễ dựng khung hình xuống dưới 16ms (1 frame ở 60fps).

---

### C. Thuật toán Fade Âm thanh Thích ứng (Adaptive Audio Fade Algorithm)

**Mục đích:** Khi lặp lại một đoạn âm thanh ngắn liên tục, việc nhảy tức thì từ điểm B về điểm A sẽ tạo ra tiếng "bụp" (audio pop/click) rất khó chịu cho tai người nghe do biên độ sóng âm bị ngắt đột ngột. Thuật toán này hạ dần âm lượng (Fade-out) ngay trước điểm B và nâng dần âm lượng (Fade-in) ngay sau điểm A.

```text
Quy chuẩn Tính toán Thời lượng Fade:

1. Tính độ dài đoạn lặp:
   loopDuration = pointB - pointA

2. Xác định thời lượng Fade:
   Nếu loopDuration < 500 ms (0.5 giây):
       fadeDuration = 0 ms  (Đoạn quá ngắn, không can thiệp để giữ nguyên nhịp)
   Nếu loopDuration ≥ 500 ms:
       fadeDuration = min(loopDuration × 0.02, 100 ms)
       (Thời lượng fade tối đa là 100 mili-giây, hoặc bằng 2% chiều dài đoạn lặp)

Ví dụ thực tế:
- Đoạn lặp 1.0s  → fadeDuration = 20 ms
- Đoạn lặp 2.5s  → fadeDuration = 50 ms
- Đoạn lặp 5.0s+ → fadeDuration = 100 ms (Chạm ngưỡng trần tối đa)
```

### Biểu đồ Đường cong Âm lượng theo Thời gian (Volume Envelope Curve):

```text
Âm lượng (Volume)
 100% ──────┐                                     ┌──────
            │ \                                 / │
            │  \ (Fade-out)         (Fade-in)  /  │
            │   \                             /   │
   0% ──────┴────▼───────────────────────────▲────┴──────
            │◄───►│                         │◄───►│
         fadeDuration                    fadeDuration
            │                               │
        (B - fadeDuration)                  A           B
```

**Nguyên tắc Kỹ thuật & Triển khai Web Audio API GainNode:**
- **Không sửa file gốc:** Chỉ can thiệp vào tín hiệu âm thanh xuất ra loa (Playback Output), tuyệt đối không ghi đè dữ liệu tệp vật lý.
- **Không crossfade:** Đây là cơ chế Fade-out then Seek then Fade-in, không trộn hai luồng âm thanh cùng một lúc.
- **Triển khai qua Web Audio API (`GainNode`):** 
  - Thay vì thay đổi thuộc tính `media.volume` một cách thủ công (dễ bị giật theo khung hình của JS event loop), hệ thống kết nối `<audio>` / `<video>` vào một `GainNode` của `AudioContext`.
  - Sử dụng phương thức chuẩn `gainNode.gain.linearRampToValueAtTime()` hoặc `exponentialRampToValueAtTime()`.
  - **Lý do lựa chọn:** Web Audio API chạy trên luồng âm thanh chuyên dụng (Audio Rendering Thread) của hệ điều hành, cho phép điều khiển âm lượng chính xác đến từng mili-giây với độ mượt tuyệt đối, loại bỏ 100% tiếng bụp (audio clicks/pops) mà không gây tốn CPU.

---

## 6. Luồng Trích xuất & Hiển thị Metadata Âm thanh (Audio Metadata Pipeline)

Khi mở một tệp âm thanh (`.mp3`, `.flac`, `.wav`, `.m4a`), hệ thống đọc thông tin từ file theo quy trình Read-Only:

```mermaid
graph TD
    A[Mở file Audio] --> B[Gọi Rust Tauri Command: read_audio_metadata]
    B --> C{Trích xuất Metadata bằng thư viện Rust (lofty/id3)}
    
    C -- Đọc thành công --> D[Trích xuất các trường thông tin khả dụng]
    D --> D1[Title / Tiêu đề bài hát]
    D --> D2[Artist / Nghệ sĩ biểu diễn]
    D --> D3[Album / Tên album]
    D --> D4[Track Number & Year / Năm phát hành]
    D --> D5{Có nhúng Bìa đĩa (Cover Art)?}
    
    D5 -- Có --> E1[Chuyển đổi binary ảnh sang Base64 Data URL]
    D5 -- Không --> E2[Sử dụng ảnh placeholder đĩa than mặc định]
    
    C -- Không có metadata / Lỗi --> F[Sử dụng Tên file làm Tiêu đề dự phòng]
    F --> E2
    
    D1 & D2 & D3 & D4 & E1 & E2 --> G[Hiển thị lên Player Audio View]
```

### Quy tắc Dự phòng (Fallback Rules):
- Nếu trường `Title` bị rỗng: Lấy tên file (đã bỏ đuôi mở rộng) làm tiêu đề hiển thị.
- Nếu trường `Artist` bị rỗng: Hiển thị nhãn `"Unknown Artist"`.
- Nếu trường `Album` bị rỗng: Bỏ trống hoặc ẩn dòng Album.
- Nếu không có `Artwork`: Hiển thị khung tròn đồ họa đĩa than tối giản mang phong cách hiện đại.
- Thiếu bất kỳ trường metadata nào cũng **tuyệt đối không được coi là lỗi** làm gián đoạn việc phát bài hát.

---

## 7. Cơ chế Quản lý Bộ nhớ, Bộ đệm RAM & Dọn dẹp Cache (Memory & Cache Lifecycle)

### A. Bốn loại Cache Tiềm tàng & Rủi ro Phình to Ổ cứng:
1. **Thumbnail Cache (Ảnh thu nhỏ):** Các app xem ảnh thông thường giải mã ảnh gốc và ghi file `.thumb` xuống đĩa. Khi duyệt thư mục 10.000 file, cache này có thể chiếm từ 2GB đến 5GB ổ cứng.
2. **Webview Cache (`EBWebView` trên Windows, `WebKit` trên Mac):** Chứa HTTP cache, shader GPU và file đệm stream do Webview tự động ghi xuống đĩa.
3. **Media Temporary Buffers:** Các đoạn video/audio buffer tạm thời khi seek tua liên tục.
4. **Decoded Bitmaps trong RAM:** Mảng pixel giải mã của các bức ảnh độ phân giải cao (ảnh 48MP có thể chiếm tới 300MB RAM cho một file).

### B. Kiến trúc Zero-Disk-Cache & Kiểm soát RAM Tối ưu của Media Tool:

```text
┌────────────────────────────────────────────────────────────────────────┐
│               KIẾN TRÚC QUẢN LÝ BỘ NHỚ "ZERO-DISK-CACHE"               │
├──────────────────────────────────┬─────────────────────────────────────┤
│ 1. Không ghi Thumbnail ra đĩa    │ Sidebar dùng Icon SVG Vector nhẹ.   │
│    (Zero Disk Thumbnails)        │ Tuyệt đối không sinh file cache đĩa.│
├──────────────────────────────────┼─────────────────────────────────────┤
│ 2. Cửa sổ trượt RAM 3-Slot       │ Chỉ giữ: [ i - 1 ] [ i ] [ i + 1 ]. │
│    (3-Slot Sliding Window RAM)   │ Chuyển ảnh là hủy tham chiếu cũ ngay│
├──────────────────────────────────┼─────────────────────────────────────┤
│ 3. Vô hiệu hóa Disk Cache Webview│ Cấu hình Tauri: --disable-http-cache│
│    (Webview Cache Suppression)   │ Không lưu buffer tĩnh vào ổ đĩa.    │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 4. Tự dọn sạch khi đóng App      │ Hook vòng đời Rust: Destroyed Event │
│    (Clean-on-Exit Lifecycle)     │ Xóa sạch mọi thư mục tạm trên OS.   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### C. Cơ chế Dọn dẹp Phân định theo Hệ Điều hành (OS Differences):
* **Trên macOS:**
  - File cache hệ thống (nếu có phát sinh từ WebKit) bị giới hạn chặt chẽ trong `~/Library/Caches/<bundle_id>/`.
  - Hệ điều hành macOS tự động kích hoạt tính năng **Purgeable Space** để thu hồi dung lượng khi ổ cứng Mac gần đầy.
* **Trên Windows:**
  - Cấu hình thư mục dữ liệu người dùng (UserDataFolder) của WebView2 về đúng đường dẫn chuyên biệt: `%LOCALAPPDATA%\media_tool\webview_data`.
  - Thiết lập hook vòng đời thoát app trong Rust (`on_window_event: WindowEvent::Destroyed`):
    ```rust
    // Quét và xóa toàn bộ file tạm phát sinh khi người dùng đóng ứng dụng
    if let Ok(temp_path) = app_handle.path().app_cache_dir() {
        let _ = std::fs::remove_dir_all(&temp_path);
    }
    ```
  - **Kết quả:** Đảm bảo cả trên Windows lẫn macOS, ứng dụng không bao giờ để lại rác tệp sau phiên làm việc, giữ ổ đĩa người dùng luôn sạch sẽ 100%.

---

## 8. Luồng Điều khiển Âm lượng, Web Audio API GainNode & Huy hiệu OSD

Hệ thống điều khiển âm lượng can thiệp qua luồng Web Audio API độc lập, đảm bảo độ mượt 60fps và không làm nghẽn tiến trình render chính.

### A. Máy Trạng thái Âm lượng (Volume State Machine)

```mermaid
stateDiagram-v2
    [*] --> Unmuted: Khởi tạo (Đọc localStorage, mặc định 0.8)
    
    Unmuted --> VolumeAdjust: Nhấn Phím ↑/↓ hoặc Cuộn chuột
    VolumeAdjust --> Unmuted: Cập nhật GainNode, Bắn Volume OSD (1s)
    
    Unmuted --> Muted: Click Icon Loa / Nhấn Shift+M
    Muted --> Unmuted: Click lại Icon Loa / Nhấn Shift+M (Khôi phục mức cũ)
    Muted --> VolumeAdjust: Nhấn Phím ↑ hoặc Cuộn lên (Tự động unmute)
```

### B. Logic Kỹ thuật Chi tiết:
1. **Liên kết Web Audio API `GainNode` & Xử lý Autoplay Policy:**
   - Khi phần tử `<video>` hoặc `<audio>` nạp source:
     ```typescript
     const audioCtx = new AudioContext();
     const source = audioCtx.createMediaElementSource(mediaElement);
     const gainNode = audioCtx.createGain();
     source.connect(gainNode);
     gainNode.connect(audioCtx.destination);

     // Khắc phục chính sách Autoplay Policy của WebKit / WebView2:
     // Nếu AudioContext bị suspended trước tương tác người dùng, tự động resume khi có gesture đầu tiên
     const ensureAudioResumed = async () => {
       if (audioCtx.state === 'suspended') {
         await audioCtx.resume();
       }
     };
     window.addEventListener('keydown', ensureAudioResumed, { once: true });
     window.addEventListener('click', ensureAudioResumed, { once: true });
     ```
   - Khi chỉnh âm lượng:
     `gainNode.gain.setValueAtTime(is_muted ? 0.0 : volume, audioCtx.currentTime);`
2. **Quy tắc Tính toán & Chặn biên (Boundary Clamping):**
   - Tăng: `newVolume = Math.min(1.0, volume + 0.05);`
   - Giảm: `newVolume = Math.max(0.0, volume - 0.05);`
3. **Cơ chế Volume OSD Timer:**
   - Mỗi khi `volume` thay đổi qua phím tắt hoặc con lăn chuột:
     - Giao diện bật `showVolumeOSD = true`.
     - Xóa bỏ bộ đếm hẹn giờ cũ `clearTimeout(osdTimer)`.
     - Kích hoạt hẹn giờ mới 1000ms: Sau 1 giây không có tương tác, `showVolumeOSD = false` (Fade out 200ms).
4. **Lưu trữ Cấu hình (Persistence):**
   - Mọi thay đổi `volume` đều ghi vào `localStorage.setItem('media_tool_volume', volume.toFixed(2))`.

---

## 9. Luồng Xáo Trộn (Shuffle) & Lặp Tệp (Loop File Modes)

### A. Chế độ Lặp Tệp (Loop File Engine)
Có 3 trạng thái luân phiên khi bấm nút hoặc nhấn phím tắt `R` (hoặc `L` trên menu chuột phải):
* **`All` (Lặp toàn bộ - Mặc định):**
  - Khi media hiện tại phát hết (`onended`): Tự động phát tiếp file tiếp theo.
  - Khi chạm cuối danh sách: Quay trở lại file đầu tiên (hoặc phần tử đầu của mảng Shuffle).
* **`Single` (Lặp 1 tệp duy nhất):**
  - Khi media phát hết: `media.currentTime = 0; media.play();` (Không chuyển file).
* **`Off` (Không lặp):**
  - Khi media phát hết: Dừng lại ở frame cuối cùng, chuyển trạng thái về `Paused`.

### B. Thuật toán Xáo Trộn Danh Sách (Fisher-Yates Shuffle Algorithm)
Khi người dùng bật chế độ **`Shuffle` (Phím `S`)**:
1. Hệ thống không làm xáo trộn mảng tệp gốc (để giữ nguyên thứ tự Natural Sort cho Right Sidebar).
2. Thay vào đó, hệ thống sinh một mảng chỉ mục xáo trộn độc lập `shuffled_indices: number[]`:
   ```typescript
   function generateShuffleIndices(total: number, currentIndex: number): number[] {
     const indices = Array.from({ length: total }, (_, i) => i);
     // Đưa currentIndex ra ngoài để luôn phát đầu tiên
     indices.splice(currentIndex, 1);
     // Thuật toán Fisher-Yates shuffle
     for (let i = indices.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [indices[i], indices[j]] = [indices[j], indices[i]];
     }
     return [currentIndex, ...indices];
   }
   ```
3. Khi bấm `[Tiếp ▶]`: Tiến tới chỉ mục tiếp theo trong `shuffled_indices`.
4. Khi tắt Shuffle: Con trỏ quay trở lại vị trí của file hiện tại trong mảng Natural Sort ban đầu mà không bị gián đoạn phát.

---

## 10. Luồng Vòng Đời Thoát Sạch trên macOS & Windows (`WindowEvent::CloseRequested`)

Quy tắc phần mềm đặt ra: **Bấm nút đỏ [X] là thoát 100% ứng dụng ngay lập tức, dọn sạch RAM và không để lại biểu tượng chạy ngầm trên thanh Dock**.

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant OS as macOS / Windows OS
    participant Rust as Tauri Rust Backend
    participant RAM as Memory & Cache Manager
    
    User->>OS: Click nút đỏ [X] hoặc bấm Alt+F4 / Cmd+W
    OS->>Rust: Gửi sự kiện WindowEvent::CloseRequested
    Note over Rust: Kích hoạt hook on_window_event
    Rust->>RAM: Hủy 3-Slot Image Preload Buffer
    Rust->>RAM: Ngắt kết nối Web Audio Context & Webview
    Rust->>RAM: Dọn sạch file cache tạm (app_cache_dir)
    Rust->>OS: Gọi window.app_handle().exit(0)
    Note over OS: macOS gỡ bỏ dấu chấm tròn trên Dock<br/>Tiến trình biến mất 100% khỏi Activity Monitor
```

* **Mã hóa cứng (Hardcoded Rule):** 
  - Hành vi này không cho phép người dùng cấu hình tắt trong Cài đặt nhằm bảo đảm ứng dụng luôn nhẹ, nhanh, mở lên là dùng và đóng là giải phóng toàn bộ tài nguyên cho máy.

---

## 11. Luồng Tự Động Ẩn / Hiện HUD & Chuyển Đổi Mini PiP Responsive

### A. Bộ đếm Thời gian Ẩn HUD (Inactivity HUD Timer)
* Trạng thái HUD bao gồm: Window Bar + Control Bar + Timeline + Footer.
* Khi khởi động: HUD ở trạng thái HIỆN (`hudVisible = true`).
* Logic bộ đếm:
  ```typescript
  let hudTimer: NodeJS.Timeout | null = null;

  function resetHudTimer(delayMs: number = 2000) {
    if (!hudVisible) setHudVisible(true);
    if (hudTimer) clearTimeout(hudTimer);
    
    hudTimer = setTimeout(() => {
      // Chỉ ẩn khi đang phát video/audio và không hover vào menu cài đặt/context menu
      if (isPlaying && !isContextMenuOpen && !isSettingsOpen) {
        setHudVisible(false);
      }
    }, delayMs);
  }
  ```
* Bất kỳ sự kiện người dùng: `window.onmousemove`, `window.onkeydown`, `window.onclick` đều gọi hàm `resetHudTimer()`.

### B. Chuyển Đổi Chế Độ Mini PiP Mode (`width < 500px` hoặc `height < 320px`)
1. Giao diện lắng nghe sự kiện `ResizeObserver` hoặc `window.onresize`.
2. Khi kích thước cửa sổ vượt qua ngưỡng biên:
   - Tự động bật cờ `isMiniPip = true`.
   - Thu gọn timeline thành vệt mỏng 3px.
   - Thu gọn hàng điều khiển chỉ còn 3 nút: `[◀ Trước] [▶/⏸] [Tiếp ▶]`.
   - Giảm thời gian `hudDelayMs` từ 2000ms xuống **1000ms**.
   - Mặc định ở chế độ PiP: HUD ẩn 100%, chỉ hiện khi con trỏ chuột rê vào bên trong cửa sổ mini.

---

## 12. Cơ chế Điều phối Cửa sổ Đơn & Mở Thẻ Tab (Single Instance IPC Pipeline)

Nhằm tối ưu hóa tài nguyên và trải nghiệm người dùng trên Windows và macOS, khi người dùng mở một tệp media mới (qua thao tác click mở file từ Finder/Explorer hoặc "Open with"):
1. Ứng dụng tích hợp plugin `tauri-plugin-single-instance`.
2. Khi một instance thứ hai được khởi chạy từ hệ thống:
   - Plugin chặn tạo tiến trình GUI mới.
   - Trích xuất danh sách tham số dòng lệnh (`argv`), lọc và chuẩn hóa đường dẫn file hợp lệ (hỗ trợ cả đường dẫn POSIX, Windows backslash và định dạng `file://`).
   - Gửi sự kiện IPC `open-media-file` trực tiếp đến cửa sổ chính `main` hiện có kèm payload chuỗi đường dẫn tệp.
   - Đưa cửa sổ chính lên tiền tuyến (Unminimize, Set Focus).
3. Phía Frontend lắng nghe sự kiện `open-media-file`:
   - Nếu tệp thuộc cùng thư mục đang mở, nạp và chuyển ngay đến vị trí tệp trong danh sách hiện tại.
   - Nếu tệp thuộc thư mục mới, mở thêm thẻ Tab mới trên thanh tiêu đề của cùng cửa sổ thay vì phân mảnh thành nhiều cửa sổ riêng biệt.
   - Tự động kích hoạt (active) thẻ tab và bắt đầu phát/hiển thị media.

---

## 13. Cơ chế Co giãn Media & Kéo Tua Timeline (Media Scaling & Interactive Timeline)

### A. Tùy chọn Co giãn Media (Media Fit Modes)
- **`scale_to_fit` (Mặc định):** Áp dụng class `w-full h-full object-contain`. Media luôn phóng to vừa khít không gian hiển thị của cửa sổ hoặc toàn màn hình mà không làm méo tỷ lệ cạnh.
- **`limit_file_size`:** Áp dụng class `max-w-full max-h-full w-auto h-auto object-contain`. Giới hạn kích thước hiển thị tối đa theo đúng độ phân giải pixel gốc của tệp tin. Giúp tránh vỡ hạt khi xem ảnh/video nhỏ trên màn hình 4K/Retina.

### B. Kéo Tua & Tương tác Mốc Lặp A/B (Interactive Timeline & A/B Dragging)
- **Kéo tua trực tiếp (Drag Seek):** Người dùng có thể nhấn chuột vào bất kỳ vị trí nào trên thanh tiến trình và kéo chuột (`mousemove`) để tua video/audio liên tục trong thời gian thực.
- **Kéo thả mốc A/B (Marker Dragging):** Khi mốc A hoặc B đã được thiết lập, người dùng có thể nhấp chuột trực tiếp vào biểu tượng marker `A` hoặc `B` trên timeline và kéo thả để tinh chỉnh vị trí mốc lặp.
- **Hủy mốc thông minh (Click to Cancel):** Khi click vào nút "Set A" hoặc "Set B" tại vị trí phát hiện tại mà khoảng cách đến mốc cũ nhỏ hơn ngưỡng nhạy `0.25s`, hệ thống sẽ hiểu là thao tác hủy mốc và tự động xóa bỏ mốc tương ứng.


## 14. Phát nền video và audio khi mở ảnh (2026-10-09)

- Windows Explorer gửi `open-media-file` vào cửa sổ chính qua single-instance; macOS Finder gửi file-open event. Cùng thư mục tái sử dụng tab, khác thư mục tạo tab mới; cả hai luồng chỉ đổi viewport.
- App giữ một Player audio và một Player video ngoài viewport của tab. Mở ảnh/PDF hoặc quay lại không tạo lại player, không nạp lại URL, không reset tiến độ hay A–B.
- Trong một cửa sổ, chỉ nguồn được phát gần nhất có âm thanh: phát video tạm dừng audio; phát audio tạm dừng video. Nguồn bị tạm dừng giữ tiến độ, quay lại không tự phát lại.
- Space khi xem ảnh/PDF và thanh phát nền điều khiển nguồn vừa nghe. Player ẩn không nhận phím tua/A–B hoặc mũi tên điều hướng ảnh.
- Hết video ở chế độ lặp toàn bộ chuyển đến video kế tiếp trong thư mục nguồn, bỏ qua ảnh, không đổi tab/ảnh đang xem. Lặp một file giữ nguyên nguồn và tua về đầu; lặp tắt kết thúc phát.
- Đóng tab nguồn, hoặc “Đóng các tab khác” loại bỏ tab nguồn, dừng và gỡ nguồn video/audio. Chuyển session sang cửa sổ khác chưa có cơ chế chuyển giao liên tục tiến độ phát; không suy rộng kiểm thử trong một cửa sổ thành phát toàn cục giữa cửa sổ.

### Fullscreen native và HUD (2026-10-09)
- App desktop dùng fullscreen native Tauri; DOM Fullscreen API chỉ phục vụ browser preview. F/F11 hoặc nút fullscreen bật/tắt; Escape thoát khi không có Settings/context menu cần đóng trước. Trạng thái cũng đồng bộ từ resize native (gồm thao tác OS).
- Vào fullscreen ẩn HUD ngay, bất kể setting hoặc trạng thái ẩn thủ công của cửa sổ thường. Di chuột/click hiện HUD; sau 2 giây không tương tác ẩn lại, giữ HUD khi Settings/context menu đang mở. Thoát fullscreen khôi phục logic setting và trạng thái ẩn thủ công trước đó.
- Fullscreen có nút Close trong HUD trên cả macOS/Windows để đóng trực tiếp; không render cụm minimize/maximize; cửa sổ thường giữ một cụm controls, decorations luôn false. Dải kéo cửa sổ không bắt chuột trong fullscreen.
- Video `scale_to_fit` lấy kích thước viewport hiện tại, không lưu kích thước resize cũ; `limit_file_size` vẫn giới hạn độ phân giải gốc. Không remount video khi đổi fullscreen.
- Ở cửa sổ thường với chế độ luôn hiện HUD: sau 2 giây không tương tác, Window Bar và các thanh HUD còn 40% opacity; di chuột/click/phím/scroll khôi phục 100%. Không làm mờ media/Settings/context menu. Ẩn thủ công, Mini PiP và fullscreen giữ logic riêng.
