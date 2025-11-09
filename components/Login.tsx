"use client"; // Next.jsでクライアント側で動かす指定（サーバ側では動かない）

import React, { useState } from 'react';
import { useRouter } from 'next/router'; // ページ遷移用フック
import { setUsername } from '../lib/auth'; // localStorageに名前を保存する関数をインポート

type Props = {
  initialName?: string; // 初期値を外部から渡せるようにする
};

export default function Login({ initialName = '' }: Props) {
  const [name, setName] = useState(initialName); // 入力欄の状態を管理
  const router = useRouter(); // ページ遷移に使う

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // フォームのデフォルト送信動作を止める
    if (!name.trim()) {
      alert('名前を入力してください');
      return;
    }
    setUsername(name.trim()); // 入力した名前を localStorage に保存
    router.push('/dream');    // /dream ページへ移動
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        ニックネーム
        <input
          value={name}
          onChange={(e) => setName(e.target.value)} // 入力値をリアルタイムで反映
          placeholder="例: 夢太郎"
        />
      </label>
      <button type="submit" className="btn">ログイン</button>
    </form>
  );
}
