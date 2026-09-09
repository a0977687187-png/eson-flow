// 跟 Supabase 溝通的那一層，外加登入把關與衍生值計算。
// 沒有自己的後端了——網頁直接連 Supabase，所以「誰能讀寫」完全靠資料庫的 RLS。
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const CFG = window.ESON_CONFIG || {};
export const configured = Boolean(CFG.url && CFG.anonKey);
export const db = configured ? createClient(CFG.url, CFG.anonKey) : null;

// ── 衍生值（規格書 §6）──────────────────────────────────────
// 一律即時算，不存進資料庫。定義改了就改這裡，不用回頭修資料。
const COMPLETE_KEYS = ['wo', 'cust', 'mold', 'spec', 'slots', 'proddate',
  'press', 'done', 'boxtype', 'indate', 'inqty', 'pnfin'];

const num = v => {
  const m = String(v == null ? '' : v).match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
};

export function derive(d) {
  const status = d.indate ? '完成' : (d.proddate ? '生產中' : '待開工');
  const filled = COMPLETE_KEYS.filter(k => String(d[k] || '').trim() !== '').length;
  const complete = Math.round(filled / COMPLETE_KEYS.length * 100);

  // 靜子勾「不適用」＝不走；轉子勾「經過：無」＝不走。兩張單語意相反。
  const skipped = i => Boolean(d['st' + i + '_na']) || d['st' + i + '_pass'] === '無';

  let ng = num(d.ng);
  for (let i = 0; i < 12; i++) if (!skipped(i)) ng += num(d['st' + i + '_ng']);

  const outQ = num(d.done), inQ = num(d.inqty);
  const yieldPct = (outQ > 0 && inQ > 0) ? Math.round(inQ / outQ * 1000) / 10 : null;

  const stepsUsed = [];
  for (let i = 0; i < 12; i++) {
    const filledRow = ['dt', 'eq', 'done', 'ng', 'j'].some(c => d['st' + i + '_' + c]);
    if (!skipped(i) && (filledRow || d['st' + i + '_pass'] === '有')) stepsUsed.push(i);
  }
  return { status, complete, ngTotal: ng, yieldPct, stepsUsed };
}

const shape = r => ({
  no: r.no, kind: r.kind, created: r.created_at, updated: r.updated_at,
  data: r.data || {}, ...derive(r.data || {}),
});

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
  boxes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-4.5-2.7a2 2 0 0 0-2.06 0z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L18.5 10.8a2 2 0 0 0-2.06 0z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/></svg>',
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
        <span class="m">eson-flow · FM-PT-01 B3</span></div>
      <div class="m">億新精機</div>
    </div>
    <div class="cols">
      <div class="left">
        <div class="gbrand">
          <div class="logo">${ICON.boxes}</div>
          <div>
            <span class="kicker">MES ROUTING</span>
            <h1>製程流動單系統</h1>
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
