# Demo Presentation & DoD Playbook: Media Tool (`_spec6_demo_presentation`)

> **Phiên bản:** 1.1.0
> **Ngày cập nhật:** 2026-10-09
> **Phân loại đặc tả:** Kịch bản Trình diễn Nghiệm thu (Demo Script) & Thiết lập Bộ Dữ liệu Thử nghiệm  
> **Tài liệu tham chiếu:** [00_system_overview.md](00_system_overview.md), [05_qa_acceptance.md](05_qa_acceptance.md)  

---

## 1. Thiết lập Bộ Dữ liệu Thử nghiệm Chuẩn (Test Fixtures Directory)

Trước khi thực hiện buổi trình diễn nghiệm thu Definition of Done (DoD), Dev Agent cần chuẩn bị sẵn thư mục `fixtures/` với cấu trúc sau:

```text
fixtures/
├── images/
│   ├── 01_morning.jpg          (Ảnh phong cảnh 1920x1080)
│   ├── 02_architecture.png     (Ảnh đồ họa trong suốt)
│   ├── 03_motion.gif           (Ảnh động GIF)
│   ├── 10_city_night.webp      (Kiểm tra Natural Sort: 10 đứng sau 03)
│   └── corrupted_sample.jpg    (File rỗng hoặc byte lỗi để test fallback)
├── videos/
│   ├── demo_action_60s.mp4     (Video 60 giây có âm thanh sống động)
│   └── short_clip_10s.webm     (Video ngắn để kiểm tra tua mốc nhỏ)
└── audios/
    ├── with_id3_album_art.mp3  (Bài hát đầy đủ Title, Artist, Album và Artwork JPEG)
    ├── acoustic_guitar.wav     (File âm thanh chất lượng cao)
    └── no_metadata_sample.flac (File FLAC không gắn thẻ để kiểm tra fallback)
```

---

## 2. Kịch bản Trình diễn Nghiệm thu (Three-Act Demo Script)

Buổi trình diễn được chia làm 3 màn liên hoàn, tái hiện 100% trải nghiệm thực tế của Owner:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   KỊCH BẢN TRÌNH DIỄN 3 HỒI (3 ACTS)                   │
├───────────────────┬────────────────────────────┬───────────────────────┤
│ Màn 1: Trình duyệt│ Màn 2: Trình phát Video    │ Màn 3: Thưởng thức Âm │
│ Ảnh Siêu tốc      │ & Tua Phím tắt Chính xác   │ nhạc & Vòng lặp Êm ái │
│ (Viewer Showcase) │ (Video Precision Player)   │ (Audio & Adaptive)    │
└───────────────────┴────────────────────────────┴───────────────────────┘
```

---

### Màn 1: Trình duyệt Ảnh & Gom File Tức thì (Viewer Showcase)
* **Thời lượng dự kiến:** 60 giây.
* **Mục tiêu:** Chứng minh tốc độ mở ảnh, điều hướng mượt mà, phân loại tự nhiên và tính năng sao chép file thật sang Finder / Explorer.

| Bước | Thao tác của Người Demo | Phản hồi Trực quan trên Ứng dụng | Tiêu chuẩn Nghiệm thu |
| :---: | :--- | :--- | :--- |
| **1.1** | Click đúp file `fixtures/images/01_morning.jpg`. | Ứng dụng mở lập tức dưới 1 giây. Ảnh hiển thị sắc nét căn giữa. HUD báo `[ 1 / 5 ]` (gồm 4 ảnh hợp lệ và 1 file corrupted test). | Không màn hình trắng, không giật lag. |
| **1.2** | Nhấn liên tục phím `Mũi tên Phải`. | Ảnh chuyển ngay lập tức: `01` → `02` → `03` → `10` (Kiểm chứng Natural Sort thành công). | Thứ tự chuẩn xác, ảnh kế tiếp đã được nạp sẵn. |
| **1.3** | Tại ảnh `02` và `10`, nhấn phím `M`. | Badge `⭐ [MARKED]` sáng màu cam trên cả 2 ảnh. HUD góc phải tăng lên `Marked: 2`. | Trạng thái mark trực quan, không nhấp nháy màn hình. |
| **1.4** | Nhấn tổ hợp phím `Ctrl+C` (Win) hoặc `Cmd+C` (Mac). | Toast thông báo xuất hiện ở đáy: *"✓ Đã sao chép 2 tệp vào Clipboard"*. | Toast tự mờ sau 2 giây. |
| **1.5** | Mở một folder trống trên Desktop, nhấn `Ctrl/Cmd + V`. | 2 tệp ảnh vật lý `02_architecture.png` và `10_city_night.webp` được dán thật vào folder. | Đây là tệp vật lý, không phải đường dẫn text. |

---

### Màn 2: Trình phát Video & Tua Dòng thời gian Chính xác (Video Player)
* **Thời lượng dự kiến:** 90 giây.
* **Mục tiêu:** Chứng minh trải nghiệm xem video tối giản, các phím tắt tua dòng thời gian và thiết lập vòng lặp A–B phân đoạn.

| Bước | Thao tác của Người Demo | Phản hồi Trực quan trên Ứng dụng | Tiêu chuẩn Nghiệm thu |
| :---: | :--- | :--- | :--- |
| **2.1** | Mở file `fixtures/videos/demo_action_60s.mp4`. | Video tự động phát, khung hình full trọn vẹn, không có thanh công cụ cồng kềnh. | Khung hình mượt 60fps, âm thanh đồng bộ. |
| **2.2** | Nhấn phím `Space`. | Video dừng lại mượt mà (Pause). Nhấn `Space` lần nữa, video phát tiếp (Play). | Phản hồi tức thì, không có độ trễ phím. |
| **2.3** | Nhấn lần lượt các phím số `3`, `5`, `8`. | Con trỏ nhảy ngay đến giây thứ 18 (30%), 30 (50%), 48 (80%). | Tua chính xác tuyệt đối theo tỉ lệ. |
| **2.4** | Nhấn phím `Mũi tên Trái` và `Shift + Mũi tên Phải`. | Tua lùi chính xác 1 giây; sau đó nhảy tới 5 giây. | Boundary clamping hoạt động: không bị âm thời gian. |
| **2.5** | Tại giây thứ 10, nhấn phím `[`; tại giây 15, nhấn phím `]`. | Mốc `A (10s)` và mốc `B (15s)` xuất hiện trên thanh timeline. Vùng giữa đổi màu sáng. | Nhãn hiển thị `A-B Loop: BẬT`. |
| **2.6** | Để video chạy qua giây thứ 15. | Ngay khi chạm giây 15, video lập tức quay về phát từ giây 10 liên tục. | Vòng lặp chạy trơn tru, không dừng giật. |

---

### Màn 3: Trải nghiệm Âm nhạc & Vòng lặp Fade Thích ứng (Audio Player)
* **Thời lượng dự kiến:** 90 giây.
* **Mục tiêu:** Chứng minh khả năng hiển thị metadata, ảnh bìa đĩa thanh lịch và tai nghe cảm nhận thuật toán Adaptive Fade êm ái.

| Bước | Thao tác của Người Demo | Phản hồi Trực quan trên Ứng dụng | Tiêu chuẩn Nghiệm thu |
| :---: | :--- | :--- | :--- |
| **3.1** | Mở file `fixtures/audios/with_id3_album_art.mp3`. | Giao diện Card âm nhạc xuất hiện: Bìa album sắc nét, Tiêu đề bài hát, Tên ca sĩ, Album hiển thị đầy đủ. | Đọc metadata hoàn toàn tự động, read-only. |
| **3.2** | Nghe đoạn điệp khúc tại giây 30: Nhấn `[` tại 30.0s, nhấn `]` tại 33.0s (Đoạn dài 3.0s). | Hệ thống tự tính: `fadeDuration = 60ms`. HUD hiển thị `(Fade: 60ms)`. | Công thức `min(3000 × 0.02, 100) = 60ms` chuẩn xác. |
| **3.3** | Lắng nghe qua loa/tai nghe tại điểm giao thoa lặp lại. | Đoạn âm thanh hạ dần âm lượng (Fade-out) rất êm trước điểm B, sau đó nhảy về A và nâng dần âm lượng (Fade-in). | Hoàn toàn không có tiếng "bụp" (audio pop/click) gây chói tai. |
| **3.4** | Nhấn `Ctrl/Cmd + Mũi tên Phải`. | Chuyển ngay sang bài tiếp theo `acoustic_guitar.wav`, mốc A-B loop được xóa sạch cho bài mới. | Chuyển bài mượt mà, state được cô lập. |

---

## 3. Bảng Đánh giá Hoàn thành Nghiệm thu (Definition of Done Sign-off)

> **Ghi chú QA:** Bảng này lưu trạng thái nghiệm thu thực tế trước khi phát hành phiên bản Production. Trạng thái mặc định ban đầu là **Chờ kiểm thử** và chỉ chuyển thành **ĐẠT** khi toàn bộ 18 AC và 22 bước Smoke Test đã được chạy thực tế trên cả hai hệ điều hành macOS và Windows 11.

| Tiêu chuẩn Đánh giá (Criteria) | Trạng thái Ban đầu | Điều kiện Nghiệm thu Ký duyệt | Chữ ký Xác nhận |
| :--- | :---: | :--- | :--- |
| **Độ phủ Đa Nền tảng:** Hoạt động ổn định trên cả Windows 11 và macOS Apple Silicon. | 🟡 Chờ kiểm thử | Vượt qua 22/22 bước Smoke Test trên cả Win và Mac. | Product Owner |
| **Độc lập Môi trường:** File cài đặt chạy được ngay không cần cài đặt Rust hay Node.js. | 🟡 Chờ kiểm thử | Chạy thử nghiệm trên máy sạch (clean VM/machine). | Product Owner |
| **Đúng Tôn chỉ V1:** Tuyệt đối không chứa tính năng thừa (Không YouTube, không DB). | 🟡 Chờ kiểm thử | Kiểm tra mã nguồn không chứa yt-dlp, SQLite, cloud APIs. | Product Owner |
| **Hợp đồng Phím tắt:** Toàn bộ phím tắt phản hồi chuẩn xác theo đúng bảng đặc tả UI. | 🟡 Chờ kiểm thử | Kiểm tra không xung đột Cmd+M (Mac) và đầy đủ phím. | Product Owner |
| **Tốc độ & Trọng lượng:** Khởi động dưới 1 giây, duyệt ảnh mượt mà, RAM sử dụng thấp. | 🟡 Chờ kiểm thử | Đo đạc Memory Footprint dưới 60MB RAM cho video 1080p. | Product Owner |

## 5. Demo bổ sung: Nghe video trong lúc duyệt ảnh

- Dùng video MP4 H.264/AAC 60 giây trong `fixtures/videos/` và ảnh ở `fixtures/images/`. Chạy riêng trên Windows và macOS với bản app đã đóng gói.
- Phát video đến giây 10, quay ra Explorer/Finder mở ảnh bằng VXMedia. Xác nhận tab ảnh mới, nghe tiếng liên tục và thanh phát nền có icon video.
- Quay lại video: tiến độ tiếp tục, không phát lại từ đầu. Lặp lại với A–B và thao tác chuyển qua tab ảnh đã mở.
- Space ở tab ảnh tạm dừng/tiếp tục video; mở file nhạc tạm dừng video; trở lại video giữ tiến độ và trạng thái pause. Đóng tab nguồn dừng tiếng.
- Ghi version/OS/kiến trúc/codec và kết quả theo [AC-24/AC-25](05_qa_acceptance.md).

## Demo fullscreen bổ sung
1. Chọn HUD luôn hiện; mở video, vào fullscreen bằng nút. HUD ẩn ngay.
2. Di chuột → HUD hiện; dừng 2 giây → ẩn. Thoát bằng Escape → HUD luôn hiện.
3. Ẩn HUD thủ công bằng H; vào bằng F; di chuột rồi thoát → trạng thái ẩn thủ công còn giữ.
4. Windows: resize gần toàn màn hình, F11 rồi thoát nhiều lần; controls cửa sổ biến mất trong fullscreen, video scale_to_fit theo viewport. Đổi limit_file_size để kiểm tra giới hạn kích thước gốc.

- Demo HUD luôn hiện: ở cửa sổ thường dừng tương tác 2 giây → HUD mờ 40%, di chuột → sáng 100%; media không đổi độ sáng.

## Fullscreen: con trỏ và đóng cửa sổ (2026-10-26)
- Vào fullscreen, di chuột rồi chờ idle 2 giây: HUD và cursor ẩn. Di chuột: cả hai hiện lại.
- Bấm Close góc phải trong HUD để đóng cửa sổ trực tiếp trên Mac/Windows. Settings/context menu giữ cursor hiện; cửa sổ thường không ẩn cursor.
