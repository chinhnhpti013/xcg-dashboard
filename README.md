# Dashboard Báo cáo Tiến trình Bồi thường
## PTISOS · Văn phòng Miền Bắc · Phòng Khu vực Quảng Ninh

---

## Giới thiệu

Dashboard HTML tương tác để tổng hợp và phân tích tiến trình giám định bồi thường xe cơ giới. Toàn bộ xử lý diễn ra **offline trong trình duyệt** — không cần server, không lưu dữ liệu.

---

## Cách sử dụng

1. Mở file **`index.html`** bằng trình duyệt (Chrome / Edge / Firefox)
2. Kéo thả hoặc nhấn **Chọn file Dulieu.xlsx** để tải dữ liệu
3. Dashboard tự động tính toán và hiển thị toàn bộ báo cáo

> File `Dulieu.xlsx` được xử lý hoàn toàn trong trình duyệt, không gửi lên bất kỳ server nào.

---

## Cấu trúc thư mục

```
bao-cao-tuan/
├── index.html              ← Dashboard chính (mở bằng trình duyệt)
├── input/
│   └── Dulieu.xlsx         ← Dữ liệu nguồn (tải lên qua giao diện)
├── output/
│   └── README.md
├── docs/
│   ├── Quy_trinh.md        ← Đặc tả logic tính toán
│   ├── Quy_trinh.docx
│   └── mau bao cao Theo GĐV.xlsx  ← Mẫu Excel tham chiếu
├── .claude/
│   ├── skill.md            ← Hướng dẫn Claude chỉnh sửa
│   └── settings.json
├── CLAUDE.md               ← Tài liệu hệ thống cho Claude
└── README.md               ← File này
```

---

## Các tab báo cáo

| Tab | Nội dung |
|-----|----------|
| 📊 **Tổng quan** | KPI tổng hợp (tổng HS, đã GQ, đang tồn, quá hạn, tổng BT) + biểu đồ theo GĐV và phân bổ tồn |
| 👤 **Theo GĐV** | Bảng tổng hợp hồ sơ tồn theo từng Giám định viên — định dạng Excel, 4 hàng header, 18 cột, kẻ ô đầy đủ |
| ⏳ **Phân tích tồn** | Aging bucket (0–30 · 30–45 · 45–90 · >90 ngày) + biểu đồ theo GĐV |
| 📋 **Báo cáo XO** | BC1: Top 10 Gara/Showroom doanh thu sửa chữa năm hiện tại · BC2: Danh sách chi tiết HS tồn ≥90 ngày |
| ⚠️ **Cảnh báo** | Danh sách hồ sơ tồn >90 ngày + GĐV vượt ngưỡng cảnh báo |
| 🗺️ **Infographic** | Báo cáo tổng hợp dạng infographic theo địa bàn (Móng Cái · Cẩm Phả · Đông Triều · Hạ Long) |

## Địa bàn (Tab Infographic)

| Địa bàn | GĐV phụ trách |
|---------|---------------|
| Móng Cái | VIETNT05 (Nguyễn Tiến Việt) |
| Cẩm Phả | SONTT (Trần Thanh Sơn) |
| Đông Triều | HUONGNV (Nguyễn Văn Hướng) |
| Hạ Long | TUNGHX · DUYNT · TUYENLM · CHINH05 |

## Lưu phiên làm việc

Dashboard tự động lưu dữ liệu vào `localStorage` sau khi tải file. Lần sau mở trang → nút **🔄 Khôi phục** xuất hiện, click để vào thẳng dashboard không cần upload lại.

---

## Cấu trúc dữ liệu — Dulieu.xlsx

Các cột quan trọng trong file Excel:

| Cột | Mô tả |
|-----|-------|
| `Số HSBT` | Mã định danh hồ sơ bồi thường |
| `GĐV thụ lý` hoặc `Mã GĐV` | Mã giám định viên |
| `Trạng thái hồ sơ` | `Đã thanh toán` · `Đã hủy` · đang xử lý |
| `Số ngày tồn` | Số ngày chưa giải quyết (> 0 = đang tồn) |
| `Ngày mở HSBT` | Ngày phát sinh hồ sơ |
| `Mã nghiệp vụ` | `XO.1.x` = TNDS · `XO.4.x` = VCX |
| `Tiền ước/duyệt BT` | Số tiền bồi thường ước tính / đã duyệt |
| `Biển số xe` | Biển kiểm soát xe |

---

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

---

## Logic tính toán

### Phân loại hồ sơ
- **Đã giải quyết**: `Trạng thái hồ sơ` ∈ {`Đã thanh toán`, `Đã hủy`}
- **Có tồn**: `Số ngày tồn` > 0
- **Tồn năm trước**: `Ngày mở HSBT` ≤ 31/12/năm trước
- **HSPS kỳ báo cáo**: `Ngày mở HSBT` ≥ 01/01/năm hiện tại

### Công thức tab Theo GĐV
| Cột | Công thức |
|-----|-----------|
| HSPS TB tháng | HSPS năm nay ÷ số tháng hiện tại |
| Tỷ lệ Hs tồn / Tổng HS cần GQ | Tổng tồn ÷ Tổng cần GQ |
| Tỷ lệ Tồn >45 / Tổng tồn | (Tồn 45–90 + Tồn >90) ÷ Tổng tồn |
| Tỷ lệ Hs tồn / Hs PS TB tháng | Tổng tồn ÷ HSPS TB tháng |

### Ngưỡng cảnh báo (dựa trên Hs tồn / Hs PS TB tháng)
| Mức | Điều kiện | Ký hiệu |
|-----|-----------|---------|
| Cấp độ 1 | < 80% | 🟢 |
| Cấp độ 2 | 80% – 130% | 🟡 |
| Cấp độ 3 | > 130% | 🔴 |

---

## Công nghệ sử dụng

- **[SheetJS (xlsx)](https://sheetjs.com/)** — đọc file Excel trong trình duyệt
- **[Chart.js](https://www.chartjs.org/)** — vẽ biểu đồ
- **[Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro)** — font chữ
- Không có backend, không có framework — HTML/CSS/JS thuần

---

*PTISOS · Văn phòng Miền Bắc · Phòng Khu vực Quảng Ninh*
