/* Nạp bộ tri thức Trợ lý GĐV + phần engine tìm kiếm của index.html vào một sandbox Node.
   Dùng chung cho check-kb.js, test-search.js, compare-search.js.

   Engine nằm lẫn trong <script> của index.html nên phải cắt theo 2 mốc:
     · normText  → normPlate      (hàm bỏ dấu dùng chung)
     · TL_LS_LOG → function tlAsk (toàn bộ tlNorm/tlExpand/tlBuildIndex/tlSearch/tlFmt)
   Đổi tên các hàm/hằng đó trong index.html thì phải sửa 2 mốc này. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const KB_PATH = path.join(ROOT, 'assets', 'tro-ly-gdv-kb.js');
const HTML_PATH = path.join(ROOT, 'index.html');

/** Cắt đoạn mã engine trợ lý ra khỏi index.html. */
function extractEngine(html) {
  const pick = (from, to) => {
    const i = html.indexOf(from);
    const j = html.indexOf(to, i < 0 ? 0 : i);
    if (i < 0 || j < 0) {
      throw new Error(`Không tìm thấy mốc cắt engine trong index.html: "${from}" → "${to}".\n` +
        'Nếu đã đổi tên hàm trong index.html, sửa lại 2 mốc ở tools/kb-env.js.');
    }
    return html.slice(i, j);
  };
  return pick('function normText(', 'function normPlate(') + '\n' +
         pick('const TL_LS_LOG=', 'function tlAsk(');
}

/** DOM giả lập tối thiểu để engine nạp được ngoài trình duyệt. */
function stubDom(ctx) {
  ctx.window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  ctx.window.addEventListener = () => {};
  ctx.window.removeEventListener = () => {};
  ctx.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} })
  };
  ctx.visualViewport = null;
  // Chrome có cả bản có và không có tiền tố — giả lập cả hai (xem CLAUDE.md, mục hỏi bằng giọng nói)
  ctx.SpeechRecognition = ctx.webkitSpeechRecognition = function () {};
}

/**
 * Nạp bộ tri thức (+ engine) vào sandbox.
 * @param {object} [opts]
 * @param {string} [opts.kbSource] Nội dung file KB; bỏ trống thì đọc assets/tro-ly-gdv-kb.js.
 * @param {boolean} [opts.withEngine] true = nạp thêm engine tìm kiếm của index.html.
 */
function loadKb(opts = {}) {
  const kbSource = opts.kbSource != null ? opts.kbSource : fs.readFileSync(KB_PATH, 'utf8');
  const ctx = vm.createContext({
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  });
  vm.runInContext('var window = this;', ctx);
  stubDom(ctx);
  vm.runInContext(kbSource, ctx, { filename: 'tro-ly-gdv-kb.js' });

  if (opts.withEngine) {
    vm.runInContext(extractEngine(fs.readFileSync(HTML_PATH, 'utf8')), ctx, { filename: 'engine.js' });
    vm.runInContext('tlBuildIndex();', ctx);
  }
  return ctx;
}

/** Trả về mục đứng đầu kết quả tlSearch, hoặc null. */
function topHit(ctx, q) {
  const r = ctx.tlSearch(q);
  return r.length ? { id: r[0].e.id, score: r[0].s, q: r[0].e.q } : null;
}

module.exports = { ROOT, KB_PATH, HTML_PATH, loadKb, topHit, extractEngine };
