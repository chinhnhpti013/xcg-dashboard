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
| `Tên garage (thường gọi)` hoặc `Tên garage (ĐKKD)` | Tên gara/showroom sửa chữa — từ 06/2026 cột `Tên garage` cũ đã tách thành 2 cột này; báo cáo ưu tiên dùng `(thường gọi)`, fallback `(ĐKKD)` |
| `Tiền BT đã trả cho KH` | Không còn khoảng trắng cuối tên cột (khác với file cũ) — code có fallback đọc cả 2 dạng |

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
| Báo cáo XO | `tab-baocao` | BC1 Top 30 Gara/Showroom doanh thu SC + BC2 Danh sách HS tồn ≥90 ngày + BC3 tồn 46–89 ngày |
| Tổng hợp cảnh báo | `tab-infographic` | Infographic theo địa bàn + khối "Đánh giá Tổng quan" (`generateAnalysis(s)`) ở cuối |
| Đề xuất cải tiến CLDV | `tab-cldv` | Phân tích 3 trục: Chất lượng dịch vụ · Hiệu quả & Năng suất · Quan hệ khách hàng; hàm `renderCLDV(s)` |

> Tab "Phân loại tồn" (`tab-aging`) đã bị xóa (06/2026) — nội dung phân phối thời gian tồn đã được tích hợp vào tab Đề xuất cải tiến CLDV (Trục 1). `warnRows` trong `computeStats()` vẫn giữ nguyên.
> Tab "Cảnh báo" (`tab-warnings`) đã bị xóa (06/2026) — các bảng HS tồn >90 ngày và GĐV nguy hiểm đã có trong tab Báo cáo XO và Tổng hợp cảnh báo.

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

## Màn hình đăng nhập — 2 lựa chọn nguồn dữ liệu

Thay vì chỉ upload file, màn hình upload có 2 card song song:

| Lựa chọn | Mô tả |
|----------|-------|
| **Google Drive** | Tải tự động qua JSONP (`gviz/tq`) từ file ID cố định. Không bị CORS. Callback: `ptiGvizCb` |
| **Upload file** | Kéo thả hoặc chọn file `.xlsx` từ máy tính |

- Google Drive file ID: `1KqAQmNh9W-C8MsbWuYrywnNouGC4t2ISwRMa7oYH4_0` · Sheet GID: `101924388` (cố định, không có ô nhập URL)
- File phải chia sẻ "Bất kỳ ai có liên kết" mới tải được
- Hàm tải: `loadFromGoogleDrive()` — luôn dùng `GDRIVE_FILE_ID`, không đọc input từ người dùng
- ⚠️ URL **bắt buộc** có `&headers=1` để gviz đọc hàng đầu làm tên cột (thiếu tham số này → cột trả về dạng A, B, C, toàn bộ số liệu = 0)
- ⚠️ URL **bắt buộc** có `&_=${Date.now()}` để tránh browser cache: khi cập nhật file Drive mới, không có cache-buster sẽ vẫn tải dữ liệu cũ
- **Không thêm lại ô nhập URL/ID tùy chỉnh** — người dùng cập nhật dữ liệu bằng cách ghi đè file Drive giữ nguyên ID

## Badge ngày dữ liệu (`#file-date-badge`)

Hiển thị trên topbar, màu sắc theo độ cũ:
- 🟢 `fresh`: ≤3 ngày (upload file) / ≤14 ngày (Google Drive)
- 🟡 `warn`: 4–7 ngày (upload) / 4–14 ngày (Drive)
- 🔴 `old`: >7 ngày (upload) / >14 ngày (Drive)

**Upload file**: đọc `file.lastModified` → lưu vào `localStorage` key `pti_filedate`
**Google Drive**: quét `Ngày mở HSBT` tìm max → dùng làm mốc "Dữ liệu đến ngày..."
Hàm: `showFileDateBadge(dateMs, isGDrive)` — gọi sau `renderAll()`

## Lưu phiên làm việc

Dùng `localStorage` với 3 key:
- `pti_raw_v1` — JSON dữ liệu
- `pti_filename` — tên file
- `pti_filedate` — timestamp `lastModified` (chỉ có khi upload file, không có khi dùng Drive)

- Khi tải file → tự động lưu cả 3 key
- Khi mở lại trang → nút "🔄 Khôi phục" xuất hiện, tự restore + hiện lại badge
- "↩ Tải file khác" → xoá cache, quay về upload

## Thiết kế UI hiện tại (quan trọng — không thay đổi tuỳ tiện)

### Màu sắc & nền

| Thành phần | Giá trị |
|------------|---------|
| Nền trang | `linear-gradient(150deg, #dce8f5 → #ede7f8 → #f8e9e0 → #fafaf0)`, `background-attachment: fixed` |
| Chart card | `#FAFAF5` (trắng kem), `box-shadow: 0 4px 24px rgba(0,0,0,.08)` |
| Info card (Infographic) | `#fff`, `box-shadow: 0 4px 20px rgba(0,0,0,.06)` |
| CSS variable `--claude` | `#DA7756` (Claude Orange — dùng làm accent) |
| CSS variable `--claude-light` | `#FDF1EE` |

### Tab — 3D Press Button

Mỗi tab có màu gradient riêng, hiệu ứng nổi/nhấn kiểu nút 3D vật lý:

| Tab | Màu gradient |
|-----|-------------|
| 📊 Tổng quan | `#60a5fa → #1d4ed8` (xanh dương) |
| 👤 Theo GĐV | `#34d399 → #047857` (xanh lá) |
| 📋 Báo cáo XO | `#c084fc → #6d28d9` (tím) |
| 🚨 Tổng hợp cảnh báo | `#22d3ee → #0e7490` (cyan) |
| 💡 Đề xuất cải tiến CLDV | `#fb7185 → #be123c` (hồng đỏ) |

**Nền nội dung tab (`.tab-pane`)**: mỗi tab có nền gradient pastel dịu cùng tông màu nút tab (xanh dương / xanh lá / tím / cyan / hồng nhạt), bo góc 16px, viền trắng mờ.

**Filter bar**: nền gradient đậm `#312e81 → #4c1d95 → #6d28d9` (indigo→tím), label chữ trắng, select nền trắng với viền accent riêng từng bộ lọc (`#filter-gdv` xanh lá, `#filter-nv` xanh dương, `#filter-tt` vàng), `filter-info` dạng pill trắng mờ.

- Trạng thái mặc định: `transform: translateY(-3px)`, `box-shadow: 0 6px 0 rgba(0,0,0,0.22)`
- Hover: `translateY(-5px)`, shadow `8px`
- Active/nhấn: `translateY(+2px)`, shadow `2px`

### Biểu đồ — Chart.js 4

**Bar chart (cột trụ 3D — sắc nét):**
- `cylinderPlugin`: nắp đỉnh = ellipse màu **đặc** sáng hơn màu cột (`shadeHex` +0.55→+0.12, gradient ngang) + viền đậm sắc nét (`shadeHex` −0.28, lineWidth 1.2); đáy = nửa ellipse dưới màu đậm của cột. **Không dùng radial gradient trắng mờ.**
- Màu nắp lấy từ `ds._cyl` (`{top,bot}` hex) — `buildBar` tự gắn từ `GRAD_PALETTE`; nếu `backgroundColor` là mảng hex per-bar thì nắp theo từng bar
- Gradient thân cột: đậm ở đáy → màu gốc (55%) → `shadeHex(top, 0.3)` sáng đặc ở đỉnh (không còn stop trắng trong suốt)
- `GRAD_PALETTE` 7 màu (indigo/emerald/amber/red/violet/cyan/orange)
- `borderRadius: {topLeft:0, topRight:0, bottomLeft:5, bottomRight:5}`
- Animation: `easeOutQuart`, 1000ms

**Chart TLBT XO (`_buildDualNvBtChart`)**: dual-axis bar (doanh thu trái, TLBT% phải) — đồng dạng `buildBar`: gradient cột đậm→sáng, `cylinderPlugin` (datasets gắn `_cyl` thủ công), `borderRadius` đáy 5px, animation `easeOutQuart` 1000ms. TLBT (%) hiển thị **2 số thập phân** (`toFixed(2)`) ở cả bảng và tooltip chart; `parsePct` làm tròn 2 chữ số.

**Donut chart (vòng tròn 3D — ánh kim):**
- Gradient kim loại theo bán kính từng múi (`shadeHex`): sáng ở trong → màu gốc → tối ở mép
- `metallicSheenPlugin`: dải sáng chéo trắng + viền sáng mép ngoài trên vành donut
- CSS transform trực tiếp trên canvas: `perspective(480px) rotateX(24deg) scaleY(0.86)`
- Hover chuột: `rotateX(12deg)` — ngẩng lên
- `shadow3DPlugin`: đổ bóng canvas
- Animation: `easeOutBack`, 1100ms, `animateScale: true`

### Quy tắc khi Claude chỉnh sửa index.html

- Không thay đổi cấu trúc upload → loading → dashboard
- Không thay đổi hàm `computeStats()` trừ khi thêm trường mới — hàm trả về `rows: data` (mảng đã lọc) để các hàm render dùng thay vì `RAW`
- Khi thêm tab mới: thêm cả button, div container, case switchTab, hàm render, và gọi trong renderAll()
- Tiêu đề thống nhất: **PTISOS - Văn phòng Miền Bắc - Phòng Khu vực Quảng Ninh**
- Màu brand PTI: `#1565C0` · Font: `Be Vietnam Pro`
- **Không** thay đổi `cylinderPlugin`, `shadow3DPlugin`, `GRAD_PALETTE` trừ khi người dùng yêu cầu
- Khi thêm chart bar mới → dùng `buildBar()`, chart donut mới → dùng `buildDonut()`

## Quy ước ngưỡng ngày tồn (QUAN TRỌNG)

| Bucket | Điều kiện | Ghi chú |
|--------|-----------|---------|
| 1–30 ngày | `n >= 1 && n <= 30` | |
| 31–45 ngày | `n > 30 && n <= 45` | |
| 46–89 ngày | `n > 45 && n < 90` | |
| ≥ 90 ngày | `n >= 90` | Ngưỡng cảnh báo — dùng `>=90` KHÔNG phải `>90` |

- `qua90`: `parseTon(...) >= 90` (dùng nhất quán toàn bộ file)
- `g45_90`: `n > 45 && n < 90` (không bao gồm 90)
- `g90 / b4`: `n >= 90` (bao gồm đúng 90 ngày)
- Hàm `gdvKey(r)` phải dùng khi lấy mã GĐV thay vì `r['GĐV thụ lý']` trực tiếp

## Hàm helper dùng chung

- `parseDate(v)` — hàm global duy nhất parse ngày (Excel serial, Date, string). Không tạo bản sao cục bộ trong các hàm khác.
- `gdvKey(r)` — lấy mã GĐV từ `r['GĐV thụ lý'] || r['Mã GĐV']`
- `parseTon(v)` — parse số ngày tồn, trả về `null` nếu `n <= 0`
- `parseMoney(v)` — parse số tiền, trả về `0` nếu không hợp lệ

## Tab Báo cáo XO — Nội dung

### BC1 — Thống kê Doanh thu SC các Gara/Showroom (PS năm hiện tại)

Tham chiếu Query: `select [Tên garage (thường gọi)], Count([Tiền ước/duyệt BT]), sum([Tiền ước/duyệt BT]), sum([Tiền BT đã trả cho GR]) Where [Ngày mở HSBT] >= date 'năm-01-01' group by [Tên garage (thường gọi)] order by sum([Tiền ước/duyệt BT]) DESC limit 10`

> ⚠️ Vị trí cột Excel (A/B/C...) không cố định giữa các lần xuất file — mọi truy xuất dữ liệu trong code PHẢI dùng tên cột (header), không dùng chỉ số/chữ cái cột. Bảng dưới chỉ để tham chiếu tên cột, không phải vị trí.

| Cột | Nguồn | Logic |
|-----|-------|-------|
| Tên Gara/SH | `Tên garage (thường gọi)` (fallback `Tên garage (ĐKKD)`) | Group by |
| Số vụ phát sinh | `Tiền ước/duyệt BT` | Count |
| Tiền SC ước BT | `Tiền ước/duyệt BT` | Sum |
| Tiền SC đã BT | `Tiền BT đã trả cho GR` | Sum |

Điều kiện lọc: `Ngày mở HSBT` ≥ 01/01/năm hiện tại · Sắp xếp giảm dần theo tổng tiền ước BT · **Top 30** · Khung cố định `max-height:480px` + scroll dọc, thead sticky

### BC2 — Danh sách chi tiết HS tồn ≥ 90 ngày

Tham chiếu Query: `Select [GĐV thụ lý], [Số HSBT], [Biển số xe], [Mã nghiệp vụ], [Tên garage (thường gọi)], [Mã check], [Mã validate], [Tiền ước/duyệt BT], [Trạng thái hồ sơ], [Số ngày tồn] WHERE [Số ngày tồn]>=90 Order by [Số ngày tồn] DESC`

| Tên cột | Ghi chú |
|---------|---------|
| GĐV thụ lý | dùng qua `gdvKey(r)` |
| Số HSBT | |
| Biển số xe | |
| Mã nghiệp vụ | |
| Tên garage (thường gọi) | fallback `Tên garage (ĐKKD)` |
| Mã check | |
| Mã validate | |
| Tiền ước/duyệt BT | |
| Trạng thái hồ sơ | |
| Số ngày tồn | Điều kiện ≥ 90 |

Tô màu: 🔴 ≥ 180 ngày · 🟡 120–179 ngày · Sắp xếp ngày tồn giảm dần · Header đỏ

### BC3 — Danh sách chi tiết HS tồn >45 và ≤90 ngày

Cùng cấu trúc cột với BC2, lọc: `n > 45 && n < 90` · Header màu vàng/cam · Khung `max-height:480px` + scroll dọc

Helper dùng chung: `makeHsTonRows(list)` và `hsTonHeader` string — tái sử dụng cho cả BC2 và BC3
