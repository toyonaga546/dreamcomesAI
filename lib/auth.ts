// ブラウザ（クライアント）上で実行されているかどうかを確認
// サーバーサイドでは window や localStorage が存在しないため安全確認を行う
export function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

// 保存されたユーザー名を取得する
// クライアント環境でなければ null を返す
export function getUsername(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('dcai_username');
}

// ユーザー名を localStorage に保存する
export function setUsername(name: string) {
  if (!isClient()) return;
  localStorage.setItem('dcai_username', name);
}

// ユーザー名を削除する（ログアウトなどで使用）
export function clearUsername() {
  if (!isClient()) return;
  localStorage.removeItem('dcai_username');
}

// 保存された「夢のテキスト」を取得する
export function getDream(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('dcai_dream');
}

// 「夢のテキスト」を保存する
export function setDream(d: string) {
  if (!isClient()) return;
  localStorage.setItem('dcai_dream', d);
}
