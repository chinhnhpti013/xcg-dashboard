/* So kết quả tlSearch TRƯỚC và SAU khi sửa bộ tri thức, để tách hồi quy thật
   khỏi hành vi vốn đã như vậy.

   Chạy:  node tools/compare-search.js            (so với bản đã commit ở HEAD)
          node tools/compare-search.js HEAD~3     (so với một commit khác)

   Bản "trước" lấy từ git nên không cần tự sao lưu file.
   Bộ câu hỏi = toàn bộ câu hỏi chuẩn của bản CŨ (mục mới chưa có ở bản cũ nên
   không so được) + các câu diễn đạt tự nhiên trong tools/test-search.js.

   Kết quả chia 3 loại, chỉ loại ③ cần đọc kỹ:
     ① câu hỏi chuẩn của mục vừa gỡ — đương nhiên đổi.
     ② câu nay trả về mục MỚI — đúng ý đồ khi bổ sung nội dung.
     ③ câu chuyển giữa hai mục CŨ — có thể là mục mới lấn chỗ, cũng có thể là
        cải thiện do thêm từ khoá. Phải tự xem từng câu rồi kết luận.
   Chỉ lệch điểm số mà cùng mục thắng là bình thường: IDF tính lại khi số mục đổi.

   Thoát mã 1 khi loại ③ khác rỗng — nghĩa là "có thay đổi cần người xem",
   KHÔNG phải "bộ tri thức hỏng". Đừng gắn thẳng vào hook chặn commit. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT, loadKb, topHit } = require('./kb-env');

const REF = process.argv[2] || 'HEAD';
const REL_KB = 'assets/tro-ly-gdv-kb.js';

let oldSource;
try {
  oldSource = execFileSync('git', ['show', `${REF}:${REL_KB}`],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  console.error(`Không lấy được ${REL_KB} tại ${REF} từ git.\n` +
    'Kiểm tra lại ref, hoặc bản cũ chưa từng được commit.');
  process.exit(2);
}

const before = loadKb({ kbSource: oldSource, withEngine: true });
const after = loadKb({ withEngine: true });

// Câu hỏi chuẩn của bản CŨ + các câu diễn đạt trong bộ kiểm thử
const queries = before.TL_KB.map(e => e.q);
const testSrc = fs.readFileSync(path.join(__dirname, 'test-search.js'), 'utf8');
for (const m of testSrc.matchAll(/^\s*\['([^']+)',\s*'[^']+'\],\s*$/gm)) queries.push(m[1]);
for (const m of testSrc.matchAll(/^\s*'([^']{8,})',\s*$/gm)) queries.push(m[1]);

const oldIds = new Set(before.TL_KB.map(e => e.id));
const newIds = new Set(after.TL_KB.map(e => e.id));
const removed = [...oldIds].filter(id => !newIds.has(id));
const added = [...newIds].filter(id => !oldIds.has(id));

const fmt = (h) => h ? `${h.id} [${h.score.toFixed(1)}]` : '—';

// Chia thay đổi làm 3 loại: chỉ loại thứ 3 mới đáng xem
const goneQ = [];   // câu hỏi chuẩn của mục vừa bị gỡ — tất nhiên phải đổi
const toNew = [];   // mục MỚI thắng — đúng ý đồ khi bổ sung nội dung
const regress = []; // chuyển giữa hai mục CŨ — mục mới đã lấn chỗ, cần xem
for (const q of [...new Set(queries)]) {
  const a = topHit(before, q), b = topHit(after, q);
  if ((a && a.id) === (b && b.id)) continue;
  const rec = { q, a, b };
  if (a && removed.includes(a.id)) goneQ.push(rec);
  else if (b && added.includes(b.id)) toNew.push(rec);
  else regress.push(rec);
}

console.log(`Bản cũ: ${REF} (${before.TL_KB.length} mục)  →  bản hiện tại (${after.TL_KB.length} mục)`);
console.log(`Đã so ${new Set(queries).size} câu hỏi.`);
if (removed.length) console.log(`Mục đã gỡ (${removed.length}): ${removed.join(', ')}`);
if (added.length) console.log(`Mục mới  (${added.length}): ${added.join(', ')}`);

console.log(`\n① ${goneQ.length} câu thuộc mục đã gỡ (đương nhiên đổi, không cần xem)`);
console.log(`② ${toNew.length} câu nay trả về mục MỚI (đúng ý đồ bổ sung):`);
for (const c of toNew) console.log(`     "${c.q}" → ${fmt(c.b)}  (cũ: ${fmt(c.a)})`);

if (!regress.length) {
  console.log('\n③ ✓ 0 hồi quy — không câu nào chuyển giữa hai mục cũ.');
} else {
  console.log(`\n③ ⚠ ${regress.length} câu chuyển giữa hai mục CŨ — kiểm tra xem mục mới có lấn chỗ không:`);
  for (const c of regress) console.log(`     "${c.q}"\n        cũ : ${fmt(c.a)}\n        mới: ${fmt(c.b)}`);
}

process.exit(regress.length ? 1 : 0);
