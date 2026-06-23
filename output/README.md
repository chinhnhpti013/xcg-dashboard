# Báo cáo Tiến trình Bồi thường — PTI Quảng Ninh

Hệ thống tự động tổng hợp và xuất báo cáo tiến trình bồi thường xe ô tô tại Phòng Giám định PTI Quảng Ninh.

## Tính năng

- **Báo cáo 1** — Thống kê hồ sơ tiếp nhận, giải quyết và tồn theo GĐV
- **Báo cáo 2** — Tổng hợp hồ sơ tồn theo dải ngày và nghiệp vụ (TNDS / VCX) kèm cảnh báo

## Cấu trúc thư mục

```
bao-cao-tuan/
├── Dulieu.xlsx          # Dữ liệu đầu vào (không đưa lên GitHub)
├── bao_cao.py           # Script Python chính
├── index.html           # Giao diện web xuất báo cáo
├── CLAUDE.md            # Hướng dẫn cho Claude Code
├── skill.md             # Danh sách slash commands
├── Quy_trinh.md         # Quy trình nghiệp vụ gốc
├── README.md
└── .claude/
    └── settings.json
```

## Yêu cầu

```
Python >= 3.9
pandas
openpyxl
jinja2
```

Cài đặt:

```bash
pip install pandas openpyxl jinja2
```

## Sử dụng

### Chạy trực tiếp

```bash
python bao_cao.py
```

Kết quả xuất ra `index.html` trong cùng thư mục.

### Dùng với Claude Code

```
/bao-cao-xo          # Báo cáo thống kê tiếp nhận/giải quyết/tồn
/tong-hop-ton        # Báo cáo tổng hợp tồn chi tiết
/export-html         # Xuất toàn bộ ra index.html
/kiem-tra-du-lieu    # Kiểm tra dữ liệu đầu vào
```

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

## Ngưỡng cảnh báo (Báo cáo 2)

| Tỷ lệ HS tồn / HS PS TB tháng | Cấp độ |
|-------------------------------|--------|
| < 80% | Cấp độ 1 |
| 80% – 130% | Cấp độ 2 |
| > 130% | Cấp độ 3 |

## Deploy GitHub Pages

Push toàn bộ thư mục lên GitHub, bật GitHub Pages từ nhánh `main`, trỏ vào `index.html`.

---

*PTI Quảng Ninh — Phòng Giám định và Cứu hộ*
