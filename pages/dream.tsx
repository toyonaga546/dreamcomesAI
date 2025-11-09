import React, { useEffect, useState } from 'react';
import DreamForm from '../components/DreamForm'; // 夢入力フォームをインポート
import { getUsername, getDream, clearUsername } from '../lib/auth'; // localStorage操作関数
import { useRouter } from 'next/router'; // ページ遷移用フック

export default function DreamPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null); // ユーザー名の状態
  const [saved, setSaved] = useState<string | null>(null);       // 保存された夢の状態

  // ページ初回読み込み時に localStorage からデータを読み取る
  useEffect(() => {
    const u = getUsername();
    if (!u) {
      // 未ログインならトップページへリダイレクト
      router.replace('/');
      return;
    }
    setUsername(u);        // ユーザー名をセット
    setSaved(getDream());  // 以前保存した夢をセット
  }, []);

  // ログアウト処理：保存されたユーザー名を削除してトップへ戻る
  function handleLogout() {
    clearUsername();
    router.push('/');
  }

  return (
    <div className="container">
      <main className="card">
        <h1>{username ?? ""}さんの夢日記</h1>

        {/* 夢入力フォーム：保存時に setSaved で更新 */}
        <DreamForm initialValue={saved} onSaved={(v) => setSaved(v)} />

        {/* 保存済みの夢がある場合に表示 */}
        {saved && (
          <section className="saved">
            <h2>最後に確定した夢</h2>
            <p>{saved}</p>
          </section>
        )}

        {/* ログアウトボタン */}
        <div style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={handleLogout}>ログアウト</button>
        </div>
      </main>
    </div>
  );
}
