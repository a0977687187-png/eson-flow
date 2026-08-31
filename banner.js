'use strict';
// 公告橫幅。關掉後記在這台裝置上，不會每次重開又跳出來。
// banner('訊息')                → 彩虹漸層
// banner('訊息', {plain:true})  → 素色
// banner('訊息', {id:'xxx'})    → 自訂記憶鍵，訊息改字時沿用同一個 id 才不會又冒出來
function banner(msg, opt) {
  opt = opt || {};
  const key = 'eson-banner-' + (opt.id || msg);
  if (localStorage.getItem(key) === 'x') return;

  const el = document.createElement('div');
  el.className = 'banner' + (opt.plain ? ' plain' : '');
  el.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.textContent = msg;
  const x = document.createElement('button');
  x.className = 'x';
  x.type = 'button';
  x.setAttribute('aria-label', '關閉公告');
  x.textContent = '×';
  x.addEventListener('click', () => { localStorage.setItem(key, 'x'); el.remove(); });

  el.append(text, x);
  const host = document.querySelector('.wrap') || document.body;
  host.prepend(el);
}
