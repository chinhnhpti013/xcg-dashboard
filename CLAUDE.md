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
├── assets/
│   ├── logo-ptisos.png
│   └── tro-ly-gdv-kb.js ← Bộ tri thức Trợ lý GĐV (quy trình PTI) — xem mục "Trợ lý ảo GĐV"
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
| `Trạng thái hồ sơ` | 14 giá trị (`"Đã thanh toán"`, `"Đã hủy"`, `"Chờ thanh toán"`…) — chỉ dùng để hiển thị/nhóm, **không** dùng để xác định đã giải quyết |
| `Số ngày tồn` | `= 0` → **đã giải quyết** · `> 0` → đang tồn · trống/`-`/chữ → chưa giải quyết |
| `Ngày mở HSBT` | Ngày phát sinh hồ sơ |
| `Mã nghiệp vụ` | `XO.1.x` (TNDS), `XO.4.x` (VCX) |
| `Tiền ước/duyệt BT` | Số tiền bồi thường ước tính / đã duyệt |
| `Biển số xe` | Biển kiểm soát xe |
| `Tên garage (thường gọi)` hoặc `Tên garage (ĐKKD)` | Tên gara/showroom sửa chữa — từ 06/2026 cột `Tên garage` cũ đã tách thành 2 cột này; báo cáo ưu tiên dùng `(thường gọi)`, fallback `(ĐKKD)` |
| `Tiền BT đã trả cho KH` | Không còn khoảng trắng cuối tên cột (khác với file cũ) — code có fallback đọc cả 2 dạng |

> ⚠️ **Chuẩn VAT lệch nhau**: `Tiền ước/duyệt BT` là số **chưa VAT**, còn `Tiền BT đã trả cho KH` + `Tiền BT đã trả cho GR` là số thực chi **đã gồm VAT** (dữ liệu 09/2026: 933 HS trả = ước × 1,08; 163 HS không VAT). KPI "Đã chi trả" (`totalDaTra` = trả KH + trả GR) vì vậy được gắn nhãn **"Đã chi trả (gồm VAT)"** và có thể lớn hơn tiền ước/duyệt — không phải lỗi cộng trùng. Không chia ngược 1,08 để quy đổi vì thuế suất không đồng nhất.

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
| Tổng quan | `tab-overview` | KPI tổng hợp + biểu đồ + bảng TLBT theo nghiệp vụ + Infographic theo địa bàn (hàm `renderInfographic()`, trả về chuỗi HTML và được nối vào cuối `renderOverview(s)` thay vì render tab riêng) |
| Theo GĐV | `tab-gdv` | Bảng tổng hợp hồ sơ tồn theo GĐV — kiểu Excel, 4 hàng header |
| Báo cáo XO | `tab-baocao` | BC1 Top 30 Gara/Showroom doanh thu SC + BC2 Danh sách HS tồn ≥90 ngày + BC3 tồn 46–89 ngày |
| Đề xuất cải tiến CLDV | `tab-cldv` | Phân tích 3 trục: Chất lượng dịch vụ · Hiệu quả & Năng suất · Quan hệ khách hàng; hàm `renderCLDV(s)` |
| Dashboard động | `tab-dashboard` | Dashboard đa chiều: thanh chọn "Xem theo" **7 tiêu chí** (Giám định viên / Địa bàn / Nghiệp vụ / Hãng xe / Gara-Showroom / Trạng thái hồ sơ / Số tiền bình quân/vụ) → 3 biểu đồ và bảng chi tiết tính lại theo tiêu chí nhóm đã chọn. **Không có hàng KPI cố định** — đã gỡ (09/2026) vì các số đó không đổi khi bấm chuyển tiêu chí và đã hiển thị ở tab Tổng quan; tab này chỉ chứa nội dung thực sự thay đổi theo lựa chọn. Hàm `renderDashboard(s)` (dùng `s.rows`), `setDashDim(dim)` (đổi tiêu chí, re-render chỉ tab này), `computeDashGroups(data,dim)` → `groupRowsByDim(data,dim)` → `dimKeyOf(r,dim)` + `computeGroupStat(gd)`. `computeGroupStat` dùng đúng công thức đã chuẩn hoá: `tyLeGQ = daGQ/tongCanGQ`, `tyLeTon = tongTon/(hsps/curMonth)`, cấp độ cảnh báo <80% / 80–130% / >130% — đã đối chiếu khớp 100% với `gdvStats` trong `computeStats()`. Bảng chi tiết do `dashDetailTable(groups)` sinh, **3 bộ cột khác nhau** (xem mục dưới) |
| Tra cứu tiến trình | `tab-search` | Thứ tự ô: **Biển kiểm soát** (đầu tiên) → Số HSBT → Tên garage → GĐV thụ lý → Trạng thái hồ sơ. Tra cứu hồ sơ theo Biển kiểm soát/Số HSBT (khớp một phần, OR) kết hợp lọc **Tên garage (thường gọi)** (ô text + `datalist` gợi ý, khớp một phần không phân biệt hoa thường/dấu qua `normText`, fallback `(ĐKKD)` qua `searchGarageOf(r)`, AND), GĐV thụ lý (dropdown, AND) và **Trạng thái hồ sơ dạng dropdown nhiều checkbox** (`#search-trangthai.tt-multi`, mỗi trạng thái 1 ô kèm số HS, nút Chọn tất cả/Bỏ chọn; các trạng thái đã tích OR với nhau, AND với tiêu chí khác; không tích hoặc tích hết = không lọc; hàm `getCheckedTt()`, `updateTtLabel()`, `setAllTt(v)`, `toggleTtPanel(e)`, `closeTtPanel()` — đóng khi bấm ra ngoài/Esc/Tìm kiếm; danh sách build lại trong `buildSearchFilterOptions()` và giữ các ô đang tích) — mọi tiêu chí đều tuỳ chọn, chỉ cần 1 trong 5; bảng kết quả 18 cột (gồm GĐV thụ lý + Tên garage + 16 cột mốc thời gian/tiền/trạng thái); nút **📥 Tải Excel (.xlsx)** trên header kết quả gọi `exportSearchXlsx()` xuất đúng bộ cột của bảng từ `SEARCH_LAST` (kết quả tra cứu gần nhất) — ngày ghi số serial Excel `dd/mm/yyyy` (tự quy đổi theo ngày địa phương, tránh lệch múi giờ), tiền dạng số `#,##0`, có 2 dòng tiêu đề/điều kiện + AutoFilter, tên file `TraCuu_HSBT_yyyymmdd_HHmm.xlsx`; hàm `renderSearch()` (khởi tạo UI 1 lần, cờ `searchTabInit`) + `buildSearchFilterOptions()` (build lại cả 2 dropdown GĐV và Trạng thái hồ sơ mỗi lần renderAll, động theo giá trị thực tế có trong `RAW` — tức theo đúng dữ liệu Google Drive/Dulieu.xlsx đang tải, không hardcode danh sách; giữ lựa chọn hiện tại) + `doSearchHSBT()` (đọc `RAW` toàn bộ, không phụ thuộc filter bar) |

> Tab "Phân loại tồn" (`tab-aging`) đã bị xóa (06/2026) — nội dung phân phối thời gian tồn đã được tích hợp vào tab Đề xuất cải tiến CLDV (Trục 1). `warnRows` trong `computeStats()` vẫn giữ nguyên.
> Tab "Cảnh báo" (`tab-warnings`) đã bị xóa (06/2026) — các bảng HS tồn >90 ngày và GĐV nguy hiểm đã có trong tab Báo cáo XO và tab Tổng quan.
> Khối "Đánh giá Tổng quan" (`generateAnalysis(s)`) đã bị xóa hoàn toàn (09/2026) theo yêu cầu — tab Tổng quan nay kết thúc ở khối Infographic theo địa bàn. `renderInfographic()` không còn nhận tham số `s`.
> Tab "Tổng hợp cảnh báo" (`tab-infographic`) đã bị xóa (09/2026) — báo cáo "BÁO CÁO TIẾN ĐỘ GIẢI QUYẾT HỒ SƠ TỒN ĐỌNG PTI SOS" (Infographic theo địa bàn) đã chuyển sang cuối tab Tổng quan. **Thứ tự nút tab hiện tại (09/2026)**: **Dashboard động** → Tổng quan → Theo GĐV → Báo cáo XO → Đề xuất cải tiến CLDV → Tra cứu tiến trình. Dashboard động là tab **mặc định mở khi vào trang** (`class="tab active"` + `#tab-dashboard` không có `display:none`).
> ⚠️ Khi đổi thứ tự tab phải sửa đồng bộ **4 chỗ**: (1) thứ tự `<button class="tab">`, (2) thứ tự `<div id="tab-...">` kèm `style="display:none"` (đúng 1 pane hiện, 1 nút `active`, và 2 cái phải cùng trỏ 1 tab), (3) CSS `.tabs .tab:nth-child(n)` — đánh số theo **vị trí**, không theo tab, nên phải gán lại màu để mỗi tab giữ đúng màu cũ, (4) mảng trong `switchTab()`.

### Tiêu chí nhóm của tab Dashboard động

| dim | Nguồn cột | Giới hạn nhóm (`DASH_TOP_N`) |
|-----|-----------|------------------------------|
| `gdv` | `gdvKey(r)` | không — theo thứ tự `GDV_NAMES` |
| `diaban` | `DIABAN_MAP` | không — theo thứ tự `DIABAN_MAP` |
| `nv` | `Mã nghiệp vụ` → TNDS/VCX/Khác | không |
| `hangxe` | `Hãng xe` (~40 giá trị) | **12** + nhóm "Khác (N hãng xe)" |
| `garage` | `Tên garage (thường gọi)`, fallback `(ĐKKD)` (~118 giá trị) | **12** + nhóm "Khác (N gara/showroom)" |
| `trangthai` | `Trạng thái hồ sơ` (14 giá trị) | không |
| `mucTien` | `Tiền ước/duyệt BT` → 4 khoảng tiền + nhóm chưa ước (`MONEY_BUCKETS`) | không — theo thứ tự `MONEY_BUCKETS` |

- `MONEY_BUCKETS` (dim `mucTien`, nút "💰 Số tiền bình quân/vụ"): Dưới 10 triệu · Từ 10 đến dưới 50 triệu · Từ 50 đến dưới 100 triệu · Từ 100 triệu trở lên · **Chưa có số tiền ước** (`na:true`, luôn xếp cuối). Ranh giới `min <= m < max`; `moneyBucketKey` đưa mọi giá trị **không > 0** (0, trống, `-`, chữ, số âm) về `MONEY_NA_KEY` **trước khi** dò khoảng — cố ý tách khỏi nhóm "Dưới 10 triệu" để bình quân/vụ của nhóm này không bị kéo tụt. Mỗi bucket có `short` riêng (`< 10 tr`, `10 – <50 tr`, `Chưa ước BT`, …) cho nhãn biểu đồ.
- Bảng `mucTien` có 2 mức bình quân, không được nhầm: hàng **TỔNG** hiển thị `bqEst = t.bt / (t.total − nhóm NA)` (chỉ HS đã có tiền ước), còn `bqTong = t.bt / t.total` chỉ xuất hiện trong dòng chú thích dưới bảng để đối chiếu.
- ⚠️ `computeDashGroups(data, dim, forTable)` được gọi **2 lần** mỗi lần render: `groups` (không truyền `forTable`) cho biểu đồ và `tableGroups` (`forTable=true`) cho bảng. Với `hangxe`/`garage` hai kết quả **cố ý khác nhau**: biểu đồ giữ Top 12 theo số HS (nhãn cột mới đọc được), bảng liệt kê mọi nhóm có tổng `Tiền ước/duyệt BT` ≥ `DASH_TABLE_MIN_BT` (100 triệu) xếp theo **tiền giảm dần**, phần dưới ngưỡng gộp hàng "Khác (N … dưới 100 triệu)". Dữ liệu 07/2026: hãng xe 13/40 nhóm (95,5% tiền), gara 27/118 nhóm (80,1% tiền). Chênh lệch này được ghi ở tiêu đề bảng và pill `.dash-info` — đừng "sửa" cho hai bên giống nhau.
- Nhóm gộp cuối có cờ `isKhac` + `khacCount` (số nhóm đã gộp) để bảng tô xám nghiêng và viết chú thích.
- Các dim không có thứ tự chuẩn được xếp theo **số hồ sơ giảm dần**; phần đuôi vượt ngưỡng gộp vào nhóm "Khác" nên **tổng các nhóm luôn khớp tổng toàn cục** (đã có test bất biến).
- `normDimVal(v)`: giá trị rỗng hoặc `"-"` trong file nguồn → gom về nhóm `"(Không xác định)"` (dữ liệu thật có 27 HS trạng thái `-` và 44 HS gara `-`).
- Mỗi nhóm có `label` (đầy đủ, dùng cho bảng) và `short` (cắt ≤22 ký tự, dùng cho nhãn biểu đồ) — tên gara/GĐV dài sẽ phá layout chart nếu dùng `label`.

#### Ba bộ cột của bảng chi tiết Dashboard động (`dashDetailTable(groups)`)

| dim | Bộ cột |
|-----|--------|
| `mucTien` | Mức tiền · **Tổng số vụ** (`total`) · Tỷ trọng số vụ · **Tổng Tiền ước/duyệt BT** (`bt`) · Tỷ trọng tiền · **Số tiền bình quân/vụ** (`bqVu = bt/total`, format `fmtMBC`, tô màu `--claude`) · Đã GQ · Chưa GQ · Tỷ lệ GQ (`tyLeGQVu`) — kèm hàng `tfoot` **TỔNG** (bình quân tổng tính lại từ tổng tiền / tổng số vụ, không cộng trung bình các nhóm) |
| `hangxe`, `garage` | Hãng xe / Gara-Showroom · **Tổng số vụ phát sinh** (`total`) · **Tổng Tiền ước/duyệt BT** (`bt`, format `fmtMBC`) · **Đã giải quyết** (`daGQ`) · **Chưa giải quyết** (`chuaGQ`) · **Tỷ lệ giải quyết** (`tyLeGQVu`) — kèm hàng `tfoot` **TỔNG** |
| `gdv`, `diaban`, `nv`, `trangthai` | Cần GQ · Đã GQ · Tỷ lệ GQ · Đang tồn · Tồn >45 · Tồn ≥90 · Tỷ lệ giải ngân · Cảnh báo (bộ cột tiến độ tồn, giữ nguyên) |

- ⚠️ Hai công thức tỷ lệ giải quyết **khác mẫu số, cùng tồn tại trong `computeGroupStat`**, không được trộn lẫn:
  - `tyLeGQ = daGQ / tongCanGQ` — chuẩn báo cáo tiến độ (tồn năm trước + PS năm nay), dùng cho GĐV/Địa bàn/Nghiệp vụ/Trạng thái.
  - `tyLeGQVu = daGQ / total`, `chuaGQ = total − daGQ` — góc nhìn theo số vụ phát sinh của nhóm, dùng cho Hãng xe/Gara/Mức tiền để 3 cột Đã GQ + Chưa GQ + Tổng số vụ luôn khớp nhau.
- Với `hangxe`/`garage`, biểu đồ thứ 2 cũng đổi theo (`vuMode` trong `renderDashboard`): 2 cột **Đã giải quyết / Chưa giải quyết (số vụ)** thay cho cặp Tỷ lệ GQ % / Tỷ lệ tồn/PS % — để chart không lệch nghĩa với bảng.
- **Chiều cao bảng chi tiết** = đúng chiều cao `.chart-card` cùng hàng, do `syncDashTableHeight()` gán `style.height` sau khi vẽ chart (và khi `switchTab('dashboard')`, khi `resize` — debounce 120ms). Điều kiện để đo đúng: `#tab-dashboard .chart-row{align-items:start}` (không có nó, grid kéo giãn 2 ô bằng nhau → đo ra chiều cao đã bị bảng đẩy lên), và hàm **thoát sớm khi tab đang `display:none`** (offsetHeight = 0 → bảng cao 0px). Màn hình ≤800px `.chart-row` xếp dọc nên dùng chiều cao cố định 420px.
- Bảng cuộn trong `.dash-table-scroll` (`flex:1;min-height:0;overflow:auto`), `thead` sticky top + `tfoot` sticky bottom, scrollbar tuỳ biến màu cyan cùng tông tab. Table trong khung này dùng `border-collapse:separate` — bắt buộc, vì `collapse` làm mất viền ô khi sticky.
- **Không đặt dòng chú thích dưới bảng** (đã gỡ 09/2026) — mỗi dòng chú thích ăn mất ~2 dòng danh mục. Thông tin phụ đặt ở: tiêu đề `<h3>` (ngưỡng lọc của Hãng xe/Gara), pill `.dash-info`, hoặc `title=` tooltip của ô (vd bình quân/vụ tính cả HS chưa ước).
- **Co cột tự động — bảng không có thanh cuộn ngang** (09/2026): `.dash-table-scroll` đặt `overflow-x:hidden`; tiêu đề cột bỏ `white-space:nowrap` (wrap ở khoảng trắng, `overflow-wrap:break-word`) còn ô số giữ `nowrap`. `fitDashCols(card)` đo `table.scrollWidth > scroll.clientWidth` rồi thêm dần các mức **cộng dồn** `dash-narrow-1…5` (giảm padding ngang 10→2px, rồi cỡ chữ) và cuối cùng `dash-wrap-num` + `dash-break-any`. Cỡ chữ của các mức narrow đặt bằng **`em` trên `thead/tbody/tfoot`** để nhân dồn với `.dash-dense-*` (đặt `rem` trên `table`) thay vì ghi đè nhau. ⚠️ Không bao giờ cho bẻ giữa dãy số (`dash-break-any` chỉ áp cho `th` và `td:first-child`) — "927" tách thành "92/7" gây đọc sai. Thứ tự gọi trong `syncDashTableHeight()`: `fitDashCols` → `fitDashRows` → `fitDashCols` (co dòng cũng đổi cỡ chữ nên phải đo lại bề ngang). Đo thật: 1600px → `narrow-1`, 1280px → `narrow-2`, 1024px → mức cuối; `overflowX = 0` ở cả 7 tiêu chí.
- **Lưới kẻ bảng chi tiết** (09/2026): kẻ ngang + dọc cho mọi ô, màu `--grid:#cbd5e1`; viền ngoài khung, kẻ phải của **cột nhãn** và đường dưới `thead`/trên `tfoot` dùng `--grid-strong:#94a3b8` (2px, qua `box-shadow:inset` vì ô sticky). Dòng cuối `tbody:last-child` bỏ kẻ dưới để không chồng viền ngoài (bảng GĐV/Địa bàn/Nghiệp vụ/Trạng thái không có hàng TỔNG). Hai biến `--grid`/`--grid-strong` khai báo ngay trên `.dash-table-scroll`.
- **Co dòng tự động**: `fitDashRows(card)` chọn mức thấp nhất trong `DASH_DENSE` = `dash-dense-1/2/3` (giảm dần padding → font → line-height + badge) sao cho khung hiện được `target = min(số dòng, DASH_MIN_ROWS=10)`. Bảng ít mục cũng được co để **hiện đủ không phải cuộn**. `dashVisibleRows()` trừ chiều cao `thead`/`tfoot` sticky và 4px biên khi tính.
- ⚠️ `syncDashTableHeight()` phải chạy **lại sau `document.fonts.ready`** (cờ `_dashFontsBound`): lần render đầu webfont Be Vietnam Pro chưa tải xong, `tr.offsetHeight` đo hụt → chọn nhầm mức co quá nhẹ (đo thật: 11,26 dòng lúc chưa có font nhưng chỉ hiện 9 dòng sau khi font vào).
- Với `mucTien` (`moneyMode` trong `renderDashboard`), **cả 2 chart đầu đổi**: chart 1 = **Tổng số vụ theo mức tiền** (thay biểu đồ bucket ngày), chart 2 = **Số tiền bình quân/vụ (triệu đồng)**. Không gộp số vụ và số tiền vào cùng một chart — hai đại lượng lệch bậc độ lớn sẽ làm cột bẹp. Chart donut thứ 3 (cơ cấu tiền ước/duyệt BT) giữ nguyên.

## Trợ lý ảo GĐV (popup "💬 Trợ lý GĐV")

Popup hỏi–đáp quy trình giám định – bồi thường XCG của PTI và tra hồ sơ trong dữ liệu đang tải. **Chạy offline, không gọi AI/Internet** (phương án A: tra cứu bộ tri thức soạn sẵn). Không phải tab — **không** thêm vào `switchTab()`/thanh tab.

- **Vị trí DOM**: `#tl-fab` (nút nổi) + `#tl-panel` (khung chat) nằm **bên trong `#dashboard`**, sau `<footer>` → chỉ hiện khi dashboard hiện (ẩn ở màn đăng nhập/upload/loading). `position:fixed`, z-index 1000/1001 (> topbar 100 > thanh tab 90). Màn hình ≤600px: panel phủ toàn màn hình, `#dashboard.tl-open` ẩn nút nổi.
- **Logo robot AI** (09/2026): SVG vẽ 1 lần trong `<symbol id="tl-bot-art">` (ngay sau `#tl-fab`), dùng lại bằng `<svg class="tl-bot"><use href="#tl-bot-art"/></svg>` ở nút nổi và header popup. Mắt chớp + đèn ăng-ten đổi màu bằng SMIL `<animate>` (chạy được qua `<use>`, CSS thì không); nút nổi nhún nhẹ `tlBob`, rung `tlWiggle` khi hover, tắt khi `prefers-reduced-motion`.
- **Điện thoại ≤600px** (09/2026): panel phủ toàn màn theo `visualViewport` (`tlFitViewport()` gán `--tl-vh`/`--tl-top` → khung co lại khi bàn phím bật, ô nhập không bị che); ô nhập `font-size:16px` (nhỏ hơn thì iOS tự phóng to trang); không tự focus ô nhập khi mở. Bảng trong câu trả lời: `tlFitTables()` chuyển sang **dạng thẻ** (`table.tl-stack`, mỗi dòng 1 thẻ, mỗi ô "nhãn cột : giá trị" qua `data-label` do `tlLabelTable()` gắn + bọc `span.tl-cv`) khi bảng tràn ngang hoặc có ≥3 cột và ô chữ >45 ký tự; bảng 2 cột ngắn giữ dạng bảng. Chạy lại khi resize/xoay màn hình. Máy tính không đổi.
- **Hỏi bằng giọng nói** (09/2026): nút micro `#tl-mic` giữa ô nhập và nút Gửi, dùng Web Speech API (`SpeechRecognition || webkitSpeechRecognition`, `lang='vi-VN'`, `interimResults`). Trình duyệt không hỗ trợ (Firefox) → nút ẩn. Đang nghe: nút đỏ nhấp nháy, chữ tạm hiện trong ô nhập; nói xong tự gửi qua `tlAsk()`. `tlVoiceNorm()` ghép biển số đọc rời ("14 A 123 chấm 45" → `14A12345`) và bỏ dấu câu cuối. Lỗi quyền micro/mạng/không có micro → tin nhắn hướng dẫn (không lưu vào lịch sử). Đóng popup/Esc khi đang nghe → `tlVoiceCancel()` huỷ, không gửi. ⚠️ Chrome/Edge gửi **âm thanh** lên máy chủ nhận dạng của trình duyệt (cần Internet) — phần trả lời vẫn tra offline; trang phải chạy qua https (GitHub Pages) hoặc file:// mới xin được quyền micro. Kiểm thử headless phải giả lập **cả** `SpeechRecognition` lẫn `webkitSpeechRecognition` (Chrome có sẵn bản không tiền tố).
- **Bộ tri thức**: `assets/tro-ly-gdv-kb.js`, nạp bằng `<script src>` ngay trước script chính. Khai báo `TL_META`, `TL_GROUPS` (10 nhóm), `TL_FORMS` (73 biểu mẫu BM.PTI.XCG.20.xx + NVXE039.01.xx), `TL_SLA_B4` (thời hạn Bước 4 theo số tiền), `TL_STATUS` (trạng thái phần mềm → bước quy trình + việc cần làm), `TL_KB` (116 mục). Thiếu file → trợ lý vẫn tra được hồ sơ.
- **Nguồn nội dung (ưu tiên quy trình PTI)**: QT giải quyết YCBT PTI.XCG.20 (QĐ 20/12/2024) + phụ lục PL.PTI.XCG.20.01–20.18; Quy tắc VCX ô tô QĐ 109/QĐ-PTI ngày 23/09/2025 (hiệu lực 14/10/2025); NĐ 67/2023/NĐ-CP (trích theo PL.20.12); hướng dẫn mở logic, luồng hủy HS, mẫu trình giá PTI QN. Bản gốc (phần lớn là PDF scan) nằm trong `docs/` — **không** có trên trang web.
- **Mục TL_KB**: `id`, `g` (nhóm), `q` (câu hỏi chuẩn), `k` (từ khoá/cụm đồng nghĩa), `a` (trả lời — định dạng rút gọn: `- ` gạch đầu dòng, `|a|b|` bảng, `!! ` khung lưu ý, `**đậm**`), `s` (nguồn — **bắt buộc**), `r` (id liên quan), `v:0` (nội dung tham khảo), `x` ('forms' | 'status' | 'setgdv' → engine nối thêm bảng động).
- ⚠️ **Không đưa họ tên, SĐT, email cán bộ vào bộ tri thức** — file nằm cùng trang web (GitHub Pages công khai), ai mở trang cũng đọc được (đăng nhập của trang chỉ là kiểm tra phía trình duyệt).
- **Thứ tự trả lời** trong `tlAsk(q)`: `tlSmallTalk` (chào/cảm ơn) → `tlAnswerData` (biển số/HSBT/tồn) → `tlAnswerForm` (mã mẫu) → `tlAnswerKB`.
- **Tìm kiếm** (`tlSearch`): `tlNorm` = `normText` bỏ dấu + chỉ giữ chữ/số (giữ dấu chấm giữa 2 chữ số, vd `20.35`) + gộp **"tổn thất" → `tonthat`** (tránh lẫn với "tồn" sau khi bỏ dấu); bỏ stopword `TL_STOP`; mở rộng viết tắt `TL_ABBR` (tnds, vcx, nt3, gdv, bt…). Điểm = cụm từ khoá khớp nguyên cụm (`2 + 1.5×số từ`; cụm nằm trọn trong cụm dài hơn cũng khớp thì chỉ tính cụm dài) + từ đơn có trọng số **IDF** (khớp câu hỏi ×1.2, từ khoá ×0.8, nội dung ×0.2); khớp đúng câu hỏi chuẩn +100. Dưới `TL_MIN_SCORE = 4.5` → trả "chưa tìm thấy" + gợi ý, **không tự suy đoán quy định**.
- **Tra dữ liệu** (`tlAnswerData`, đọc `RAW`): biển số (`\d{2}[A-Z]{1,2}\d{4,6}` sau `normPlate`, chấp nhận "14A 123.45"); số HSBT dạng đầy đủ `…/BT/…` hoặc 5–7 số **bắt đầu bằng 0** (số ngắn không khớp HSBT → thử như một phần biển số); "tra/tìm <mảnh số>" → khớp một phần cả hai. Thẻ hồ sơ hiển thị mốc ngày gần nhất + bước quy trình theo `TL_STATUS` + thời hạn Bước 4 theo `Tiền ước/duyệt BT`. "Hồ sơ tồn của <mã/tên GĐV>", "hồ sơ của tôi", "tồn ≥90 ngày" (`tlThreshold`: mốc 90 luôn hiểu ≥90), "tổng quan tồn". Câu có "tính thế nào/là gì/cách tính…" → chuyển sang bộ tri thức. Quy ước tồn **giống `computeStats()`** (`parseTon`, `isResolved`, >45, ≥90) — đã đối chiếu khớp 1.367 / 194 / 38 / 9 với dữ liệu 07/2026.
- **CSS**: khối `.tl-*` cuối `<style>`. Bảng trong khung chat phải ghi đè CSS chung `th{text-transform:uppercase;white-space:nowrap}` và `tr:last-child td{border-bottom:none}`; `tlPush` tự bọc `<table>` trong `.tl-tbl` (cuộn ngang, không tràn popup). Ô bảng dùng `overflow-wrap:normal` (tránh ngắt giữa mã GĐV "TUNG|HX"); đoạn văn dùng `anywhere` (số HSBT dài).
- **Sự kiện**: nút trong khung chat dùng `data-tl-act` (kb | grp | ask | rec | open | setgdv) + 1 listener uỷ quyền trên document — không nhúng nội dung người dùng vào `onclick`. Esc đóng popup. "Mở ở tab Tra cứu tiến trình" gọi `switchTab('search')` rồi điền ô và `doSearchHSBT()`.
- **Bổ sung nội dung**: thêm mục vào `TL_KB` (id không trùng, ghi `s`), thêm từ khoá theo cách GĐV hay hỏi, rồi kiểm thử lại: chạy script chính trong Node `vm` (DOM giả lập, RAW từ Dulieu.xlsx) và gọi `tlSearch(q)` với bộ câu hỏi mẫu — mốc 09/2026: 105/105 câu chuẩn + 24/24 câu diễn đạt mới đúng, câu lạc đề đều < 4.5. Giao diện điện thoại kiểm bằng Chrome headless chụp trang nhúng trong iframe 390px (Chrome desktop có độ rộng cửa sổ tối thiểu nên `--window-size=390` không mô phỏng đúng).

## Cấu hình Địa bàn (dùng cho khối Infographic trong tab Tổng quan)

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
| **Google Drive** | Ưu tiên `fetch` bản CSV **Xuất bản lên web** (`/pub?gid=…&single=true&output=csv`); lỗi/chưa xuất bản → dự phòng JSONP (`gviz/tq`, callback `ptiGvizCb`) kèm alert cảnh báo |
| **Upload file** | Kéo thả hoặc chọn file `.xlsx` từ máy tính |

- Google Drive file ID: `1KqAQmNh9W-C8MsbWuYrywnNouGC4t2ISwRMa7oYH4_0` · Sheet GID: `101924388` (cố định, không có ô nhập URL)
- File phải chia sẻ "Bất kỳ ai có liên kết" mới tải được
- Hàm tải: `loadFromGoogleDrive()` — luôn dùng `GDRIVE_FILE_ID`, không đọc input từ người dùng. Luồng: fetch CSV xuất bản → `XLSX.read(text,{type:'string',raw:true})` → `_applyDriveRaw(cols)`; nếu fetch/parse lỗi → `_loadDriveViaGviz(fileId)` với cờ `window.__driveViaGvizFallback=true` → `_processGvizData` → `_applyDriveRaw`. Lỗi xử lý chung đi qua `_driveFail(msg)`
- ⚠️ **Vì sao không chỉ dùng gviz (09/2026)**: gviz tự đoán kiểu mỗi cột theo các hàng đầu; cột bị đoán là `number` sẽ trả `null` cho mọi ô dạng chữ (Sheet locale VN giữ `"2,619,000"` là chữ). Thực tế mất 1497/1914 ô `Tiền BT đã trả cho GR` + ô tiền ở `Tiền giảm trừ BT`, `Tiền chia sẻ rủi ro`, `Tiền cứu hộ`, `Tiền TƯ cho KH`, `Tiền BT đã trả cho KH` → KPI Đã chi trả hiện 39.340đ thay vì 15,2 tỷ. Các tham số `range`/`select` không ép được kiểu ổn định.
- ⚠️ `raw:true` khi parse CSV là **bắt buộc** — không có nó SheetJS đổi `"11/09/2026"` thành ngày kiểu Mỹ (tháng/ngày đảo)
- Không dùng `/export?format=csv`: dữ liệu đúng nhưng bước redirect 307 thiếu header CORS → trình duyệt chặn (đã thử Chrome headless từ file://)
- Sheet đã bật **Tệp → Chia sẻ → Xuất bản lên web** (09/2026: sheet `XCG05_HSBT`, CSV, tự động xuất bản lại khi thay đổi). ID xuất bản lưu ở hằng `GDRIVE_PUB_ID` (`2PACX-…`), URL `https://docs.google.com/spreadsheets/d/e/${GDRIVE_PUB_ID}/pub?gid=${GDRIVE_GID}&single=true&output=csv`. Dạng `/d/${GDRIVE_FILE_ID}/pub?...` **không dùng được** (401). Nếu người dùng dừng xuất bản rồi xuất bản lại, ID `2PACX-` có thể đổi → phải cập nhật hằng này. Bản xuất bản có thể trễ vài phút so với Sheet.
- ⚠️ CSV xuất bản **chỉ tải được khi trang chạy qua http/https** (GitHub Pages `https://chinhnhpti013.github.io/xcg-dashboard/`): bước redirect 307 chỉ trả `Access-Control-Allow-Origin` cho Origin thật, không cho `Origin: null` của file:// → mở `index.html` trực tiếp trên máy sẽ rơi về gviz (có alert giải thích). Đã kiểm tra bằng Chrome headless cả 2 trường hợp.
- ⚠️ URL gviz **bắt buộc** có `&headers=1` để gviz đọc hàng đầu làm tên cột (thiếu tham số này → cột trả về dạng A, B, C, toàn bộ số liệu = 0)
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

Trợ lý GĐV dùng thêm 2 key riêng (không bị "↩ Tải file khác" xoá): `pti_ai_log` (hội thoại, tối đa 40 tin, HTML đã render) và `pti_ai_gdv` (mã "GĐV của tôi").

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

| # | Tab | Màu gradient |
|---|-----|-------------|
| 1 | 🎯 Dashboard động | `#22d3ee → #0e7490` (cyan) |
| 2 | 📊 Tổng quan | `#60a5fa → #1d4ed8` (xanh dương) |
| 3 | 👤 Theo GĐV | `#34d399 → #047857` (xanh lá) |
| 4 | 📋 Báo cáo XO | `#c084fc → #6d28d9` (tím) |
| 5 | 💡 Đề xuất cải tiến CLDV | `#fb7185 → #be123c` (hồng đỏ) |
| 6 | 🔍 Tra cứu tiến trình | `#fbbf24 → #b45309` (vàng cam) |

**Nền nội dung tab (`.tab-pane`)**: mỗi tab có nền gradient pastel dịu cùng tông màu nút tab (xanh dương / xanh lá / tím / cyan / hồng nhạt), bo góc 16px, viền trắng mờ.

**Thanh tab dính dưới header (09/2026)**: `.tabs` có `position:sticky; top:64px; z-index:90` — chỉ bật trong `@media(min-width:601px)`.
- `top:64px` = đúng `height` cố định của `.topbar`; **nếu đổi chiều cao topbar phải sửa đồng thời giá trị này**.
- `z-index:90` < `.topbar` (100) để thanh tab trượt xuống *dưới* topbar, không đè lên.
- Nền khi sticky nâng lên `rgba(255,255,255,.9)` (mặc định `.55`) để nội dung cuộn phía sau không lộ qua.
- **Không bật sticky ở mobile ≤600px**: topbar mobile dùng `height:auto` + `flex-wrap:wrap` nên chiều cao thay đổi, chốt cứng `top` sẽ lệch/che mất thanh tab.
- Lưu ý: không thêm `overflow` (hidden/auto/scroll) cho `body`, `#dashboard` hay `.content` — sẽ làm hỏng `position:sticky` của thanh tab.

**Khoảng cách dọc (09/2026)**: đã thu hẹp để nhường không gian cho vùng dữ liệu — `.content` padding-top `24px → 10px` (tablet `8px`, mobile `6px`), `.tabs` margin-bottom `24px → 12px` (mobile `8px`).

**Thanh lọc chung đã bị xoá (09/2026)** — 3 bộ lọc GĐV / Nghiệp vụ / Trạng thái cùng `getFiltered()`, `buildGdvFilter()` và toàn bộ CSS `.filter-bar` đã gỡ bỏ. `renderAll()` nay tính thẳng `computeStats(RAW)`; muốn lọc/cắt lát dữ liệu thì dùng tab **Dashboard động** (7 tiêu chí nhóm) hoặc tab **Tra cứu tiến trình**. Số hồ sơ hiển thị ở pill `#record-count` (class `.topbar-count`) trong khối `.topbar-right` của topbar, cạnh nút "↩ Tải file khác".

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
