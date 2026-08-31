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
  const { data, error } = await db.from('travelers').select('cust, mold, spec');
  if (error) throw error;
  const tally = key => {
    const m = new Map();
    for (const r of data) {
      const v = (r[key] || '').trim();
      if (v) m.set(v, (m.get(v) || 0) + 1);
    }
    return [...m].map(([v, n]) => ({ v, n })).sort((a, b) => b.n - a.n || a.v.localeCompare(b.v));
  };
  return { customers: tally('cust'), molds: tally('mold'), specs: tally('spec'), total: data.length };
}

// ── 登入把關 ────────────────────────────────────────────────
// 沒登入的話蓋一層登入畫面。資料本身由 RLS 擋，這層只是不要讓人看到空畫面發呆。
export async function requireLogin() {
  if (!configured) {
    gate('尚未設定 Supabase', '請先照 supabase/設定步驟.md 建好專案，把 Project URL 與 anon key 填進 config.js');
    return null;
  }
  const { data: { session } } = await db.auth.getSession();
  if (session) return session;
  return new Promise(resolve => loginForm(resolve));
}

function gate(title, msg, formHtml = '') {
  const el = document.createElement('div');
  el.id = 'gate';
  el.innerHTML = `<div class="gatebox">
      <div class="gatelogo">製程流動單</div>
      <h2>${title}</h2>
      <p>${msg}</p>${formHtml}</div>`;
  document.body.append(el);
  return el;
}

function loginForm(resolve) {
  const el = gate('請先登入', '用公司給的共用帳號密碼', `
    <form id="lf">
      <label>帳號<input type="email" id="le" autocomplete="username" required></label>
      <label>密碼<input type="password" id="lp" autocomplete="current-password" required></label>
      <button class="act solid" type="submit">登入</button>
      <div class="err" id="lerr"></div>
    </form>`);
  const emailBox = el.querySelector('#le');
  emailBox.value = localStorage.getItem('eson-last-email') || '';
  (emailBox.value ? el.querySelector('#lp') : emailBox).focus();

  el.querySelector('#lf').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = el.querySelector('button');
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
    el.remove();
    resolve(data.session);
  });
}

export async function logout() {
  await db.auth.signOut();
  location.reload();
}
