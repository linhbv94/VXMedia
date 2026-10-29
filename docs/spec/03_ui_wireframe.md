# UI & Wireframe Specification: Media Tool (`_spec3_ui_wireframe`)

> **Phiên bản:** 1.1.0
> **Ngày cập nhật:** 2026-10-09
> **Phân loại đặc tả:** Bố cục Giao diện (Layout Wireframe), Bảng màu & Hợp đồng Phím tắt  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [02_feature_flow.md](02_feature_flow.md)  

---

## 1. Tôn chỉ Thiết kế (Design Philosophy)

1. **Content-First (Ưu tiên Tuyệt đối cho Nội dung):**
   - 95% diện tích màn hình dành trọn cho media (ảnh, video hoặc thông tin âm nhạc).
   - Tuyệt đối không sử dụng thanh điều hướng bên lề (sidebar) hoặc thanh công cụ cố định (fixed toolbar) gây lãng phí không gian hiển thị.
2. **Minimalist Floating HUD (Màn hình Phủ Tối giản):**
   - Các chỉ số trạng thái hiển thị dưới dạng lớp phủ trong suốt (Semi-transparent Floating Overlays) và tự động ẩn khi không có tương tác chuột để tránh làm phiền mắt nhìn.
3. **Bảng màu Tối Hiện đại (Modern Dark Aesthetic):**
   - Nền cửa sổ: Màu tối trầm `#0f1117` tạo chiều sâu và độ tương phản tối đa cho ảnh và video.
   - Thẻ nổi / HUD: Nền kính mờ `rgba(20, 24, 33, 0.85)` với viền mảnh `rgba(255, 255, 255, 0.08)`.
   - Màu nhấn Trạng thái (Accents):
     - **Active Mark:** Màu đỏ cam nổi bật `#f43f5e` (hoặc Vàng hổ phách `#f59e0b`).
     - **A-B Loop Active:** Màu xanh Cyan `#06b6d4` hoặc Emerald `#10b981`.
     - **Văn bản chính:** Trắng sáng `#f8fafc`; Văn bản phụ: Xám `#94a3b8`.

---

## 2. Wireframe Phân hệ Viewer (Image Viewer)

Giao diện xem ảnh tối giản, hiện đại và tập trung tối đa vào bức ảnh. Thanh thông tin tệp (tên file + số thứ tự) được tích hợp trực tiếp vào chính giữa thanh điều hướng, thanh công cụ gộp thành 1 hàng duy nhất và Toast phản hồi nổi ngay phía trên thanh công cụ.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                   [📌 Ghim] [👁️ Ẩn HUD] [📑 DS]│ ◄─ Window Bar (Chuẩn cả 3 phân hệ)
│                                                                        │
│                                                                        │
│                             [ BỨC ẢNH ]                                │
│                   (Tự căn giữa, fit khít cửa sổ)                       │
│                                                                        │
│                                                                        │
│                 ┌────────────────────────────────────┐                 │
│                 │  ✓ Đã sao chép 4 tệp vào Clipboard │                 │ ◄─ Toast Feedback (Tự biến mất sau 2s)
│                 └────────────────────────────────────┘                 │    (Nổi lơ lửng phía trên Action Bar)
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [◀ File Trước] [File Tiếp ▶] │ 🏷️ DSC_0842.JPG [14/120] │ [☆ Mark] [⛶]│  │ ◄─ Bottom Bar: Trái (Nav), Giữa (Info), Phải (Mark, Fullscreen)
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Thành phần Giao diện & Nút bấm Viewer:
1. **Window Bar (Thanh cửa sổ trên cùng — Thống nhất cho cả 3 phân hệ):**
   - Góc trái: Cụm điều khiển cửa sổ OS `[●][▲][▼]` và tên ứng dụng `media_tool`.
   - Góc phải: Nút ghim cửa sổ `[📌 Ghim]` và nút mở danh sách `[📑 DS]`.
2. **Toast Feedback:**
   - Đặt lơ lửng ngay **phía trên** Action Bar.
   - Khi bấm Copy / Cut, Toast hiện ra thông báo kết quả trong 2 giây rồi tự mờ và biến mất.
3. **Bottom Action Bar (Gộp 1 hàng duy nhất, tích hợp Info ở giữa):**
   - **Canh lề trái:** `[◀ File Trước]` và `[File Tiếp ▶]` chuyển file trực tiếp.
   - **Canh giữa:** Thanh thông tin tệp `🏷️ DSC_0842.JPG   [ 14 / 120 ]` (Tên tệp + Số thứ tự trong thư mục).
   - **Canh lề phải:** `[☆ Đánh dấu]` / `[★ Đã mark]`, `[📦 Copy Mark]` / `[✂️ Cut Mark]` (nếu có mark) và `[⛶ Toàn màn hình]`.

---

## 3. Wireframe Phân hệ Player — Chế độ Video

Thanh điều khiển phát tinh gọn 2 hàng được sắp xếp theo đúng quy chuẩn phân cụm công năng:
- **Hàng 1:** Cụm Playback, Tua thời gian, Shuffle, Repeat, A-B Loop canh lề trái; Cụm Âm lượng (Volume) canh lề phải.
- **Hàng 2:** Chuyển tệp (`Prev/Next File`) canh lề trái; Thông tin tệp (`Info: Tên file + Số thứ tự`) nằm chính giữa; Đánh dấu (`Mark`) và Toàn màn hình (`Fullscreen`) canh lề phải.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                                       [📌 Ghim] [👁️ Ẩn HUD] [📑 DS]│ ◄─ Window Bar
│                                                                                            │
│                                                                                            │
│                              [ VIDEO CONTENT ]                                             │
│                           (Khung hiển thị Video)                                           │
│                                                                                            │
│                                                                                            │
│                    ┌────────────────────────────────────┐                                  │
│                    │  ✓ Đã sao chép 3 tệp vào Clipboard │                                  │ ◄─ Toast Feedback
│                    └────────────────────────────────────┘                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 01:14 ───────────────────●───────[════════════════]──────────── 04:32                │  │ ◄─ Timeline với mốc [A] và [B]
│  │ ──────────────────────────────────────────────────────────────────────────────────── │  │
│  │ [▶/⏸] [<<] [<] [>] [>>]  [🔀] [🔁 All]  [A] [B] [🔁 AB]          │  [🔊 80% ──●──]    │  │ ◄─ Hàng 1: Playback/Tua/Loop lề TRÁI │ Volume lề PHẢI
│  │ ──────────────────────────────────────────────────────────────────────────────────── │  │
│  │ [◀ File Trước] [File Tiếp ▶]  │  🏷️ action_clip_02.mp4 [15/120]  │  [☆ Mark (M)]  [⛶] │  │ ◄─ Hàng 2: Nav lề TRÁI │ Info CHÍNH GIỮA │ Mark/⛶ lề PHẢI
│  └──────────────────────────────────────────────────────────────────────────────────────┘  │ ◄─ Floating Control Bar (Mặc định HIỆN)
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Wireframe Phân hệ Player — Chế độ Audio (Âm nhạc & Podcast)

Khi mở file audio, giao diện giữ nguyên cấu trúc chuẩn của Control Bar: Window Bar phía trên, Card âm nhạc ở giữa, thanh điều khiển bên dưới tích hợp toàn bộ info.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                                                      [📌 Ghim] [📑 DS]│ ◄─ Window Bar
│                                                                                            │
│                     ┌───────────────────────────────────┐                                  │
│                     │          ┌─────────────┐          │                                  │
│                     │          │  BÌA ALBUM  │          │                                  │
│                     │          │ (Album Art) │          │                                  │
│                     │          └─────────────┘          │                                  │
│                     │      Counting Stars               │                                  │
│                     │      OneRepublic • Native (2013)  │                                  │
│                     └───────────────────────────────────┘                                  │
│                                                                                            │
│                     ┌────────────────────────────────────┐                                 │
│                     │  ✓ Đã sao chép 4 tệp vào Clipboard │                                 │ ◄─ Toast Feedback
│                     └────────────────────────────────────┘                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 00:45 ────────────────●──────────[═════════════]─────────────── 04:17                │  │ ◄─ Timeline
│  │ ──────────────────────────────────────────────────────────────────────────────────── │  │
│  │ [▶/⏸] [<<] [<] [>] [>>]  [🔀] [🔁 All]  [A] [B] [🔁 AB]          │  [🔊 80% ──●──]    │  │ ◄─ Hàng 1: Playback/Tua/Loop lề TRÁI │ Volume lề PHẢI
│  │ ──────────────────────────────────────────────────────────────────────────────────── │  │
│  │ [◀ File Trước] [File Tiếp ▶]  │  🏷️ track_03.mp3 [16/120]        │  [☆ Mark (M)]  [⛶] │  │ ◄─ Hàng 2: Nav lề TRÁI │ Info CHÍNH GIỮA │ Mark/⛶ lề PHẢI
│  └──────────────────────────────────────────────────────────────────────────────────────┘  │ ◄─ Floating Control Bar
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Wireframe Thanh Bên Phải — Danh sách Tệp Thư mục (Toggle Right Sidebar)

Người dùng có thể bật/tắt thanh bên phải bằng nút bấm **`[📑 Danh sách (B)]`** trên Top Bar hoặc phím tắt **`B`** (hoặc `Cmd/Ctrl + B`). Thanh bên trượt ra mượt mà từ cạnh phải, chiếm khoảng 260px - 280px chiều rộng mà không làm gián đoạn phát video hay xem ảnh.

```text
┌───────────────────────────────────────────────────────────┬──────────────┐
│ [●][▲][▼]                                                 │ 📁 Thư mục   │
│ 🏷️ DSC_0842.JPG   [ 14 / 120 ]   [◀][▶]   [📌 Ghim (P)]   │ 120 tệp [✕]  │
│                                                           ├──────────────┤
│                                                           │ 🔍 Lọc nhanh │
│                                                           ├──────────────┤
│                                                           │ 🖼️ 01_raw.jpg│
│                                                           │ 🖼️ 02_cam.png│
│                   [ VÙNG XEM MEDIA ]                      │ ⭐ 03_sky.jpg│ ◄─ Tệp đã mark
│                (Tự động co giãn theo khung)               │ ▶ 04_act.mp4 │
│                                                           │ 🖼️ DSC_0842 ●│ ◄─ Tệp đang xem
│                                                           │ 🎵 06_rec.mp3│
│ ───────────────────────────────────────────────────────── │ 🖼️ 07_res.jpg│
│ [▶ Phát]  [⏪ -5s]  [+5s ⏩]  [⭐ Đánh dấu]  [📦 Copy Đã Mark] │ 🖼️ 08_end.png│
└───────────────────────────────────────────────────────────┴──────────────┘
```

### Các Đặc điểm & Tính năng của Right Sidebar:
1. **Dữ liệu Sẵn có Tức thì (Zero Latency):** Danh sách tệp này đã nằm sẵn trong bộ nhớ RAM từ lệnh quét thư mục khởi tạo (`items: MediaItem[]`). Việc bật/tắt hoàn toàn là chuyển đổi hiển thị giao diện, không tốn thời gian quét lại đĩa.
2. **Nhảy Tệp 1-Click (Instant File Jump):** Bấm chuột vào bất kỳ dòng nào trong danh sách sẽ lập tức chuyển ngay đến tệp đó (tự động đổi chế độ Viewer ↔ Player tương ứng).
3. **Chỉ báo Trực quan Rõ nét:**
   - **Tệp đang xem:** Được tô sáng nền màu xanh đậm kèm dấu chấm `●`.
   - **Tệp đã đánh dấu:** Hiển thị biểu tượng ngôi sao vàng cam `⭐`.
   - **Icon định dạng:** Phân biệt rõ ràng icon ảnh `🖼️`, video `▶`, audio `🎵`.
4. **Ô Tìm kiếm & Lọc nhanh (Quick Search/Filter):** Cho phép gõ tên file để lọc nhanh danh sách khi thư mục có hàng trăm/hàng nghìn tệp.

---

## 6. Bảng Hợp đồng Phím tắt & Đối chiếu Nút bấm UI

Mọi chức năng đều hỗ trợ song song cả **Phím tắt nhanh** lẫn **Nút bấm trực quan (Button UI)**:

| Chức năng Thao tác | Phím tắt macOS | Phím tắt Windows | Nút bấm Trực quan trên UI |
| :--- | :--- | :--- | :--- |
| **Ảnh trước / Ảnh sau** *(Khi đang xem Ảnh)* | `Mũi tên Trái` / `Phải` | `Mũi tên Trái` / `Phải` | Nút `[◀ File]` / `[File ▶]` |
| **File Media trước / sau** *(Ở Video/Audio)* | `Cmd + Trái` / `Phải` | `Ctrl + Trái` / `Phải` | Nút `[◀ File]` / `[File ▶]` |
| **Phát / Tạm dừng** | `Space` | `Space` | Nút `[▶ Phát / ⏸ Dừng]` |
| **Tua chính xác ±1 giây** | `Mũi tên Trái` / `Phải` | `Mũi tên Trái` / `Phải` | Nút `[◀ -1s]` / `[+1s ▶]` |
| **Tua nhanh ±5 giây** | `Shift + Trái` / `Phải` | `Shift + Trái` / `Phải` | Nút `[⏪ -5s]` / `[+5s ⏩]` |
| **Nhảy mốc timeline 0% → 90%** | Phím số `0` đến `9` | Phím số `0` đến `9` | Click trực tiếp vào vị trí trên Timeline |
| **Đánh dấu / Bỏ đánh dấu file này** | Phím `M` | Phím `M` | Nút `[☆ Đánh dấu]` / `[★ Đã mark]` (Outline ↔ Fill) |
| **Copy DUY NHẤT file đang xem** | `Cmd + C` | `Ctrl + C` | Phím tắt nhanh (Đã bỏ nút để tối giản UI) |
| **Copy TẤT CẢ các file Đã Mark** | `Cmd + Shift + C` | `Ctrl + Shift + C` | Nút `[📦 Copy Mark (N)]` |
| **Cut (Cắt/Move) các file Đã Mark** | `Cmd + Shift + X` | `Ctrl + Shift + X` | Nút `[✂️ Cut Mark (N)]` |
| **Đặt điểm lặp A / Điểm B** | Phím `[` / Phím `]` | Phím `[` / Phím `]` | Nút `[Set Điểm A]` / `[Set Điểm B]` |
| **Bật / Tắt Vòng lặp A–B** | Phím `\` (hoặc `Option + L`) | Phím `\` (hoặc `Alt + L`) | Nút `[🔁 AB: BẬT/TẮT]` |
| **Bật / Tắt Xáo trộn (Shuffle)** | Phím `S` | Phím `S` | Nút `[🔀 Shuffle: BẬT/TẮT]` |
| **Chế độ Lặp Tệp (Loop File)** | Phím `L` (hoặc `R`) | Phím `L` (hoặc `R`) | Nút `[🔁 File: Tắt ↔ 1 ↔ All]` |
| **Tăng / Giảm Âm lượng (±5%)** | `Mũi tên Lên` / `Xuống` | `Mũi tên Lên` / `Xuống` | Thanh trượt `[🔊 Slider]` / Cuộn chuột |
| **Bật / Tắt tiếng (Mute Toggle)** | `Shift + M` | `Shift + M` | Click Icon Loa `[🔊] / [🔇]` |
| **Ghim cửa sổ trên cùng (Pin on Top)** | Phím `P` | Phím `P` | Nút `[📌 Ghim / Unpin]` |
| **Bật/Tắt Danh sách Thư mục (Sidebar)**| Phím `B` | Phím `B` | Nút `[📑 Danh sách (B)]` |
| **Ẩn / Hiện thanh điều khiển (HUD)** | Phím `H` | Phím `H` | Nút `[👁️ Ẩn/Hiện HUD]` |
| **Toàn màn hình (Fullscreen)** | `Cmd + Ctrl + F` / `F` | `F11` / `F` | Nút `[⛶ Toàn màn hình]` |
| **Đóng / Thoát ứng dụng sạch sẽ** | `Cmd + W` / Click `[X]` | `Alt + F4` / Click `[✕]` | Nút tắt cửa sổ OS |

---

## 7. Định dạng Icon Hệ thống (Icon System Standards)

Toàn bộ icon hiển thị trên các nút bấm (Buttons) và thanh công cụ của ứng dụng thống nhất sử dụng **chuẩn định dạng SVG (Scalable Vector Graphics)** kết hợp thư viện **Lucide Icons** (`lucide-react`):
- **Ưu điểm tuyệt đối:**
  1. *Độ sắc nét vô hạn (Vector):* Hiển thị sắc nét 100% trên mọi loại màn hình từ Full HD thông thường đến màn hình Retina độ phân giải cao của Mac hay 4K Windows, không bao giờ bị vỡ hạt như PNG.
  2. *Dung lượng siêu nhẹ:* Mỗi icon SVG chỉ nặng vài trăm bytes, không làm tăng dung lượng bundle.
  3. *Tự động biến đổi màu theo trạng thái:* Kế thừa thuộc tính `currentColor` của CSS, tự động chuyển màu sáng/tối khi hover, click, disabled hoặc chuyển Dark Mode mượt mà.
  4. *Không dùng PNG cho nút bấm:* Định dạng PNG/WebP chỉ dùng cho dữ liệu media nội dung (bìa album, ảnh người dùng), tuyệt đối không dùng làm icon nút bấm.

---

## 8. Logic Điều phối Thư mục Hỗn hợp (Mixed Folder Dynamic Switching)

Một thư mục làm việc thực tế thường chứa lẫn lộn cả ảnh (`.jpg`, `.png`), video (`.mp4`, `.mov`) và âm thanh (`.mp3`).

### Cơ chế Tự động Chuyển đổi Linh hoạt (Dynamic Mode Switching):
1. **Danh sách Duyệt Thống nhất (Unified Playlist):**
   - Khi mở thư mục, ứng dụng liệt kê **tất cả** các tệp media được hỗ trợ (ảnh, video, audio) thành một danh sách tuần tự duy nhất theo thuật toán Sắp xếp Tự nhiên (`natural_sort`).
   - Ví dụ: `01.jpg` → `02.mp4` → `03.jpg` → `04.mp3`.
2. **Quy tắc Chuyển Đổi Giao diện Tức thì (Hot-swap UI):**
   - Đang ở `01.jpg` (Viewer Mode) → Next sang `02.mp4` → Ứng dụng **tự động chuyển ngay sang Player Mode**, nạp video và hiện thanh playback.
   - Đang ở `02.mp4` (Player Mode) → Next sang `03.jpg` → Ứng dụng **chuyển về Viewer Mode** hiển thị ảnh, giữ video phát nền và tiến độ/A–B.
3. **Quy tắc Phím tắt Điều hướng khi qua lại giữa Ảnh và Video:**
   - **Khi đang xem Ảnh:** Bấm `Mũi tên Phải (→)` hoặc `Cmd/Ctrl + →` đều chuyển sang file tiếp theo (`02.mp4`) vì ảnh không có dòng thời gian tua.
   - **Khi đã chuyển sang Video:** Mũi tên đơn lẻ `←` / `→` được ưu tiên làm nhiệm vụ **Tua thời gian (Seek ±1s)**. Do đó, để chuyển sang file tiếp theo (`03.jpg`), người dùng dùng tổ hợp phím **`Cmd + →` (macOS)** hoặc **`Ctrl + →` (Windows)**.
   - **Thao tác Chuột:** Nút bấm **`[File Tiếp ▶]`** và **`[◀ File Trước]`** trên thanh công cụ luôn luôn thực hiện chuyển file bất kể đang xem ảnh hay video, đảm bảo trải nghiệm bằng chuột liền mạch 100%.

---

## 9. Đặc tả Quy chuẩn Khung hình, Tỉ lệ & Cửa sổ Hiển thị (Viewport & Scaling Standards)

Nhằm đảm bảo giao diện luôn **đẹp mắt, không méo hình, không vỡ hạt và không bị che khuất thanh công cụ**, hệ thống quy chuẩn xử lý mặc định (Default Behavior) cho 4 trường hợp kích thước media như sau:

### Nguyên tắc Bất biến:
1. **Giữ nguyên 100% Tỉ lệ Khung hình Gốc (Strict Aspect Ratio):** Tuyệt đối không bao giờ kéo giãn (stretch) làm méo hình ảnh hay video.
2. **Căn giữa Tuyệt đối (Absolute Center Alignment):** Mọi media luôn được căn giữa trục ngang và trục dọc trong vùng hiển thị (Viewport).
3. **Cửa sổ Ổn định (Stable Window Geometry):** Kích thước cửa sổ ứng dụng không tự động nhảy giật co rúm mỗi khi Next qua lại giữa ảnh ngang và ảnh dọc. Kích thước cửa sổ giữ nguyên theo lựa chọn của người dùng hoặc phiên mở trước.

---

### Bốn Trường hợp Kích thước & Quy chuẩn Hiển thị Mặc định:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MA TRẬN QUY CHUẨN HIỂN THỊ MEDIA V1                             │
├─────────────────────┬─────────────────────────────────┬────────────────────────────────┤
│ Kích thước Media    │ Khổ Ngang (Landscape - 16:9, 4:3)│ Khổ Dọc (Portrait - 9:16, 3:4) │
├─────────────────────┼─────────────────────────────────┼────────────────────────────────┤
│ 1. Size TO HƠN      │ Scale Down / Fit Window:        │ Fit Height / Pillarbox:        │
│    Cửa sổ / Màn hình│ Tự động thu nhỏ vừa khít chiều  │ Thu nhỏ vừa khít chiều cao vùng│
│    (4K, 8K, RAW...) │ ngang, không tràn viền, nhìn    │ xem, để trống nền xám đen 2 bên│
│                     │ trọn vẹn 100% không mất góc.    │ trái/phải, không cần cuộn dọc. │
├─────────────────────┼─────────────────────────────────┼────────────────────────────────┤
│ 2. Size BÉ HƠN      │ 1:1 Actual Size (Center):       │ 1:1 Actual Size (Center):      │
│    Cửa sổ / Màn hình│ Giữ nguyên kích thước gốc 100%, │ Giữ nguyên kích thước gốc 100%,│
│    (Icon, 360p...)  │ căn giữa nền tối trầm `#0f1117`,│ căn giữa, KHÔNG kéo dãn to để  │
│                     │ KHÔNG tự phóng to (Tránh vỡ hạt)│ tránh nhòe hình (Tránh blur).  │
└─────────────────────┴─────────────────────────────────┴────────────────────────────────┘
```

#### Chi tiết Quy chuẩn cho từng Case:

* **Case 1: Khổ ngang, size TO HƠN màn hình (ví dụ ảnh 4K/8K 6000x4000, video 4K mở trên màn Full HD hoặc cửa sổ 1200x800):**
  - *Hành vi mặc định:* **Fit to Window (Scale Down)**.
  - Ảnh/video tự động thu nhỏ theo tỉ lệ chuẩn sao cho cạnh dài nhất vừa chạm mép khung hiển thị. Người dùng nhìn thấy trọn vẹn 100% bố cục mà không bị che mất bất kỳ chi tiết nào.
  - Vùng hiển thị được chừa khoảng đệm an toàn (safe-area padding) phía dưới để không bị thanh Action Bar / Control Bar đè lên nội dung.

* **Case 2: Khổ ngang, size BÉ HƠN màn hình (ví dụ icon 256x256, ảnh 400x300, video 360p trên màn 2K/4K):**
  - *Hành vi mặc định:* **Hiển thị 1:1 (Actual Size 100%) tại trung tâm**.
  - **Quy tắc quan trọng: Tuyệt đối KHÔNG tự động phóng to (No Forced Upscale)**. Nếu phóng to một bức ảnh 200px ra toàn màn hình 4K, ảnh sẽ bị nhòe mờ, vỡ pixel và biến dạng hạt rất xấu.
  - Không gian xung quanh hiển thị nền màu tối trầm `#0f1117` sang trọng và tạo chiều sâu.

* **Case 3: Khổ dọc, size TO HƠN màn hình (ví dụ ảnh chụp chân dung điện thoại 1080x1920, video TikTok/Reels/Shorts):**
  - *Hành vi mặc định:* **Fit Height (Vừa khít chiều cao)**.
  - Cạnh đứng (chiều cao) tự động thu nhỏ vừa đúng chiều cao khung hiển thị (đã trừ đi Action Bar), cạnh ngang tự động co theo đúng tỉ lệ. Hai bên trái và phải hiển thị dải nền đen xám tự nhiên (Pillarbox).
  - Đảm bảo người dùng xem được trọn vẹn từ đầu đến chân bức ảnh/video dọc mà không phải kéo thanh cuộn.

* **Case 4: Khổ dọc, size BÉ HƠN màn hình (ví dụ ảnh screenshot điện thoại cũ 360x640):**
  - *Hành vi mặc định:* **Hiển thị 1:1 (Actual Size) ở chính giữa**. Không upscale cưỡng bức để giữ nguyên độ sắc nét nguyên bản của tệp.

### Triển khai Kỹ thuật trên CSS / React:
```css
/* Container vùng hiển thị */
.media-viewport {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0f1117;
}

/* Phần tử Image / Video: Vừa khít nếu to, giữ nguyên 1:1 nếu bé */
.media-content {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* Đảm bảo không méo hình, không tràn viền */
  margin: auto;
}
```

---

## 10. Đặc tả Chi tiết: Khổ Dọc Hẹp, Cơ chế HUD Floating & Responsive Mini PiP Mode

Phần này quy định chi tiết 4 trường hợp đặc thù về hành vi hiển thị và layout nhằm đảm bảo trải nghiệm người dùng luôn mượt mà, không giật lag và không bị vỡ giao diện ở mọi kích thước cửa sổ.

### 10.1. Case Media Khổ Dọc có Chiều Rộng Bé Hơn Cụm Tính Năng

**Vấn đề:** Khi mở ảnh/video dọc (ví dụ tỉ lệ 9:16 như Reels/TikTok hoặc ảnh chân dung), chiều rộng thực tế của video có thể chỉ đạt 320px - 420px, trong khi cụm Control Bar / Action Bar đầy đủ cần tối thiểu 620px - 700px để hiển thị các nút bấm.

**Quy chuẩn thiết kế:**
1. **Neo vào Cửa sổ (Window-docked), KHÔNG neo vào Media Element:**
   - Cụm Control Bar / Action Bar được định vị neo theo **Cửa sổ ứng dụng (Application Window)** chứ KHÔNG bám theo kích thước của thẻ `<video>` hay `<img>`.
   - Cửa sổ ứng dụng hỗ trợ co giãn linh hoạt xuống tới kích thước Mini PiP (`min-width: 280px; min-height: 180px`). Khi ở chế độ thông thường (`width ≥ 500px`), thanh Control Bar hiển thị đầy đủ; khi người dùng thu nhỏ cửa sổ dưới 500px, giao diện tự động chuyển đổi sang Chế độ Mini PiP (xem Mục 10.4).
2. **Căn giữa và Dải đệm hai bên (Pillarbox):**
   - Video/Ảnh khổ dọc đứng gọn gàng ở chính giữa màn hình.
   - Hai khoảng trống hai bên hiển thị nền tối trầm `#0f1117`.
   - Thanh Control Bar dạng kính mờ (Glassmorphism) nằm nổi ngang ở đáy cửa sổ, căn giữa theo chiều rộng cửa sổ (`max-width: 760px; width: calc(100% - 32px)`). Nhờ đó, các nút bấm không bao giờ bị bóp méo, co rúm hay tràn viền bất kể video dọc có hẹp đến đâu.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [●][▲][▼] media_tool                   [📌 Ghim] [👁️ Ẩn HUD] [📑 DS]│
│                                                                        │
│   Khoảng đệm        ┌──────────────────────┐        Khoảng đệm         │
│   nền tối đen       │                      │        nền tối đen        │
│   (Pillarbox)       │      VIDEO DỌC       │        (Pillarbox)        │
│                     │       (9 : 16)       │                           │
│                     │                      │                           │
│                     │                      │                           │
│  ┌──────────────────┴──────────────────────┴────────────────────────┐  │
│  │ 00:15 ──────●────────────────────────────────────────────── 00:58│  │ ◄─ Timeline
│  │ [▶/⏸] [<<] [<] [>] [>>]  [🔀] [🔁 All]  [A] [B] [🔁 AB] │ [🔊 80%] │  │ ◄─ Hàng 1: Trái (Controls) │ Phải (Volume)
│  │ [◀ File Trước] [File Tiếp ▶] │ 🏷️ reel.mp4 [5/120] │ [☆ Mark] [⛶]│  │ ◄─ Hàng 2: Trái (Nav) │ Giữa (Info) │ Phải (Mark/⛶)
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 10.2. Định nghĩa Toàn diện về Ẩn / Hiện HUD (Áp dụng Đồng nhất cho Cả Viewer & Player)

**Vấn đề:** Nhiều ứng dụng chỉ ẩn thanh timeline mà quên mất thanh điều hướng hoặc thanh trạng thái, gây mất tập trung. Cần định nghĩa rạch ròi các thành phần cấu thành HUD.

**Quy chuẩn Thành phần thuộc HUD:**
HUD (Heads-Up Display) là **toàn bộ lớp giao diện điều khiển phủ lên trên nội dung media**. Khi thực hiện thao tác **Ẩn HUD** (nhấn phím tắt `H`, click nút `[👁️ Ẩn HUD]` trên Window Bar, hoặc tự động ẩn sau 2 giây người dùng không di chuột), **toàn bộ các thành phần sau sẽ mờ dần (Fade Out 250ms) và biến mất 100%**:
1. **Window Bar:** Thanh tiêu đề phía trên cùng (bao gồm cả nút Ghim, Danh sách, Ẩn HUD).
2. **Control Bar / Action Bar:** 
   - Với **Player:** Ẩn toàn bộ Timeline, Hàng 1 (Tua, Play, Shuffle, Loop File, Loop AB) và Hàng 2 (Chuyển File, Mark, Copy, Cut, Fullscreen).
   - Với **Viewer:** Ẩn toàn bộ Bottom Action Bar (Chuyển File, Mark, Copy, Cut, Fullscreen).
3. **Footer Đáy:** Ẩn dòng thông tin Tên tệp và Bộ đếm số thứ tự `[ 14 / 120 ]`.
4. **Toast Feedback:** Nếu đang hiển thị cũng tự động mờ ẩn.
5. **Con trỏ chuột (Mouse Cursor):** Chỉ trong fullscreen, chuyển thành `cursor: none` khi HUD ẩn để không chắn tầm nhìn.

**Kích hoạt Hiện HUD trở lại:**
- Chỉ cần người dùng **di chuyển chuột** trong phạm vi cửa sổ, hoặc **nhấn phím bất kỳ** (như `Space`, `H`, mũi tên), hoặc click chuột, toàn bộ HUD sẽ lập tức mờ hiện trở lại (`opacity: 1`, transition `150ms ease-out`).
- Khi chuột dừng di chuyển quá 2 giây, HUD lại tự động mờ ẩn.

---

### 10.3. Cơ chế Nổi Độc lập (Floating Overlay) — Không Đẩy / Không Co Giật Video

**Vấn đề:** Nếu thanh HUD nằm theo luồng tài liệu thông thường (Document Flow) dạng Block/Flex, mỗi khi HUD hiện ra hay ẩn đi sẽ khiến khung video bị co lại hoặc dãn ra đột ngột (Layout Shift), gây hiện tượng giật hình, méo khung hình hoặc chớp nháy rất khó chịu.

**Giải pháp Kỹ thuật: Floating Overlay (Lớp phủ bán trong suốt):**
1. **Viewport Media chiếm 100% cố định:**
   - Khung chứa Video/Ảnh luôn chiếm trọn **100% chiều rộng và 100% chiều cao** của cửa sổ (`width: 100%; height: 100%; position: absolute; inset: 0; z-index: 1`).
   - Kích thước hiển thị của video được tính toán cố định dựa trên kích thước cửa sổ hiện tại, **hoàn toàn độc lập** với trạng thái ẩn hay hiện của HUD.
2. **HUD là Lớp Nổi Lơ Lửng (z-index: 10):**
   - Window Bar: `position: absolute; top: 0; left: 0; width: 100%;` với nền dốc mờ đen nhẹ `linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)`.
   - Control Bar: `position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);` sử dụng phong cách Glassmorphism (`background: rgba(22, 27, 34, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;`).
   - Footer: `position: absolute; bottom: 8px; left: 0; width: 100%;`.
3. **Kết luận Trực quan:**
   - **Khi HUD hiện:** HUD chỉ nhẹ nhàng phủ lên phía trên mép dưới của video dưới dạng kính mờ xuyên thấu, **tuyệt đối KHÔNG đẩy video bé lại**.
   - **Khi HUD ẩn:** HUD mờ dần biến mất, video đã và đang hiển thị ở kích thước tối ưu nhất từ trước, **không gian không bị kéo giật hay thay đổi kích thước đột ngột**. Trải nghiệm xem liền mạch 100%.

---

### 10.4. Cơ chế Responsive Mini PiP Mode & Logic Điều khiển HUD Độc lập

Hệ thống sử dụng Window Resize Listener để tự động chuyển sang **Chế độ Mini PiP** khi kích thước cửa sổ rơi vào ngưỡng:
* **Ngưỡng Breakpoint Mini:** Chiều rộng `width < 500px` HOẶC chiều cao `height < 320px`.

```text
┌─────────────────────────────────────────────────────────┐
│ [📌]                                                [✕] │ ◄─ WindowBar Mini (Ẩn Traffic Lights/Decorations)
│                                                         │
│                                                         │
│                     VIDEO / ẢNH CONTENT                 │
│                                                         │
│                                                         │
│          ┌───────────────────────────────────┐          │
│          │  [◀]        [ ▶ / ⏸ ]        [▶]  │          │ ◄─ Frosted Pill siêu gọn (Player: có nút Play/Pause)
│          │  [◀]      [ 11 / 13 ]        [▶]  │          │ ◄─ Frosted Pill siêu gọn (Viewer: có số thứ tự trang)
│          └───────────────────────────────────┘          │    (Đồng kích thước & vị trí bottom-3, tự ẩn khi idle)
├─────────────────────────────────────────────────────────┤
│═════════════════════════●═══════════════════════════════│ ◄─ Timeline Hairline siêu mảnh (2px, sát mép đáy)
└─────────────────────────────────────────────────────────┘
```

**Chi tiết Đặc tả trong Chế độ Mini PiP & HUD Logic (Chuẩn hóa Cross-Platform macOS & Windows):**

1. **Giao diện Đồng nhất Dạng Viên thuốc (Frosted Pill Controls):**
   - Đặt sát đáy cửa sổ (`bottom-3`), căn giữa ngang với kích thước siêu nhỏ gọn: `px-2.5 py-1 rounded-full`, viền kính mờ `bg-black/55 backdrop-blur-md border border-white/15 shadow-2xl`.
   - **Đối với Ảnh (Viewer):** Gồm 2 nút chuyển file `[◀]` và `[▶]` kèm chỉ số trang `[ X / Y ]` ở giữa.
   - **Đối với Video/Audio (Player):** Giữ nguyên kích thước và thiết kế giống hệt Viewer, chỉ thay phần chỉ số ở giữa bằng nút `[ ▶ / ⏸ ]` màu Cyan nổi bật.
   - Toàn bộ pill tự động ẩn mượt mà khi người dùng không di chuột (idle).

2. **Timeline Hairline Siêu Mảnh (2px Progress Line ở mép đáy):**
   - Chạy dọc tràn viền sát đáy cửa sổ (`bottom-0 left-0 right-0`), không nằm trong khối card để không che khuất bất kỳ chi tiết hay phụ đề video nào.
   - Độ dày hairline chỉ `2px` (nở nhẹ lên `4px` khi hover chuột), vệt sáng Cyan hiển thị chính xác tiến độ phát, hỗ trợ click hoặc kéo tua trực tiếp.

3. **Ẩn Toàn bộ 3 Nút System / Window Decorations (macOS & Windows):**
   - Khi co cửa sổ về Mini PiP, ứng dụng gọi `setDecorations(false)` làm ẩn hoàn toàn 3 nút đỏ/vàng/xanh trên macOS cũng như titlebar trên Windows, trả lại 100% diện tích viền kính cho video/ảnh.
   - Thanh tiêu đề mini chuyển sang lề gọn `px-2`, cung cấp nút Ghim `[📌]` và nút Đóng `[✕]` tinh tế ở góc trên bên phải khi rê chuột.
   - Khi kéo to cửa sổ trở lại (`≥ 500px`), `setDecorations(true)` tự động phục hồi decorations và 3 nút system.

4. **Logic Điều khiển HUD Độc lập & Chống Choán Mắt:**
   - **Khi Cài đặt "Tự động ẩn sau X giây" (`delay > 0` hoặc Mini PiP):** Cơ chế tự động làm chủ. Di chuột hiện HUD, sau X giây tự ẩn. Nút manual HUD trên WindowBar được làm mờ (`opacity-30 cursor-not-allowed`) với tooltip giải thích để tránh xung đột thao tác.
   - **Ở cửa sổ thường, khi Cài đặt "Không bao giờ tự ẩn" (`delay = 0`):** Nút manual HUD (và phím tắt `H`, chuột phải context menu) hoạt động toàn quyền. Khi người dùng click ẩn thủ công, hệ thống khóa trạng thái `manualHudHidden = true`: **di chuột hay click chuột tuyệt đối KHÔNG làm hiện lại HUD**. Chỉ hiện lại khi bấm lại phím `H` hoặc click chuột phải chọn *"Ẩn / Hiện HUD"*.
   - **Con trỏ chuột:** Cửa sổ thường luôn giữ con trỏ hiển thị. Fullscreen ẩn con trỏ cùng HUD khi idle 2 giây; di chuột hiện lại cả hai. Khi Settings/context menu mở luôn hiện con trỏ.

5. **Phím tắt Toàn năng Hoạt động 100%:**
   - Dù các nút mở rộng bị ẩn trên Mini PiP, toàn bộ phím tắt (`M` đánh dấu, `Cmd+C` copy, `[` / `]` loop A-B, số `0`–`9` nhảy mốc timeline, `Space` play/pause) vẫn hoạt động hoàn hảo.

---

## 11. Wireframe Menu Chuột Phải (Context Menu khi Click vào Vùng Ảnh/Video)

Khi người dùng click chuột phải vào vùng hiển thị ảnh hoặc video, một menu ngữ cảnh tối giản, dạng kính mờ (Glassmorphism Dark) nổi lên ngay tại vị trí con trỏ chuột, cho phép thao tác nhanh các tính năng cốt lõi mà không cần di chuyển chuột xuống thanh điều khiển.

```text
┌───────────────────────────────────────────────┐
│ 📋 Sao chép tệp này             Cmd + C       │ ◄─ Thao tác tệp nhanh
│ ⭐ Đánh dấu tệp này             M             │
│ 📦 Sao chép các tệp đã đánh (3) Cmd + Shift + C│
│ ✂️ Cắt các tệp đã đánh dấu (3)  Cmd + Shift + X│
├───────────────────────────────────────────────┤
│ ▶ Phát / Tạm dừng               Space         │ ◄─ Nhóm phát (chỉ có trên Video/Audio)
│ 🔀 Trộn ngẫu nhiên (Shuffle)    S             │
│ 🔁 Lặp tệp (Tắt / 1 / DS)       L             │
│ [A] Đặt điểm lặp đầu A          [             │
│ [B] Đặt điểm lặp cuối B         ]             │
│ 🔁 Bật/Tắt Lặp đoạn A-B         \             │
│ 🔊 Âm lượng: 80% (↑ / ↓)        Shift + M     │
│ ⚡ Tốc độ phát                  1.0x    ▶     │
├───────────────────────────────────────────────┤
│ 🔄 Xoay 90° sang phải           R             │ ◄─ Nhóm ảnh (chỉ có trên Viewer)
│ ↔ Lật ảnh nằm ngang             H-Flip        │
├───────────────────────────────────────────────┤
│ 📌 Ghim trên cùng (Pin on Top)  P             │ ◄─ Nhóm điều khiển cửa sổ
│ 👁️ Ẩn/Hiện HUD                  H             │
│ 📑 Bật/Tắt Danh sách thư mục    B             │
│ ⛶ Toàn màn hình                 F11 / F       │
├───────────────────────────────────────────────┤
│ 📁 Hiển thị trong Finder...     Cmd + Reveal  │
├───────────────────────────────────────────────┤
│ ⚙️ Cài đặt...                   Cmd + ,       │
└───────────────────────────────────────────────┘
```

* **Quy tắc hiển thị:**
  - Menu tự động nhận diện loại tệp hiện tại: Nếu đang mở ảnh thì ẩn nhóm điều khiển Playback/Loop/Volume và hiện nhóm Xoay/Lật ảnh; nếu đang mở video/audio thì hiện đầy đủ nhóm Playback.
  - Tự động kiểm tra mép màn hình: Nếu vị trí click chuột sát cạnh phải hoặc cạnh dưới cửa sổ, menu tự động đảo chiều hiển thị sang trái/lên trên để không bị che khuất.

---

## 12. Wireframe Hộp thoại Cài đặt (Settings Modal — `Cmd/Ctrl + ,`)

Khi bấm `[⚙️ Cài đặt]` trên Menu chuột phải hoặc nhấn tổ hợp phím kinh điển **`Cmd + ,`** (trên macOS) / **`Ctrl + ,`** (trên Windows), một popup kính mờ hiện đại nổi ở giữa màn hình.

> **Lưu ý cốt lõi:** Hành vi **bấm nút đỏ [X] là tắt sạch ứng dụng ngay lập tức** là quy tắc mặc định cứng (Hardcoded Rule) của `media_tool`, không đưa tùy chọn này vào cài đặt để tránh người dùng vô tình tắt nhầm và để lại ứng dụng chạy ngầm trên thanh Dock gây tốn pin và RAM.

```text
┌────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Cài đặt VXMedia                                                [✕] │
├─────────────────────────┬──────────────────────────────────────────────┤
│ 🔘 Chung                │ GIAO DIỆN & MÀU SẮC                          │
│ 🪟 Cửa sổ & HUD         │ [● Thích ứng hệ thống] [○ Tối]               │
│ ▶ Phát Media            │ [○ Sáng]               [○ Đen tuyền (OLED)]  │
│ ⌨️ Phím tắt             │                                              │
│ ─────────────────────── │ ───────────────────────────────────────────  │
│ 🔄 Cập nhật             │ NGÔN NGỮ HIỂN THỊ                            │
│ ℹ️ Giới thiệu           │ [● Tiếng Việt]  [○ English]                  │
│ ☕ Ủng hộ tác giả       │                                              │
├─────────────────────────┴──────────────────────────────────────────────┤
│ [ Khôi phục mặc định ]                                        [ Đóng ] │
└────────────────────────────────────────────────────────────────────────┘
```

### Nội dung các Tab Cài đặt (Tuân thủ `settings_standards.md` & `bilingual_standards.md`):
1. **Tab 1 — Chung (`General` — Ranh giới nghiêm ngặt ST-02):**
   - **Chỉ chứa đúng 2 nhóm cài đặt theo thứ tự:**
     1. **Giao diện & Màu sắc (`Theme & Colors`):** 4 thẻ lựa chọn theo đúng thứ tự: **Thích ứng hệ thống (`System Adaptive`)** → **Tối (`Dark Slate`)** → **Sáng (`Light Clean`)** → **Đen tuyền (OLED) (`Pure Black (OLED)`)** (không hiển thị mã HEX kỹ thuật trong nhãn người dùng).
     2. **Ngôn ngữ hiển thị (`Display Language`):** 2 nút radio endonym chuẩn **Tiếng Việt** (`vi`) và **English** (`en`), không dùng emoji cờ quốc gia, đổi ngôn ngữ tức thời không cần khởi động lại.
2. **Tab 2 — Cửa sổ & HUD (`Window & HUD`):**
   - **Single Instance:** Luôn mở tệp mới trong cùng cửa sổ chính.
   - **Tự động ghim (Pin on top):** Tự động bật chế độ Always-on-Top khi mở.
   - **Thời gian tự động ẩn thanh điều khiển (HUD):** Tùy chọn 1s, 2s, 3s hoặc Không tự động ẩn.
3. **Tab 3 — Phát Media (`Media Playback`):**
   - **Tỷ lệ hiển thị Media (Media Scaling):** Vừa cửa sổ / Màn hình (`scale_to_fit`) hoặc Theo kích thước gốc (`limit_file_size`).
   - **Bước nhảy tua ngắn / dài:** 1s–3s / 5s–10s.
   - **Độ mượt Crossfade khi Lặp A-B:** Slider từ 0ms đến 100ms (mặc định: 45ms).
   - **Chế độ Lặp Tệp Mặc định:** Không lặp / Lặp 1 bài / Lặp tất cả.
   - **Tự động phát tệp tiếp theo:** Bật / Tắt.
4. **Tab 4 — Phím tắt (`Hotkeys`):**
   - Bảng tra cứu trực quan toàn bộ 18 phím tắt thao tác nhanh, được dịch đầy đủ sang cả Tiếng Việt và English.
5. **Tab 5 — Cập nhật (`Updates` — AU-01…AU-16):**
   - Dùng chung controller `useAppUpdater` với thông báo góc dưới bên phải (`bottom-5 right-5`, có CTA trực tiếp `Cập nhật & khởi động lại` / `Update & restart`).
6. **Tab 6 — Giới thiệu (`About`):**
   - Thẻ nhận diện thương hiệu VXMedia: Icon, tên app, phiên bản, tác giả **Bùi Việt Linh**, đường dẫn GitHub Repository (`https://github.com/linhbv94/VXMedia`), 2–3 câu giới thiệu và danh mục công nghệ nền tảng.
7. **Tab 7 — Ủng hộ tác giả (`Support Author`):**
   - Menu cuối cùng của sidebar với biểu tượng `Coffee` và gam màu hổ phách (amber) nổi bật.
   - Mã QR VietQR local (`src/assets/qr.png`) đặt giữa thẻ nền trắng tương phản cao, có nhãn VietQR • Napas247 và hướng dẫn quét bằng ứng dụng ngân hàng. Không hiển thị riêng thông tin chuyển khoản hoặc nút sao chép STK.

---

## 17. Đối chiếu Quy chuẩn Suite UI (Titlebar, macOS App Menu, Settings, Bilingual, Auto-Update)

- **Titlebar (`TB-01…TB-12`):** Profile `standard_32` (`height: 32px`, `padding-left: 82px`, `padding-right: 12px`). Cụm traffic lights native macOS đặt tại tâm `x = 14, 34, 54; y = 15.5` qua `sync_mac_traffic_lights`. Glyph SVG `16×16` (`strokeWidth = 2`) bắt đầu tại `x = 82`, gap `6px`, tên app `VXMedia` bắt đầu tại `x = 104` (`12px`, `font-weight: 600`, `line-height: 16px`, `letter-spacing: 0`). Khoảng cách từ cụm brand sang nhóm action đầu tiên là `12px`, khoảng cách giữa các nút action là `8px`. Nút Settings ở cuối bên phải là icon-only (`28×28`, radius `6px`, icon `16×16`, cách mép phải `12px`).
- **macOS App Menu & Native About (`AM-01…AM-14`):** Menu `VXMedia` trên menubar gồm `About VXMedia` → separator → `Settings… (⌘,)` → separator → `Services` → separator → `Hide / Hide Others / Show All` → separator → `Quit`. Native About panel hiển thị tên app, version, tác giả `Bùi Việt Linh`, mô tả ngắn và `GitHub: https://github.com/linhbv94/VXMedia`. `Settings…`, `⌘,` và nút bánh răng trên titlebar dùng chung state mở modal và giữ nguyên tab đang xem trong phiên.
- **Song ngữ (`BI-01…BI-12`):** Hỗ trợ đầy đủ `vi` và `en`, mặc định lần đầu theo ngôn ngữ hệ điều hành (`vi` → `vi`, còn lại `en`), lưu bền vững trong `localStorage`, nút Khôi phục mặc định giữ nguyên ngôn ngữ người dùng đã chọn.

---

## 13. Đặc tả Cơ chế Nút Thoát Đỏ [X] trên macOS (Quit Completely vs Dock Minimize)

### A. Bản chất Cơ chế Hệ điều hành macOS
* Trên macOS, các ứng dụng xử lý tài liệu đa cửa sổ (Document-based apps như Safari, Chrome, TextEdit, Pages) tuân theo nguyên tắc: Khi bấm nút đỏ `[X]`, hệ điều hành chỉ đóng cửa sổ đó (`NSWindow close`), nhưng tiến trình ứng dụng (`NSApplication`) vẫn chạy ngầm trên thanh Dock (có dấu chấm tròn bên dưới) để người dùng có thể bấm vào Dock mở cửa sổ mới siêu tốc mà không phải nạp lại từ đầu.
* Tuy nhiên, với các công cụ đơn cửa sổ (Single-window Utility như System Settings, Calculator, Activity Monitor, hoặc media tool chuyên dụng): Hành vi mong muốn của người dùng là **bấm [X] là phải tắt hẳn ứng dụng ngay lập tức**, xóa sổ chấm tròn trên Dock và giải phóng 100% tài nguyên CPU/RAM.

### B. Cơ chế Kỹ thuật Triển khai trong Tauri v2 & Rust
Để đạt được hành vi "Ấn X là tắt hẳn hoàn toàn", hệ thống can thiệp trực tiếp vào vòng đời của cửa sổ thông qua sự kiện `WindowEvent::CloseRequested` trong Rust backend:

```rust
// src-tauri/src/main.rs (hoặc lib.rs trong Tauri v2)
use tauri::WindowEvent;

tauri::Builder::default()
    .on_window_event(|window, event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            // Ngăn chặn hành vi chỉ đóng cửa sổ để lại tiến trình ngầm của macOS
            // Thoát sạch 100% tiến trình ứng dụng ngay lập tức
            window.app_handle().exit(0);
        }
    })
    .run(tauri::generate_context!())
    .expect("error while running media_tool");
```

**Kết quả:**
- Khi người dùng click vào nút đỏ `[X]` trên góc trái cửa sổ macOS (hoặc nút `[✕]` trên Windows):
  - Ứng dụng dọn sạch bộ đệm RAM (3 ảnh sliding window).
  - Ngắt hoàn toàn tiến trình Webview và Rust process (`exit(0)`).
  - Dấu chấm tròn trên Dock của macOS **biến mất ngay tức thì**.
  - Không có bất kỳ tiến trình chạy ngầm nào lưu lại trong Activity Monitor (Mac) hay Task Manager (Win).

---

## 14. Đặc tả Hệ thống Điều khiển Âm lượng (Volume Control & OSD Indicator)

Hệ thống điều khiển âm lượng được thiết kế tinh gọn, mượt mà và trực quan, hỗ trợ đầy đủ cả thao tác chuột, thanh trượt kéo thả, cuộn bánh xe và phím tắt.

### 14.1. Vị trí & Cấu trúc Giao diện (UI)
* **Vị trí trên Control Bar:** Đặt tại **Hàng 1, canh lề phải** (đối xứng với cụm Playback/Tua/Loop canh lề trái):
  - Hàng 1: `[▶/⏸] [<<] [<] [>] [>>]  [🔀] [🔁 All]  [A] [B] [🔁 AB]  ──►  [🔊 80% ──●──]`
  - Hàng 2: `[◀ File Trước] [File Tiếp ▶]  ──►  🏷️ filename [15/120]  ──►  [☆ Đánh dấu] [⛶]`
* **Biểu tượng Loa động (Dynamic Speaker Icon - Lucide SVG):** Tự động đổi hình thái theo mức âm lượng hiện tại:
  - `0%`: `🔇 VolumeX` (Đang tắt tiếng / Mute).
  - `1% - 33%`: `🔈 Volume1` (Mức nhỏ).
  - `34% - 66%`: `🔉 Volume2` (Mức vừa).
  - `67% - 100%`: `🔊 Volume` (Mức to).
* **Thanh trượt Mini Slider:**
  - Chiều rộng cố định 64px, rãnh trượt mỏng 3px, nút kéo tròn (thumb) đường kính 10px.
  - Khi rê chuột vào (hover), thanh trượt sáng lên màu xanh Cyan hoặc Emerald sang trọng.
* **Bật / Tắt tiếng Nhanh (Mute Toggle):**
  - Click chuột trực tiếp vào icon Loa: Tắt tiếng ngay lập tức (Volume = 0%).
  - Click lại vào icon Loa: Khôi phục lại mức âm lượng trước khi tắt tiếng (ví dụ 80%).

### 14.2. Thao tác Phím tắt & Cuộn Chuột / Trackpad
1. **Phím Mũi tên (Arrow Keys):**
   - Nhấn phím `↑` (Mũi tên Lên): Tăng âm lượng thêm **5%** (giới hạn tối đa 100%).
   - Nhấn phím `↓` (Mũi tên Xuống): Giảm âm lượng bớt **5%** (giới hạn tối thiểu 0%).
2. **Phím tắt Mute:** Phím **`Shift + M`** (hoặc phím số **`0`**) trên cả macOS và Windows để bật/tắt tiếng nhanh mà không bị xung đột với phím `M` (dành cho tính năng Đánh dấu tệp) và tránh xung đột với phím `Cmd + M` (phím tắt mặc định thu nhỏ cửa sổ của macOS).
3. **Cuộn Chuột / Trackpad Cực Tiện:**
   - Khi con trỏ chuột rê vào vùng hiển thị video hoặc rê lên cụm thanh âm lượng: Người dùng chỉ cần **cuộn con lăn chuột lên/xuống** (hoặc vuốt 2 ngón tay trên Trackpad) để tăng/giảm âm lượng một cách tự nhiên.

### 14.3. Huy hiệu Âm lượng Nổi (Volume OSD Badge - On-Screen Display)
Khi người dùng điều chỉnh âm lượng qua phím tắt hoặc cuộn chuột, một huy hiệu bán trong suốt sẽ xuất hiện tức thì ở chính giữa màn hình video để phản hồi trực quan mà người dùng không cần nhìn xuống thanh công cụ:

```text
┌───────────────────────────────────────┐
│     🔊   85%                          │
│     [██████████████████░░░░]          │
└───────────────────────────────────────┘
```

* **Đặc tính OSD:**
  - Nền đen mờ kính (`rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px)`), viền bo góc tròn 12px.
  - Hiển thị thanh tiến trình trực quan kèm số % chính xác.
  - Tự động mờ dần và biến mất sau **1 giây** không có thêm thao tác chỉnh âm lượng.

### 14.4. Cơ chế Ghi nhớ Mức Âm lượng (Volume Persistence)
* Mức âm lượng được lưu tự động vào `localStorage` của Webview (`media_tool_volume`).
* Khi chuyển sang video/audio tiếp theo trong folder, hoặc khi tắt app đi mở lại, mức âm lượng được giữ nguyên vẹn như lần nghe gần nhất, tránh tình trạng bị giật mình vì âm lượng bị reset về 100% to đột ngột.

---

## 15. Quy chuẩn Thiết kế Giao diện Sáng Dịu (Light Clean Mode UI/UX Standards)

Nhằm đảm bảo trải nghiệm thị giác cao cấp và độ tương phản tuyệt đối (WCAG AAA) khi người dùng sử dụng chế độ Sáng hoặc khi hệ điều hành chuyển sang Light Mode:

### 15.1. Bảng màu & Design Tokens cho Chế độ Sáng (Light Theme Tokens)
* **Nền chính (App Background):** `#f8fafc` (Slate 50 — dịu mắt, chống chói lóa so với `#ffffff` gắt).
* **Bảng điều khiển & Hộp thoại (Glass Dropdown & Modal):**
  - Nền Modal & Dropdown: `#ffffff` với viền `border: 1px solid #e2e8f0`.
  - Nền Header & Footer: `#f8fafc` (Slate 50) với đường phân cách `border-slate-200`.
  - Nền Sidebar danh mục tab: `#f1f5f9` (Slate 100) tạo chiều sâu không gian (Z-index layering).
* **Hệ thống Phông chữ & Độ Tương Phản (Typography Contrast):**
  - **Tiêu đề chính & Tiêu đề Modal:** `#0f172a` (Slate 900, độ đậm Semi-bold / Bold).
  - **Nội dung nhãn (Checkbox, Radio, Tên tệp):** `#1e293b` (Slate 800) — tương phản sắc nét trên nền trắng.
  - **Văn bản giải thích phụ:** `#475569` (Slate 600) — dễ đọc, không bị mờ nhạt.
  - **Tiêu đề phân khu (Section Headers):** `#0369a1` (Cyan 700) — điểm nhấn thương hiệu nhận diện rõ rệt.

### 15.2. Thẻ Lựa Chọn Theme & Điều Khiển (Selectable Cards & Inputs)
* **Thẻ Theme khi ĐƯỢC CHỌN:** Nền xanh nhẹ `bg-cyan-50/80`, viền xanh đậm `border-cyan-500`, chữ `text-cyan-900`, hiệu ứng đổ bóng nhẹ `shadow-xs ring-1 ring-cyan-500/30`.
* **Thẻ Theme khi CHƯA CHỌN:** Nền trắng `bg-white`, viền mảnh `border-slate-200`, chữ `text-slate-700`, hiệu ứng rê chuột `hover:border-slate-300 hover:bg-slate-50`.
* **Trường nhập liệu & Select Dropdown:** Nền trắng `#ffffff`, viền `#cbd5e1`, chữ `#0f172a`, bóng đổ nhẹ `shadow-2xs`.
* **Phím tắt (Hotkey Badges):** Huy hiệu phím chữ nổi với nền trắng, viền mảnh `#e2e8f0`, chữ monospace xanh đậm `#0e7490`.

### 15.3. Thanh Điều Khiển HUD trên Nền Sáng (Player & Viewer Control Bar)
* **Kính mờ HUD (Glass Panel):** `background: rgba(255, 255, 255, 0.92)`, đổ bóng `box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08)`.
* **Biểu tượng & Nút bấm:** Màu `text-slate-700`, khi rê chuột chuyển sang `text-slate-950` kèm nền hover `bg-black/5`.
* **Huy hiệu thông tin tệp (File Info Badge):** Tên tệp hiển thị chữ Slate 800 đậm nét; số thứ tự tệp đặt trong khung bo tròn viền xám sáng `border-slate-200 text-slate-600 bg-slate-100`.





## 16. Thanh phát nền cho video/audio (2026-10-09)

- Khi xem ảnh/PDF trong lúc video hoặc audio được nạp, hiện thanh phát nền của nguồn vừa nghe: tên file, tiến độ, Play/Pause, file kế tiếp và nút trở lại nguồn.
- Nguồn video dùng icon Film, nút “Mở tab video”; nguồn audio dùng icon Music. Nút trở lại chọn đúng file đang phát kể cả thư mục nguồn đang hiển thị ảnh bìa.
- Trở lại player giữ nguyên phần tử media, nguồn, tiến độ và mốc A–B; nguồn đã tạm dừng không tự phát lại. Player ẩn không nhận phím tắt của viewport ảnh.
- Token chrome/Settings không đổi: một hàng 32px, font system 12px/600, icon 16px/gap 6px. Đợt 1.2.4 gồm cả bản sửa phát nền và Support QR căn giữa, bỏ nút Copy STK.

### Fullscreen native và HUD (2026-10-09)
- App desktop dùng fullscreen native Tauri; DOM Fullscreen API chỉ phục vụ browser preview. F/F11 hoặc nút fullscreen bật/tắt; Escape thoát khi không có Settings/context menu cần đóng trước. Trạng thái cũng đồng bộ từ resize native (gồm thao tác OS).
- Vào fullscreen ẩn HUD ngay, bất kể setting hoặc trạng thái ẩn thủ công của cửa sổ thường. Di chuột/click hiện HUD; sau 2 giây không tương tác ẩn lại, giữ HUD khi Settings/context menu đang mở. Thoát fullscreen khôi phục logic setting và trạng thái ẩn thủ công trước đó.
- Fullscreen có nút Close trong HUD trên cả macOS/Windows để đóng trực tiếp; không render cụm minimize/maximize; cửa sổ thường giữ một cụm controls, decorations luôn false. Dải kéo cửa sổ không bắt chuột trong fullscreen.
- Video `scale_to_fit` lấy kích thước viewport hiện tại, không lưu kích thước resize cũ; `limit_file_size` vẫn giới hạn độ phân giải gốc. Không remount video khi đổi fullscreen.
- Ở cửa sổ thường với chế độ luôn hiện HUD: sau 2 giây không tương tác, Window Bar và các thanh HUD còn 40% opacity; di chuột/click/phím/scroll khôi phục 100%. Không làm mờ media/Settings/context menu. Ẩn thủ công, Mini PiP và fullscreen giữ logic riêng.


## Feedback20261029 — Settings component dùng chung

- Căn cứ: [feedback user](../../../_summary/feedback.md) và [Settings contract](../../../_summary/standard_docs/settings_standards.md). Title VXabc Settings không icon; commonvisual/copy lấy VXMedia.
- Source dùng lại: [canonical React](../../../_summary/standard_codes/settings_ui/settings_ui.tsx), vendorlocal `src/components/shared/settings_ui.tsx` + CSS + SHAmanifest (Clean ở desktop/src); không runtimeimport sibling.
- Windowapp dùng shell672×560, header/footer56/sidebar192/body24; maxheight theo viewport. General chỉ2sectionTheme→Language, chỉcapability thật. Updates/About/Support dùngcomponent; version/repo/description/icon/QR làmetadata riêng, tabnghiệpvụ vàconfig/updaterguards giữadapter hiệncó.
- Nghiệmthu riêng: commoncopy/geometry vi-en, theme/localeapply+readback, radio/tabkeyboard/focustrap/Escape, body cuộn/footerkhôngche; native/Windows/packaged/E2E phải ghi evidence, build/hashPASSkhông tựđạt. About native thamchiếuSearch, khác AboutSettings.

## Cập nhật Feedback 2026-10-29 (Anti UI)
- Titlebar Windows: Hiển thị SVG PlaySquare + tên app 'VXMedia' bên trái cạnh menu File/Edit/View/Tools/Help; cụm system min/max/close bên phải sau nút Settings gear.



### About native — đính chính 2026-10-30
Theo hợp đồng menu/About root: PNG trong suốt512×512 riêng app (không Dock squircle/default32), layout AppKit theo Search. Credits: Bùi Việt Linh → mô tả vi/en → GitHub URL; footer © 2026 Bùi Việt Linh. All rights reserved. Giữ version thật, không lặp build version. Cần QA bundle/native mới; không coi cargo check là visual PASS.
