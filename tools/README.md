# tools/ — Kiểm thử bộ tri thức Trợ lý GĐV

Ba script Node (không cần cài gói ngoài) để kiểm tra `assets/tro-ly-gdv-kb.js`
sau mỗi lần thêm/sửa/gỡ mục. Chạy từ thư mục gốc dự án:

```bash
node tools/check-kb.js        # toàn vẹn dữ liệu
node tools/test-search.js     # công cụ tìm kiếm trả đúng mục
node tools/compare-search.js  # so trước/sau khi sửa để phát hiện hồi quy
```

| Script | Kiểm gì | Thoát mã 1 khi |
|--------|---------|----------------|
| `check-kb.js` | id không trùng · nhóm có trong `TL_GROUPS` · đủ `q`/`a`/`s`/`k` · `r:` trỏ tới id có thật · không nhóm rỗng · **không lộ email/SĐT** · nguồn không trỏ tới thư mục tài liệu đã xoá | có lỗi thật |
| `test-search.js` | 151/151 câu hỏi chuẩn khớp đúng mục của nó · các câu diễn đạt tự nhiên ra đúng mục · **mục quy trình PTI thắng mục tham khảo `v:0`** · câu lạc đề dưới `TL_MIN_SCORE` | có câu chưa đạt |
| `compare-search.js` | So kết quả `tlSearch` giữa bản đã commit và bản đang sửa | có câu **chuyển giữa hai mục cũ** (cần người xem, không phải lỗi) |

`kb-env.js` là phần dùng chung: nạp bộ tri thức + cắt đoạn engine trợ lý ra khỏi
`index.html` rồi chạy trong `vm` với DOM giả lập.

## Khi thêm mục mới vào TL_KB

1. Thêm mục (id không trùng, **bắt buộc có `s` — nguồn**), thêm từ khoá `k` theo cách GĐV hay hỏi thật.
2. `node tools/check-kb.js` → phải sạch.
3. Thêm 1–2 câu diễn đạt tự nhiên vào mảng `PHRASINGS` trong `test-search.js`, rồi `node tools/test-search.js`.
4. `node tools/compare-search.js` → đọc mục ③. Mục mới lấn mục quy trình PTI thì **thêm từ khoá cho mục PTI**, đừng hạ từ khoá của mục mới.
5. Cập nhật số mục và mốc kiểm thử trong `CLAUDE.md`.

## Lưu ý

- **Mốc cắt engine**: `kb-env.js` cắt `index.html` theo `function normText(` → `function normPlate(`
  và `const TL_LS_LOG=` → `function tlAsk(`. Đổi tên các hàm/hằng này trong `index.html`
  thì phải sửa 2 mốc đó, nếu không script báo lỗi ngay.
- **Hành vi đã biết, không phải hồi quy** (ghi trong `KNOWN` của `test-search.js`):
  câu "xe ngập nước giám định thế nào" trả `tn-dacbiet` thay vì `gd-ngapnuoc`
  (`gd-ngapnuoc` vẫn hiện ở gợi ý liên quan); "công thức nấu phở" trúng `dg-congthuc`
  vì từ khoá "công thức". Đừng chỉnh mục cũ để ép hai câu này.
- Script chỉ đọc file, không sửa gì trong `assets/` hay `index.html`.
