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
| Báo cáo XO | `tab-baocao` | BC1 Top 10 Gara/Showroom doanh thu SC + BC2 Danh sách HS tồn ≥90 ngày |
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

**Công thức tỷ lệ đã giải quyết (tyGQ):**
`tyGQ = Math.round(resolved / tongCanGQ * 1000) / 10` → kết quả là % (vd: 75.6%)
⚠️ Lưu ý: phải nhân 1000 rồi chia 10 (không phải nhân 10 chia 10) để ra đúng đơn vị %.

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

## Tab Báo cáo XO — Nội dung mới

### BC1 — Thống kê Doanh thu SC các Gara/Showroom (PS năm hiện tại)

Tham chiếu Query: `select P, Count(AX), sum(AX), sum(BC) Where Y >= date 'năm-01-01' group by P order by sum(AX) DESC limit 10`

| Cột | Nguồn | Logic |
|-----|-------|-------|
| Tên Gara/SH | Cột P = `Tên garage` | Group by |
| Số vụ phát sinh | Cột AX = `Tiền ước/duyệt BT` | Count |
| Tiền SC ước BT | Cột AX = `Tiền ước/duyệt BT` | Sum |
| Tiền SC đã BT | Cột BC = `Tiền BT đã trả cho GR` | Sum |

Điều kiện lọc: `Ngày mở HSBT` (cột Y) ≥ 01/01/năm hiện tại · Sắp xếp giảm dần theo tổng tiền ước BT · Giới hạn Top 10

### BC2 — Danh sách chi tiết HS tồn ≥ 90 ngày

Tham chiếu Query: `Select C, D, E, N, P, AN, AP, AX, BH, BI WHERE BI>=90 Order by BI DESC`

| Cột Excel | Tên cột | Ghi chú |
|-----------|---------|---------|
| C (col 3) | GĐV thụ lý | |
| D (col 4) | Số HSBT | |
| E (col 5) | Biển số xe | |
| N (col 14) | Mã nghiệp vụ | |
| P (col 16) | Tên garage | |
| AN (col 40) | Mã check | |
| AP (col 42) | Mã validate | |
| AX (col 50) | Tiền ước/duyệt BT | |
| BH (col 60) | Trạng thái hồ sơ | |
| BI (col 61) | Số ngày tồn | Điều kiện ≥ 90 |

Tô màu: 🔴 ≥ 180 ngày · 🟡 120–179 ngày · Sắp xếp ngày tồn giảm dần
