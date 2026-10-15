# Đặc tả Kiến trúc Quản lý Tab Thư mục & Đa Cửa sổ (Folder Tabs & Multi-Window Architecture)

> **Mã đặc tả:** `_spec7_folder_tabs_multi_window`  
> **Phiên bản tài liệu:** `1.2.0`
> **Ngày cập nhật:** 2026-10-09
> **Áp dụng từ:** `v1.1.0` (Milestone Sprint)  
> **Dự án:** VXMedia (`media_tool`)  
> **Tài liệu căn cứ:** [sprint.md](../../sprint.md) & [AGENTS.md](../../../AGENTS.md)

---

## 1. Bối cảnh & Mục tiêu Sản phẩm

Trong quá trình sử dụng thực tế của VXMedia, hai nhu cầu nghiệp vụ lớn đã phát sinh:
1. **Trải nghiệm Nghe nhạc khi Duyệt ảnh (Background Audio Playback):** Người dùng muốn mở một thư mục nhạc để phát các bản nhạc yêu thích, sau đó mở một thư mục ảnh để duyệt/chọn lọc ảnh. Hành động mở ảnh **tuyệt đối KHÔNG được làm gián đoạn bài nhạc đang phát**.
2. **Đối chiếu & So sánh Media Đa Thư mục (Cross-Folder Comparison):** Người dùng cần so sánh các tệp tin thuộc nhiều thư mục khác nhau (ví dụ: bộ ảnh `Photoshoot A` và `Photoshoot B`). Mỗi thư mục là một ngữ cảnh làm việc riêng biệt (Workspace) cần cùng tồn tại song song, có thể chuyển đổi qua các **Tabs** hoặc tách ra các **Cửa sổ riêng biệt (Multi-Window)** để tận dụng công cụ sắp xếp cửa sổ của hệ điều hành (macOS Window Management hoặc Windows Snap).

---

## 2. Mô hình Tư duy Cốt lõi (Core Mental Model)

Hệ thống thiết lập phân cấp rõ ràng theo mô hình 4 cấp độ:

```text
VXMedia (App-Level)
│
├── Global Playback Session (Tài nguyên phát toàn cục: Audio / Video độc lập)
│
├── Cửa sổ A (Window A)
│   ├── Tab 1 → Folder Session: /Photos/Camera_A
│   └── Tab 2 → Folder Session: /Music/Soundtrack
│
└── Cửa sổ B (Window B)
    └── Tab 3 → Folder Session: /Photos/Camera_B
```

### Các khái niệm định danh:
* **Folder (Workspace):** Không gian làm việc đại diện cho một thư mục vật lý cụ thể.
* **File:** Tệp tin hiện đang được hiển thị hoặc phát bên trong Workspace đó.
* **Tab:** Phần tử giao diện đại diện trực quan cho một Folder Session trên thanh công cụ.
* **Window:** Cửa sổ chứa một hoặc nhiều Tabs.
* **Playback Session:** Phiên phát media cấp độ ứng dụng (App-level), tách rời hoàn toàn khỏi trạng thái hiển thị của Tab hay Cửa sổ.

> **Quy tắc tuyệt đối:** Không mô hình hóa mỗi file là một tab. Mỗi tab đại diện cho **1 Thư mục (Folder Session)**.

---

## 3. Kiến trúc Phiên Thư mục (Folder Session Architecture)

Mỗi thư mục được mở sẽ duy trì một phiên làm việc độc lập với vòng đời bền vững (`FolderSession`):

```typescript
export interface FolderSession {
  id: string;                    // UUID duy nhất của session
  folderPath: string;            // Đường dẫn thư mục chuẩn hóa (canonical path)
  folderName: string;            // Tên thư mục hiển thị trên Tab
  items: MediaItem[];            // Danh sách tệp tin trong thư mục
  currentIndex: number;          // Vị trí tệp đang chọn
  currentFilePath: string;       // Đường dẫn tệp đang chọn
  markedPaths: string[];         // Danh sách tệp đã đánh dấu (Mark Session)
  mode: 'viewer' | 'player';     // Chế độ xem tương ứng với tệp hiện tại
  
  // Trạng thái giữ nguyên khi chuyển Tab hoặc đổi Cửa sổ:
  viewerState: {
    zoom: number;
    pan: { x: number; y: number };
    rotation: number;
    flipH: boolean;
    flipV: boolean;
  };
  
  playerState?: {
    abLoop?: {
      pointA: number | null;
      pointB: number | null;
      isActive: boolean;
      fadeDurationMs: number;
    };
  };
}
```

### Quy tắc Điều hướng Tab & Thư mục:
1. **Mở tệp Cùng thư mục:**
   - Nếu thư mục `Folder A` đã có session mở sẵn:
   - **Tái sử dụng tab hiện có**, kích hoạt tab đó làm active tab, và nhảy đến tệp vừa chọn (`currentIndex`).
   - Tuyệt đối **không tạo tab trùng lặp** cho cùng một thư mục.
   - So sánh đường dẫn theo chuẩn chuẩn hóa của từng hệ điều hành (`normalizePath`).
2. **Mở tệp Khác thư mục:**
   - Nếu thư mục `Folder B` chưa mở: Tạo một `FolderSession` mới và thêm một `Tab` mới vào cửa sổ hiện tại.
   - Không ghi đè hoặc thay thế session của `Folder A`.

---

## 4. Quyền Sở hữu & Tranh chấp Phát lại (Global Playback Ownership)

Phát lại âm thanh/video **không thuộc về viewport của tab đang hiển thị**. Player nằm ở cấp App của từng cửa sổ. Một cửa sổ giữ nguồn phát khi đổi tab; chưa có engine dùng chung hoặc cơ chế chuyển giao liên tục nguồn/tiến độ giữa cửa sổ.

```text
┌────────────────────────────────────────────────────────┐
│             GLOBAL PLAYBACK CONTROLLER                 │
│  • Audio Element / Playback State bền vững ở App-Level │
│  • miniPlayerBar hiển thị khi Tab hiện tại là Viewer   │
└────────────────────────────────────────────────────────┘
          ▲                                ▲
          │ (Điều khiển phát)              │ (Nhận sự kiện)
┌───────────────────────┐        ┌───────────────────────┐
│       WINDOW A        │        │       WINDOW B        │
│  [Tab Ảnh] [Tab Nhạc] │        │      [Tab Ảnh 2]      │
└───────────────────────┘        └───────────────────────┘
```

### Quy tắc Giải quyết Tranh chấp Âm thanh (Audio/Video Contention):
1. **Đang phát Nhạc → Mở tệp Ảnh (Viewer):**
   - Trình duyệt ảnh nạp ảnh tức thì.
   - Bài nhạc hoặc tiếng từ video vẫn tiếp tục phát, giữ tiến độ và A–B khi mở ảnh/PDF.
   - Một thanh điều khiển mini phát nhạc nổi gọn gàng (Floating Mini Playback Pill / HUD) hiển thị tiến độ và nút tạm dừng/bài kế tiếp.
2. **Đang phát Nhạc → Mở một tệp Nhạc khác & Bấm Play:**
   - Bản nhạc trước nhường quyền phát lại cho bản nhạc mới.
3. **Đang phát Nhạc → Mở Video & Bấm Play Video:**
   - Bản nhạc nền tự động tạm dừng để nhường âm thanh cho Video phát.
   - Tuyệt đối **không phát đồng thời 2 luồng âm thanh** gây ồn ào.

---

## 5. Kiến trúc Đa Cửa sổ (Multi-Window — Triển khai ở Phase 1)

Triển khai ngay trong phiên bản `v1.1.0`.

### Luồng Thao tác Người dùng:
* Trên mỗi Tab hiển thị: Người dùng bấm chuột phải (Context Menu) hoặc bấm nút tùy chọn `•••` trên Tab:
  * Lựa chọn: **`Chuyển sang Cửa sổ Mới (Move to New Window)`**
* Khi bấm chọn:
  1. Một cửa sổ Tauri mới được tạo ra: `window_label = "win_" + sessionId`.
  2. Toàn bộ thực thể `FolderSession` hiện tại được **di chuyển (MOVE)** sang cửa sổ mới, loại bỏ khỏi cửa sổ cũ.
  3. Cửa sổ mới nhận `FolderSession` và khôi phục chính xác:
     - Tệp đang xem dở (`currentFilePath`).
     - Danh sách file đánh dấu (`markedPaths`).
     - Trạng thái zoom/pan/xoay của Viewer.
     - Tiến độ playback và vòng lặp A–B chưa được chuyển giao sang cửa sổ mới; nguồn ở cửa sổ cũ dừng khi tab nguồn bị chuyển đi.
  4. Cửa sổ mới được kích hoạt và đưa lên hàng đầu (Focus).

```text
TRƯỚC KHI CHUYỂN:
Cửa sổ A: [ 📁 Photoshoot A ] [ 📁 Photoshoot B ]

THAO TÁC: Chuột phải vào [ 📁 Photoshoot B ] → "Chuyển sang Cửa sổ Mới"

SAU KHI CHUYỂN:
Cửa sổ A: [ 📁 Photoshoot A ]
Cửa sổ B: [ 📁 Photoshoot B ] (Giữ nguyên vị trí ảnh, zoom, mark tệp)
```

### Quy tắc Vòng đời Cửa sổ (Window Lifecycle):
* **Đóng Cửa sổ Phụ (Secondary Window):**
  - Giải phóng giao diện của cửa sổ đó, dọn dẹp các listener IPC.
  - Không làm sập ứng dụng, không ảnh hưởng đến Cửa sổ Chính.
  - Nếu cửa sổ phụ sở hữu nguồn video/audio đang phát, đóng cửa sổ đó sẽ dừng nguồn. Chưa có engine toàn ứng dụng giữ phát khi cửa sổ sở hữu nguồn bị đóng.
* **Đóng Cửa sổ Cuối cùng (Last Window):**
  - Thực hiện quy trình thoát sạch sẽ (Clean Quit / Zero-Residue Exit) toàn bộ ứng dụng.

---

## 6. Thiết kế Giao diện Thanh Tab (Tab Bar UI Spec)

* **Vị trí tích hợp:** Tích hợp trực tiếp bên trong thanh `WindowBar` (đặt cạnh tên ứng dụng `VXMedia` và hai nút Mở tệp/Mở thư mục), hoặc hiển thị thành một hàng tab mảnh (chiều cao 28px) ngay bên dưới thanh WindowBar khi có từ 2 tabs trở lên.
  - **Hai nút Quick Open (Mở tệp / Mở thư mục):** Hiển thị nhãn gọn gàng (chỉ gồm tên nút, không chèn chuỗi phím tắt vào nhãn text). Gợi ý phím tắt (`Cmd+O` / `Ctrl+O` và `Cmd+Shift+O` / `Ctrl+Shift+O`) hiển thị qua tooltip (`title`) khi di chuột (hover).
* **Thành phần mỗi Tab:**
  - Icon thư mục (`Folder` hoặc `FolderOpen`).
  - Tên thư mục (ví dụ: `Camera A`, `Soundtracks`).
  - Badge đếm số file đã đánh dấu nếu có (ví dụ: `• 5`).
  - Nút đóng tab `×` (khi di chuột qua).
  - Menu ngữ cảnh (Context Menu):
    - `Chuyển sang Cửa sổ Mới (Move to New Window)`
    - `Đóng Tab (Close Tab)`
    - `Đóng các Tab khác (Close Other Tabs)`
* **Nút tạo mới tab `+`:** Cho phép chọn nhanh thư mục mới để mở song song.

---

## 7. Danh mục Chờ (Backlog) — Detachable & Cross-Window Tabs

> [!IMPORTANT]
> **TRẠNG THÁI: BACKLOG — CHƯA TRIỂN KHAI (NOT IMPLEMENTED)**  
> Tính năng dưới đây thuộc giai đoạn Phase 2 và Phase 3, được ghi nhận trong lộ trình tương lai và **tuyệt đối KHÔNG triển khai ở Phase 1**.

### Mô tả Tính năng Chờ:
* **Kéo thả Tab ra ngoài để Bung Cửa sổ (Drag-to-Detach):**
  - Kéo một Tab ra khỏi phạm vi cửa sổ hiện tại → Hệ điều hành tự động tách và tạo ngay một cửa sổ mới chứa `FolderSession` đó tại tọa độ con trỏ chuột.
* **Kéo thả Tab qua lại giữa các Cửa sổ (Cross-Window Drag & Drop):**
  - Kéo Tab từ Cửa sổ A thả vào thanh Tab của Cửa sổ B → Tab được sáp nhập liền mạch vào Cửa sổ B.
* **Yêu cầu Kiến trúc cho tương lai:** Kiến trúc Phase 1 phải phân định rõ ràng quyền sở hữu session độc lập với window để khi làm tính năng kéo thả ở Phase 2/3 không phải đập bỏ viết lại backend.

---

## 8. Ma trận Kiểm thử Chấp thuận (QA Test Matrix — 16 Ca kiểm thử)

| Mã | Tình huống kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- |
| **TC-01** | Mở 1 ảnh từ Thư mục A | Mở Tab A với tệp vừa chọn, nạp đủ danh sách media Thư mục A. |
| **TC-02** | Mở thêm 1 ảnh khác cùng Thư mục A | Tái sử dụng Tab A, chuyển đến ảnh mới, không sinh thêm Tab trùng. |
| **TC-03** | Mở 1 ảnh từ Thư mục B | Tạo Tab B mới kế bên Tab A, Tab B được kích hoạt. |
| **TC-04** | Chuyển đổi qua lại giữa Tab A và Tab B | Giữ file được chọn/đánh dấu theo session; viewport ảnh được tạo lại, không khẳng định giữ zoom/pan/scroll chưa được triển khai. |
| **TC-05** | Đánh dấu (`Mark`) các file độc lập ở Tab A và Tab B | Số lượng file đánh dấu được lưu trữ riêng cho từng session thư mục. |
| **TC-06** | Đang phát nhạc ở Tab Nhạc → Chuyển sang Tab Ảnh | Nhạc tiếp tục phát êm mượt, ảnh hiển thị trọn vẹn ở Viewer. |
| **TC-07** | Nhạc đang phát → Chuyển liên tục giữa các Tab ảnh | Luồng âm thanh giữ nguyên, không bị ngắt hoặc giật tiếng. |
| **TC-08** | Nhạc đang phát → Bấm phát một bài hát hoặc video ở Tab khác | Bản phát cũ nhường chỗ ngay lập tức cho tệp mới, không phát đè âm thanh. |
| **TC-09** | Chuột phải vào Tab B → Chọn "Chuyển sang Cửa sổ Mới" | Cửa sổ B xuất hiện chứa Tab B; Tab B biến mất khỏi Cửa sổ A. |
| **TC-10** | Duyệt ảnh và zoom ảnh trên Cửa sổ B | Cửa sổ B hoạt động độc lập, không ảnh hưởng đến Cửa sổ A. |
| **TC-11** | Duyệt ảnh trên Cửa sổ A song song với Cửa sổ B | Cả hai cửa sổ duyệt mượt mà (hỗ trợ so sánh ảnh side-by-side). |
| **TC-12** | Đóng Cửa sổ B | Cửa sổ B đóng sạch sẽ; Cửa sổ A tiếp tục hoạt động bình thường không lỗi. |
| **TC-13** | Đang phát nhạc → Mở/Đóng cửa sổ phụ | Bản nhạc đang phát không bị gián đoạn hay dừng đột ngột. |
| **TC-14** | Kiểm tra chế độ lặp A-B loop | A-B loop tiếp tục hoạt động chính xác theo cài đặt của session. |
| **TC-15** | Kiểm tra thao tác sao chép/cắt tệp đã đánh dấu | Phím tắt `Cmd+C` / `Cmd+X` lấy đúng danh sách đánh dấu của session đang active. |
| **TC-16** | Khởi động lại ứng dụng và kiểm thử khói tổng thể | Không phát sinh lỗi rò rỉ bộ nhớ hoặc lỗi giao diện. |

---

## 9. Kế hoạch Triển khai Kỹ thuật (Implementation Plan)

### Bước 1: Quản lý Trạng thái Session & Playback ở Frontend
- Tạo `src/types/session.ts`: Định nghĩa `FolderSession`, `WindowState`, `GlobalPlaybackState`.
- Tạo `src/services/sessionManager.ts`: Bộ quản lý phân phối session thư mục, chuẩn hóa đường dẫn, tạo ID session.
- Tạo `src/components/TabBar.tsx`: Component hiển thị danh sách Tabs, menu ngữ cảnh di chuyển cửa sổ và đóng tab.

### Bước 2: Tách Rời Global Playback Controller
- Tạo component `GlobalPlaybackEngine.tsx` hoặc Service phát audio ngầm ở cấp độ App (`App.tsx`), tách phần `<audio>` ra khỏi vòng đời hiển thị của từng tab view.
- Tạo `MiniPlaybackBar.tsx` hiển thị tiến độ và điều khiển nhanh khi người dùng đang ở chế độ duyệt ảnh.

### Bước 3: Tích hợp Đa Cửa sổ Tauri (Tauri Multi-Window Support)
- Đăng ký IPC command `create_new_window(session_data)` trong `src-tauri/src/commands/window.rs`.
- Cấu hình quyền `allow-create-window` trong capabilities của Tauri.
- Đồng bộ dữ liệu session giữa các cửa sổ thông qua `BroadcastChannel` hoặc Tauri events (`emit_to`).


## 10. Nghiệm thu phát nền video/audio sau review 2026-10-09

- Phản hồi thực tế trên bản 1.2.3: mở video có tiếng, mở ảnh từ Explorer/Finder tạo tab mới, tiếng bị ngắt và quay lại video phát từ đầu trên cả Windows và macOS. Regression WAV trước đó bỏ sót video.
- Sửa hiện tại: một Player audio và một Player video giữ vòng đời ở cấp App; chỉ viewport ảnh/PDF đang xem được render. Player ẩn nằm ngoài viewport, inert/aria-hidden và không đăng ký phím tắt.
- Mở ảnh hoặc quay lại không gỡ player, không nạp lại nguồn, không reset tiến độ/A–B. Ảnh cùng thư mục cũng giữ phát nền.
- Trong cùng cửa sổ, video/audio nhường quyền phát cho nhau; nguồn đã pause giữ nguyên tiến độ. Space và thanh phát nền điều khiển nguồn vừa nghe; nút trở lại chọn đúng file nguồn.
- Hết file chọn media cùng loại trong thư mục nguồn, bỏ qua ảnh và không đổi ảnh đang xem. Đóng tab nguồn hoặc đóng các tab khác loại bỏ nguồn thì dừng/gỡ src.
- Regression tự động: `npm run test:playback` (cần Chromium từ `npx playwright install chromium`, hoặc `BROWSER_EXECUTABLE_PATH` trỏ Chrome sẵn có). App/Player và HTMLMediaElement thật, WAV và video WebM có tiếng; bridge file/dialog dùng fixture local.
- Test browser không thay nghiệm thu app Tauri/WebView2 trên Windows hay WKWebView trên macOS. Đường mở file OS cần thử thật bằng AC-24/AC-25 trong [QA](05_qa_acceptance.md).
- Phát nền xuyên cửa sổ và chuyển giao liên tục tiến độ khi Move to New Window chưa được triển khai/kiểm chứng. Các mục mô tả điều phối đa cửa sổ phía trên là mục tiêu, không phải bằng chứng đã đạt.
