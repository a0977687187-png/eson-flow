// 跟 Supabase 溝通的那一層，外加登入把關與衍生值計算。
// 沒有自己的後端了——網頁直接連 Supabase，所以「誰能讀寫」完全靠資料庫的 RLS。
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const CFG = window.ESON_CONFIG || {};
export const configured = Boolean(CFG.url && CFG.anonKey);
export const db = configured ? createClient(CFG.url, CFG.anonKey) : null;

// ── 衍生值 ──────────────────────────────────────────────────
// 2026-09-09 改成做法主檔之後，狀態（待開工／生產中／完成）、不良合計、良率
// 全部拿掉——那是「這一批做得如何」，做法主檔沒有批次，算不出也沒意義。
// 剩下的只有「這筆做法記得多完整」與「走過哪些站」。
//
// 2026-09-10 完整度改算「這張單問的問題，答完了幾成」。
// 選項欄一律補了「無」，所以「這個產品沒有那道製程」勾一下無就算答過，
// 不必為了衝 100% 去亂填。留白才叫沒答。
//
// 一定要有答案的＝下面這些身分／規格欄，加上表上每一個帶選項的欄位、
// 每一個加工站的「經過」。尺寸欄（螺溝 ∩、圓孔…）不算——沒有的產品
// 本來就填不出東西，硬要算會永遠差那幾趴。
const REQUIRED = ['cust', 'mold', 'spec', 'slots', 'mat', 'stack',
  'skew', 'press', 'boxtype', 'perbox', 'shipto', 'packway'];

// fields.js 是一般 script，FORM 落在全域語彙環境，module 直接用名字讀得到。
// 但 db.js 有可能被單獨引用，所以包一層，讀不到就退回只算 REQUIRED。
const formOf = kind => {
  try { return (FORM && FORM[kind]) || []; } catch (e) { return []; }
};

// 這張單問了哪些一定要有答案的問題：[{k, l}]
export function askedOf(kind) {
  const items = formOf(kind);
  const out = [], seen = new Set();
  const add = (k, l) => { if (!seen.has(k)) { seen.add(k); out.push({ k, l }); } };
  for (const i of items) {
    if (i.op === 'field' && (i.list || i.listName || REQUIRED.includes(i.k))) add(i.k, i.l);
  }
  if (!out.length) REQUIRED.forEach(k => add(k, k));
  const st = (items.find(i => i.op === 'stations') || { list: [] }).list;
  st.forEach((s, i) => add('st' + i + '_pass', s.name.replace(/\s/g, '')));
  return out;
}

const answered = (d, k) => {
  if (String(d[k] == null ? '' : d[k]).trim() !== '') return true;
  // 舊資料的加工站「不適用」是另一個布林欄位，仍要認得
  return k.endsWith('_pass') && Boolean(d[k.slice(0, -5) + '_na']);
};

export function derive(d, kind) {
  const q = askedOf(kind);
  const missing = q.filter(x => !answered(d, x.k)).map(x => x.l);
  const complete = q.length
    ? Math.round((q.length - missing.length) / q.length * 100) : 0;

  // 加工站現在只剩「經過 有/無」與設備參數。勾「無」就是不走這一站。
  const stepsUsed = [];
  for (let i = 0; i < 12; i++) {
    const pass = d['st' + i + '_pass'];
    const na = Boolean(d['st' + i + '_na']);        // 舊資料用過的欄位，仍要認得
    const param = String(d['st' + i + '_eq'] || '').trim();
    if (na || pass === '無') continue;
    if (pass === '有' || param) stepsUsed.push(i);
  }
  return { complete, missing, stepsUsed };
}

const shape = r => ({
  no: r.no, kind: r.kind, created: r.created_at, updated: r.updated_at,
  data: r.data || {}, ...derive(r.data || {}, r.kind),
});

// ── 同一個成品料號，做法卻不一樣 ────────────────────────────
// 一個成品料號就是一種做法。同號不同做法，一定有一邊是錯的，
// 或是這根本該分成兩個料號——不能默默存下去，要當場標出來。
//
// 比對時「空白」與「無」當同一件事：一邊留白、一邊勾無，那是填寫習慣不同，
// 不是做法不同。備註是自由文字、客戶料號是對方的編號，都不影響怎麼做，不比。
const SKIP_CMP = new Set(['worem', 'custpn', 'pnfin']);
const norm = v => {
  const s = String(v == null ? '' : v).trim();
  return s === '無' ? '' : s;
};

export function recipeOf(d) {
  const out = {};
  for (const k of Object.keys(d || {})) {
    if (SKIP_CMP.has(k)) continue;
    const v = norm(d[k]);
    if (v) out[k] = v;
  }
  return out;
}

const sigOf = d => JSON.stringify(Object.entries(recipeOf(d)).sort());

const labelOf = (kind, k) => {
  const f = formOf(kind).find(i => i.op === 'field' && i.k === k);
  if (f) return f.l;
  const m = /^st(\d+)_(pass|eq)$/.exec(k);
  if (m) {
    const st = (formOf(kind).find(i => i.op === 'stations') || { list: [] }).list[+m[1]];
    const n = st ? st.name.replace(/\s/g, '') : '工站' + m[1];
    return m[2] === 'pass' ? n : n + ' 參數';
  }
  return k;
};

/** 兩筆做法差在哪：[{k, label, a, b}] */
export function diffRecipe(A, B, kind) {
  const a = recipeOf(A), b = recipeOf(B);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
    .filter(k => a[k] !== b[k])
    .map(k => ({ k, label: labelOf(kind, k), a: a[k] || '（無）', b: b[k] || '（無）' }));
}

/** 掃全表 → Map(單號 → {pn, clash, others, diff}) */
export async function conflicts() {
  const { data, error } = await db.from('travelers').select('no,kind,data');
  if (error) throw error;
  const byPn = new Map();
  for (const r of data) {
    const pn = String((r.data || {}).pnfin || '').trim();
    if (!pn) continue;
    if (!byPn.has(pn)) byPn.set(pn, []);
    byPn.get(pn).push(r);
  }
  const out = new Map();
  for (const [pn, rows] of byPn) {
    if (rows.length < 2) continue;
    const clash = new Set(rows.map(r => sigOf(r.data))).size > 1;
    for (const r of rows) {
      const others = rows.filter(x => x.no !== r.no);
      out.set(r.no, {
        pn, clash, others: others.map(x => x.no),
        diff: clash ? diffRecipe(r.data, others[0].data, r.kind) : [],
      });
    }
  }
  return out;
}

/** 這個成品料號還有誰在用（不含自己） */
export async function samePn(no, pn) {
  const s = String(pn || '').trim();
  if (!s) return [];
  const { data, error } = await db.from('travelers').select('no,kind,data').eq('pnfin', s);
  if (error) throw error;
  return data.filter(r => r.no !== no).map(r => ({ no: r.no, kind: r.kind, data: r.data || {} }));
}

// ── 查詢 ────────────────────────────────────────────────────
export async function list({ q, cust, kind } = {}) {
  let sel = db.from('travelers').select('*')
    .order('created_at', { ascending: false }).limit(500);
  if (cust) sel = sel.eq('cust', cust);
  if (kind) sel = sel.eq('kind', kind);
  // 多個關鍵字一律 AND，順序不拘——現場會打「將凱 90*48 22槽」這種
  for (const t of String(q || '').split(/\s+/).filter(Boolean)) {
    sel = sel.ilike('blob', '%' + t + '%');
  }
  const { data, error } = await sel;
  if (error) throw error;
  return data.map(shape);
}

export async function get(no) {
  const { data, error } = await db.from('travelers').select('*').eq('no', no).maybeSingle();
  if (error) throw error;
  return data ? shape(data) : null;
}

export async function create(kind, data) {
  // no 留空，由資料庫的觸發器發號——兩個人同時存也不會撞號
  const { data: row, error } = await db.from('travelers')
    .insert({ kind, data, no: '' }).select('no').single();
  if (error) throw error;
  return row.no;
}

export async function update(no, data) {
  const { error } = await db.from('travelers').update({ data }).eq('no', no);
  if (error) throw error;
}

export async function remove(no) {
  const { error } = await db.from('travelers').delete().eq('no', no);
  if (error) throw error;
}

// 主檔＝流動單累積出來的，不是預先建的
export async function meta() {
  const { data, error } = await db.from('travelers').select('kind, cust, mold, spec');
  if (error) throw error;
  const tally = key => {
    const m = new Map();
    for (const r of data) {
      const v = (r[key] || '').trim();
      if (v) m.set(v, (m.get(v) || 0) + 1);
    }
    return [...m].map(([v, n]) => ({ v, n })).sort((a, b) => b.n - a.n || a.v.localeCompare(b.v));
  };
  const byKind = { ST: 0, RO: 0 };
  for (const r of data) if (byKind[r.kind] != null) byKind[r.kind]++;
  return { customers: tally('cust'), molds: tally('mold'), specs: tally('spec'),
    byKind, total: data.length };
}

// 給畫面顯示「現在是誰登入的」。共用帳號時就是那組帳號。
let _email = '';
export const currentEmail = () => _email;

// ── 登入把關 ────────────────────────────────────────────────
// 沒登入的話蓋一層登入畫面。資料本身由 RLS 擋，這層只是不要讓人看到空畫面發呆。
export async function requireLogin() {
  if (!configured) {
    gate('<h2>尚未設定 Supabase</h2><p class="en">請先照 supabase/設定步驟.md 建好專案，'
       + '把 Project URL 與 anon key 填進 config.js</p>');
    return null;
  }
  const { data: { session } } = await db.auth.getSession();
  if (session) { _email = session.user?.email || ''; return session; }
  return new Promise(resolve => loginForm(resolve));
}

const ICON = {
  info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  login: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>',
  right: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
};

function gate(inner) {
  const el = document.createElement('div');
  el.id = 'gate';
  el.innerHTML = `<div class="box">
    <div class="strip">
      <div class="l"><span class="live"><span class="dot-live"></span>已連線</span>
        <span style="color:#334155">|</span>
        <span class="m">eson-flow · FM-PT-01 B4</span></div>
      <div class="m">ESON INDUSTRIAL MFG.</div>
    </div>
    <div class="cols">
      <div class="left">
        <div class="gbrand">
          <img class="wordmark" src="logo.png" width="222" height="71" alt="億新精機廠">
          <div>
            <span class="kicker">MES ROUTING</span>
            <h1>億新－製程查詢系統</h1>
          </div>
        </div>
        <p class="en">ESON FLOW · PRODUCTION ROUTING RECORD</p>
        <div class="two">
          <div class="c">
            <div class="top"><span class="code">ST</span><span class="where">靜子</span></div>
            <h3>靜子 ST 流動單</h3>
            <p>沖壓 → 靜子焊接 → 倒角 → 磨稜角／去毛邊 → 燒炖 → 包裝 → 入庫。</p>
          </div>
          <div class="c ro">
            <div class="top"><span class="code">RO</span><span class="where">轉子</span></div>
            <h3>轉子 RO 流動單</h3>
            <p>沖壓 → 假軸／鑄鋁 → 入軸心 → 清鋁屑 → 攪孔上漆 → 燒炖 → 包裝 → 入庫。</p>
          </div>
        </div>
        <div class="info">
          <div class="t">${ICON.info}<span>主檔會自己長出來</span></div>
          <p>客戶、模具、規格都不預先建檔，是現場每張流動單填進來累積的。等累積到三、五十張，再回頭看實際出現過哪些組合，那時候才有依據決定「同規格」該怎麼定義。</p>
        </div>
        <div class="lfoot">
          <a class="manual" href="help.html">
            <span>${ICON.book} 怎麼把紙本輸入系統？</span>${ICON.right}</a>
        </div>
      </div>
      <div class="right">${inner}</div>
    </div>
  </div>`;
  document.body.append(el);
  return el;
}

function loginForm(resolve) {
  const el = gate(`
    <div class="ghead">
      <div><h2>登入</h2><p>用公司給的共用帳號密碼</p></div>
    </div>
    <form id="lf">
      <div class="fld"><label for="le">帳號</label>
        <div class="wrap2">${ICON.user}
          <input type="email" id="le" autocomplete="username" required placeholder="eson@flow.local"></div></div>
      <div class="fld"><label for="lp">密碼</label>
        <div class="wrap2">${ICON.lock}
          <input type="password" id="lp" autocomplete="current-password" required></div></div>
      <div class="err" id="lerr"></div>
      <button class="btn dark lg" type="submit" style="justify-content:center">
        ${ICON.login}<span>登入系統</span></button>
    </form>
    <div class="gfoot"><p>ESON INDUSTRIAL MFG. CO., LTD.</p></div>`);

  const emailBox = el.querySelector('#le');
  emailBox.value = localStorage.getItem('eson-last-email') || '';
  (emailBox.value ? el.querySelector('#lp') : emailBox).focus();

  el.querySelector('#lf').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = el.querySelector('button[type=submit]');
    const err = el.querySelector('#lerr');
    btn.disabled = true; err.textContent = '';
    const email = emailBox.value.trim();
    const { data, error } = await db.auth.signInWithPassword({
      email, password: el.querySelector('#lp').value });
    if (error) {
      err.textContent = error.message.includes('Invalid')
        ? '帳號或密碼不對' : error.message;
      btn.disabled = false;
      return;
    }
    localStorage.setItem('eson-last-email', email);
    _email = email;
    el.remove();
    resolve(data.session);
  });
}

export async function logout() {
  await db.auth.signOut();
  location.reload();
}
