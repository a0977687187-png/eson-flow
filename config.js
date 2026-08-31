// Supabase 連線設定。
// 這兩個值從 Supabase 後台 Project Settings → API 那頁複製過來。
//
// publishable key（sb_publishable_…）是「設計成公開」的，寫在這裡沒關係——
// 擋人是靠資料庫的 RLS 政策（schema.sql 最後那一段）跟登入密碼，
// 不是靠藏這把鑰匙。
//
// ⚠️ 絕對不要把 sb_secret_… 那把貼進來，它會繞過所有權限設定。
window.ESON_CONFIG = {
  // 專案根網址——後面不要接 /rest/v1/
  url: 'https://vpjbdxlydsjoukwybqfx.supabase.co',
  anonKey: 'sb_publishable_dolA6qxDckGv83nEa7r7Ew_dKJog4kX',
};
