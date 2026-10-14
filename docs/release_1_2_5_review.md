# VXMedia 1.2.5 — QA độc lập và phát hành

Ngày: 2026-10-14.

## Phạm vi và kết quả

Native Apple Silicon: mở WAV fixture dài 180 giây qua UI, mở PNG ở thư mục khác tạo tab mới; mini-player tiếp tục ở00:28 và quay lại tab audio ở00:32, không reset. Hủy picker giữ phiên. Recent/source chỉ ghi UI thành công, file/folder tách riêng.

Frontend/bundle đạt; updater/release regression và recent đạt.

Đã review đổi tên repo/endpoint/settings và manifest/lock versions. Giữ bundle identifier và khóa updater cũ; Clean giữ certificate signer cũ. Không gom docs/log ngoài scope vào release.

## Giới hạn

GUI kiểm tra trên Apple Silicon. Pure mouse-hover chưa kiểm tra native; focus/keyboard/click Recent đã kiểm tra ở Photos/Clean, Media dựa trên shared component/source và regression. Windows/Intel GUI chưa chạy trong lượt này. Media/Photos chờ build CI Windows+haiMac; Clean chỉ haiMac, không phát hành Windows ở track này.

CI/package/signature/tamper/icon/public sẽ ghi sau khi xác minh.
