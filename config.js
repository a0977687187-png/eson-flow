// Supabase 連線設定。
// 這兩個值從 Supabase 後台 Project Settings → API 那頁複製過來。
//
// anon key 是「設計成公開」的，寫在這裡沒關係——擋人是靠資料庫的 RLS 政策
// （schema.sql 最後那一段）跟登入密碼，不是靠藏這把鑰匙。
//
// ⚠️ 絕對不要把 service_role 那把貼進來，它會繞過所有權限設定。
window.ESON_CONFIG = {
  url: '',        // 例：https://abcdefghijkl.supabase.co
  anonKey: '',    // 例：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
};
