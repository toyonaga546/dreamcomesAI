import React, { useEffect } from 'react';
import Login from '../components/Login'; // 名前入力フォームをインポート
import { getUsername } from '../lib/auth'; // localStorage から名前を取得する関数
import { useRouter } from 'next/router';   // ページ遷移用のフック

export default function Home() {
  const router = useRouter();

  // ページ読み込み時に実行
  useEffect(() => {
    const u = getUsername(); // 保存されたユーザー名を取得
    if (u) router.replace('/dream'); // すでにログイン済みなら /dream にリダイレクト
  }, []);

  return (
    <div className="loginPage">
      <main className="loginCard">
        <h1 className='loginTitle'>YoumayBe</h1>
        <p style={{ textAlign: 'center' }}>あなたの夢を共有しよう</p>
        {/* 名前を入力してログインするフォーム */}
        <Login />
      </main>
    </div>
  );
}
