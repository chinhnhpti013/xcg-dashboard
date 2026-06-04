# Dự án: Báo cáo Tiến trình Bồi thường — PTISOS Quảng Ninh

## Tổ chức

**Đơn vị**: PTISOS - Văn phòng Miền Bắc - Phòng Khu vực Quảng Ninh

## Mục đích

Tự động hóa việc tổng hợp và xuất dashboard báo cáo tiến trình bồi thường xe ô tô tại PTI Quảng Ninh từ dữ liệu file `input/Dulieu.xlsx`, hiển thị dưới dạng HTML tương tác chạy offline trong trình duyệt.

## Ngôn ngữ giao tiếp

Luôn trả lời bằng **tiếng Việt**.

## Cấu trúc dự án

```
bao-cao-tuan/
├── index.html          ← Dashboard chính (HTML thuần, không cần server)
├── input/
│   └── Dulieu.xlsx     ← Dữ liệu nguồn, người dùng tải lên qua giao diện
├── output/
│   └── README.md
├── docs/
│   ├── Quy_trinh.md    ← Đặc tả logic báo cáo
│   └── Quy_trinh.docx
├── .claude/
│   ├── skill.md        ← Hướng dẫn Claude thêm tab / chỉnh sửa báo cáo
│   └── settings.json
└── CLAUDE.md           ← File này
```

## Nguồn dữ liệu — Dulieu.xlsx

Cột quan trọng:

| Cột | Mô tả |
|-----|-------|
| `Số HSBT` | Mã định danh hồ sơ bồi thường |
| `GĐV thụ lý` hoặc `Mã GĐV` | Mã giám định viên |
| `Trạng thái hồ sơ` | `"Đã thanh toán"` / `"Đã hủy"` / đang xử lý |
| `Số ngày tồn` | Số ngày hồ sơ chưa giải quyết (> 0 = đang tồn) |
| `Ngày mở HSBT` | Ngày phát sinh hồ sơ |
| `Mã nghiệp vụ` | `XO.1.x` (TNDS), `XO.4.x` (VCX) |
| `Tiền ước/duyệt BT` | Số tiền bồi thường ước tính / đã duyệt |
| `Biển số xe` | Biển kiểm soát xe |

## Danh sách Giám định viên

| Mã GĐV | Họ tên |
|--------|--------|
| TUNGHX | Hoàng Xuân Tùng |
| TUYENLM | Lương Minh Tuyến |
| CHINH05 | Nguyễn Hồng Chinh |
| DUYNT | Nguyễn Thế Duy |
| VIETNT05 | Nguyễn Tiến Việt |
| HUONGNV | Nguyễn Văn Hướng |
| SONTT | Trần Thanh Sơn |

## Các tab báo cáo

| Tab | ID | Mô tả |
|-----|----|-------|
| Tổng quan | `tab-overview` | KPI tổng hợp + biểu đồ |
| Theo GĐV | `tab-gdv` | Bảng tổng hợp hồ sơ tồn theo GĐV — kiểu Excel, 4 hàng header |
| Phân tích tồn | `tab-aging` | Aging bucket + biểu đồ |
| Báo cáo XO | `tab-baocao` | BC1 Tiếp nhận/GQ/Tồn + BC2 Tổng hợp tồn (kẻ ô đầy đủ) |
| Cảnh báo | `tab-warnings` | HS tồn >90 ngày + GĐV nguy hiểm |
| Infographic | `tab-infographic` | Báo cáo tổng hợp dạng infographic theo địa bàn |

## Cấu hình Địa bàn (dùng cho tab Infographic)

```js
const DIABAN_MAP = {
  'Móng Cái':   ['VIETNT05'],
  'Cẩm Phả':   ['SONTT'],
  'Đông Triều': ['HUONGNV'],
  'Hạ Long':    ['TUNGHX', 'DUYNT', 'TUYENLM', 'CHINH05']
};
```

Infographic tính toán theo địa bàn (không phải GĐV):
- Tổng quan khu vực (HS cần GQ, tỷ lệ GQ, đang tồn)
- Phân tích nghiệp vụ VCX vs TNDS và % tồn >45 ngày
- Bảng điểm nóng (địa bàn Cấp độ 3, tỷ lệ tồn/PS tháng)
- So sánh hiệu suất 4 địa bàn qua thanh bar

## Lưu phiên làm việc

Dùng `localStorage` với key `pti_raw_v1` (JSON dữ liệu) và `pti_filename`.
- Khi tải file → tự động lưu
- Khi mở lại trang → nút "🔄 Khôi phục" xuất hiện, tự restore
- "↩ Tải file khác" → xoá cache, quay về upload

## Quy tắc khi Claude chỉnh sửa index.html

- Không thay đổi cấu trúc upload → loading → dashboard
- Không thay đổi hàm `computeStats()` trừ khi thêm trường mới
- Khi thêm tab mới: thêm cả button, div container, case switchTab, hàm render, và gọi trong renderAll()
- Tiêu đề thống nhất: **PTISOS - Văn phòng Miền Bắc - Phòng Khu vực Quảng Ninh**
- Màu brand: `#1565C0` (xanh PTI)
- Font: `Be Vietnam Pro`

## Báo cáo 1 — Thống kê HS Tiếp nhận, Giải quyết và Tồn (XO)

Cột | Logic
----|------
Đã giải quyết | `Trạng thái` ∈ {Đã thanh toán, Đã hủy}
Đang giải quyết | `Số ngày tồn` > 0
Tỷ lệ tồn | Đang GQ / (Đã GQ + Đang GQ)
Tồn ≤ 45 ngày | `0 < Số ngày tồn ≤ 45`
Tồn > 45 ngày | `Số ngày tồn > 45`
Tỷ lệ tồn >45 | Tồn >45 / Đang GQ

## Báo cáo 2 — Tổng hợp Hồ sơ Tồn (NV XO)

Cột | Logic
----|------
Tồn năm trước | `Ngày mở HSBT` ≤ 31/12/năm trước
HSPS kỳ báo cáo | `Ngày mở HSBT` ≥ 01/01/năm hiện tại
Tổn theo NV — TNDS | `Mã nghiệp vụ` bắt đầu `XO.1` và đang tồn
Tồn theo NV — VCX | `Mã nghiệp vụ` bắt đầu `XO.4` và đang tồn
Hs tồn/PS TB tháng | Tổng tồn / (HSPS / tháng hiện tại)

**Ngưỡng cảnh báo**: <80% → Cấp 1 🟢 | 80–130% → Cấp 2 🟡 | >130% → Cấp 3 🔴
