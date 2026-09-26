/* Kiểm tra tính toàn vẹn của bộ tri thức Trợ lý GĐV (assets/tro-ly-gdv-kb.js).
   Chạy:  node tools/check-kb.js
   Thoát mã 1 nếu có lỗi — dùng được trong hook/CI. */
const { loadKb } = require('./kb-env');

const ctx = loadKb();
const KB = ctx.TL_KB, GROUPS = ctx.TL_GROUPS, META = ctx.TL_META;

console.log('TL_META  :', JSON.stringify(META));
console.log('TL_GROUPS:', GROUPS.length, '|', GROUPS.map(g => g.id).join(', '));
console.log('TL_FORMS :', ctx.TL_FORMS.length, ' TL_STATUS:', ctx.TL_STATUS.length, ' TL_SLA_B4:', ctx.TL_SLA_B4.length);
console.log('TL_KB    :', KB.length, 'mục');

let err = 0;
const bad = (m) => { console.log('  ✗ ' + m); err++; };

// ── Trường bắt buộc, id không trùng, nhóm hợp lệ ──
const ids = new Set(), gids = new Set(GROUPS.map(g => g.id));
for (const e of KB) {
  if (!e.id) { bad('mục thiếu id: ' + JSON.stringify(e).slice(0, 80)); continue; }
  if (ids.has(e.id)) bad('id trùng: ' + e.id);
  ids.add(e.id);
  if (!gids.has(e.g)) bad(`${e.id}: nhóm '${e.g}' không có trong TL_GROUPS`);
  if (!e.q) bad(e.id + ': thiếu q (câu hỏi chuẩn)');
  if (!e.a) bad(e.id + ': thiếu a (câu trả lời)');
  if (!e.s) bad(e.id + ': thiếu s (nguồn) — bắt buộc để GĐV đối chiếu bản gốc');
  if (!Array.isArray(e.k) || !e.k.length) bad(e.id + ': thiếu từ khoá k');
}

// ── Tham chiếu chéo r: phải trỏ tới id có thật ──
for (const e of KB) for (const r of (e.r || [])) {
  if (!ids.has(r)) bad(`${e.id}: r trỏ tới id không tồn tại '${r}'`);
}

// ── Nhóm rỗng thì màn hình chào hiện mục trống ──
for (const g of GROUPS) {
  if (!KB.some(e => e.g === g.id)) bad(`nhóm '${g.id}' không có mục nào`);
}

// ── Không được lộ thông tin cá nhân: file này nằm trên GitHub Pages công khai ──
const PII = [
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/g, what: 'email' },
  { re: /\b0\d{2}[\s.]?\d{3}[\s.]?\d{3,4}\b/g, what: 'số điện thoại' }
];
for (const e of KB) {
  const t = (e.a || '') + ' ' + (e.s || '');
  for (const p of PII) {
    const m = t.match(p.re);
    if (m) bad(`${e.id}: có thể lộ ${p.what} → ${[...new Set(m)].join(', ')}`);
  }
}

// ── Nguồn không được trỏ tới thư mục tài liệu đã xoá (xem CLAUDE.md) ──
const GONE = /Thi dinh ky|docs\/Tien ich|Mau bieu-GD/;
for (const e of KB) if (GONE.test(e.s || '')) bad(`${e.id}: nguồn trỏ tới thư mục đã xoá → ${e.s}`);

console.log('\nSố mục theo nhóm:');
for (const g of GROUPS) {
  console.log(`  ${g.id.padEnd(10)} ${String(KB.filter(e => e.g === g.id).length).padStart(3)}  ${g.name}`);
}

console.log(err ? `\n✗ ${err} lỗi` : '\n✓ Không có lỗi');
process.exit(err ? 1 : 0);
