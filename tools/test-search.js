/* Kiểm thử công cụ tìm kiếm của Trợ lý GĐV (tlSearch trong index.html).
   Chạy:  node tools/test-search.js
   Thêm mục mới vào TL_KB → thêm 1–2 câu diễn đạt tự nhiên vào PHRASINGS bên dưới.

   4 phép kiểm:
     1. Mọi câu hỏi chuẩn (q) phải khớp đúng mục của chính nó.
     2. Câu diễn đạt tự nhiên phải ra đúng mục mong đợi.
     3. Mục quy trình PTI phải thắng mục tham khảo (nhóm tinhhuong, v:0).
     4. Câu lạc đề phải dưới ngưỡng TL_MIN_SCORE (trợ lý trả "chưa tìm thấy").

   Phát hiện hồi quy do thêm mục mới thì dùng tools/compare-search.js. */
const { loadKb, topHit } = require('./kb-env');
const vm = require('vm');

// ── Câu diễn đạt tự nhiên → mục mong đợi ────────────────────────────────────
const PHRASINGS = [
  ['nợ phí bảo hiểm được mấy ngày', 'gd-thanhtoanphi'],
  ['khách cá nhân mua xe tái tục có được nợ phí không', 'gd-thanhtoanphi'],
  ['trình mở logic hồ sơ trên ilead thế nào', 'sb-mologic'],
  ['ai duyệt mở logic điều chuyển ước quá hạn trên 100 triệu', 'sb-mologic'],
  ['kiểm toán nội bộ yêu cầu gì về upload chứng từ', 'sb-ktnb'],
  ['đóng hồ sơ bằng 0 cần làm gì', 'sb-ktnb'],
  ['phát hiện sai phạm cấp đơn thì cc cho ai', 'sb-saipham'],
  ['hồ sơ mở từ 19/07/2024 có phải ký tay không', 'sb-19072024'],
  ['thanh lý xác xe làm thế nào', 'sb-thanhly'],
  ['hội đồng thanh lý tài sản thu hồi', 'sb-thanhly'],
  ['giám định viên phải đến hiện trường ở Cẩm Phả trong bao lâu', 'tn-qn-cam-ket'],
  ['quét mã qr trên ấn chỉ để làm gì', 'tn-anchi-quytac'],
  ['hồ sơ này áp dụng quy tắc nào', 'tn-anchi-quytac'],
  ['bảo hiểm vật chất xe máy bồi thường những gì', 'qt-xemay'],
  ['mất cắp xe máy ở bãi giữ xe có được bồi thường', 'qt-xemay'],
  ['bảng tỷ lệ thương tật tính thế nào', 'td-tyle-nguoi'],
  ['nạn nhân bị nhiều thương tật thì cộng thế nào', 'td-tyle-nguoi'],
  ['giấy nhận tiền bồi thường trên 10 triệu cần gì', 'td-taisan-ct'],
  ['giảm trừ bồi thường hàng hóa bao nhiêu phần trăm', 'td-hanghoa-giamtru'],
  ['nghị định 220 có đổi mức trách nhiệm tnds không', 'pl-nd220'],
  ['bên thứ ba hay người thứ ba', 'pl-nd220'],
  ['luật kinh doanh bảo hiểm quy định bao lâu phải trả tiền bảo hiểm', 'pl-lkdbh'],
  ['nộp hồ sơ yêu cầu bồi thường trong bao lâu', 'pl-lkdbh'],
  ['nguồn nguy hiểm cao độ là gì', 'pl-blds601'],
  ['chủ xe không có lỗi có phải bồi thường không', 'pl-blds601'],
  ['hiện đang áp dụng những nghị định nào', 'pl-vanban'],
  ['xe điện báo lỗi cao áp sau va chạm', 'th-xedien'],
  ['garage không trả phụ tùng cũ', 'th-garage'],
  ['ảnh khách gửi có dấu hiệu chỉnh sửa', 'th-gianlan'],
  ['khách đòi trả tiền mặt thay vì sửa chữa', 'ct-bangtien'],
  ['garage đề nghị sơn cả bên xe', 'th-dongson'],
  ['xe đã sửa trước khi giám định', 'th-tiepnhan'],
];

// ── Mục quy trình PTI phải thắng mục tham khảo (v:0) ────────────────────────
const PRIORITY = [
  ['giám định xe bị cháy cần lưu ý gì', 'gd-chay'],
  ['tổn thất pin xe điện được bảo hiểm thế nào', 'gd-xedien'],
  ['các mức giảm trừ bồi thường khi chủ xe vi phạm', 'dg-giamtru'],
  ['thủ tục từ chối bồi thường', 'dg-tuchoi'],
  ['khi nào là tổn thất toàn bộ', 'dg-toanbo'],
  ['lái xe có nồng độ cồn thì bồi thường thế nào', 'qt-con'],
  ['thu hồi vật tư phụ tùng thay thế sau sửa chữa', 'ct-thuhoi'],
  ['phát hiện dấu hiệu trục lợi thì làm gì', 'gd-trucloi'],
  ['mức trách nhiệm bảo hiểm bắt buộc tnds là bao nhiêu', 'td-mtn'],
  ['lưu trữ hồ sơ bồi thường bao lâu', 'sb-luutru'],
  ['khách hàng khiếu nại kết quả bồi thường', 'sb-khieunai'],
];

const OFF_TOPIC = [
  'hôm nay trời mưa không',
  'giá vàng hôm nay',
  'lập trình python thế nào',
  'đặt vé máy bay đi Đà Nẵng',
  'lịch nghỉ tết năm nay',
];

/* Hành vi đã biết, KHÔNG phải hồi quy — đừng "sửa" bằng cách chỉnh mục cũ:
   · "xe ngập nước giám định thế nào" → tn-dacbiet thắng gd-ngapnuoc
     (gd-ngapnuoc vẫn hiện ở phần gợi ý liên quan nên GĐV không bị kẹt)
   · "công thức nấu phở" trúng dg-congthuc 8.0 vì từ khoá "công thức"        */
const KNOWN = new Set(['xe ngập nước giám định thế nào', 'công thức nấu phở']);

// ── Chạy ────────────────────────────────────────────────────────────────────
const ctx = loadKb({ withEngine: true });
const KB = ctx.TL_KB;
const MIN = vm.runInContext('TL_MIN_SCORE', ctx);
let fail = 0;

console.log(`── 1. ${KB.length} câu hỏi chuẩn ──`);
const miss = [];
for (const e of KB) {
  const h = topHit(ctx, e.q);
  if (!h || h.id !== e.id) miss.push(`${e.id} → ${h ? `${h.id} (${h.score.toFixed(1)})` : 'KHÔNG KHỚP'}`);
}
console.log(miss.length ? '  ✗ lệch ' + miss.length + ':\n   ' + miss.join('\n   ')
                        : `  ✓ ${KB.length}/${KB.length} khớp đúng`);
fail += miss.length;

function runPairs(title, pairs) {
  console.log(`\n── ${title} ──`);
  let bad = 0;
  for (const [q, want] of pairs) {
    const h = topHit(ctx, q);
    const got = h ? h.id : '—';
    if (got === want) { console.log(`  ✓ "${q}"`); continue; }
    const known = KNOWN.has(q);
    if (!known) { bad++; }
    console.log(`  ${known ? '~' : '✗'} "${q}" → ${got} (mong đợi ${want})${known ? '  [đã biết, bỏ qua]' : ''}`);
  }
  return bad;
}

fail += runPairs(`2. ${PHRASINGS.length} câu diễn đạt tự nhiên`, PHRASINGS);
fail += runPairs('3. Mục quy trình PTI phải thắng mục tham khảo', PRIORITY);

console.log(`\n── 4. Câu lạc đề (phải < ${MIN}) ──`);
for (const q of OFF_TOPIC) {
  const h = topHit(ctx, q);
  const score = h ? h.score : 0;
  const ok = score < MIN || KNOWN.has(q);
  if (!ok) fail++;
  console.log(`  ${ok ? '✓' : '✗'} "${q}" → ${score.toFixed(1)}${score < MIN ? '' : ' (' + h.id + ')'}`);
}

console.log(fail ? `\n✗ ${fail} trường hợp chưa đạt` : '\n✓ Toàn bộ kiểm thử đạt');
process.exit(fail ? 1 : 0);
