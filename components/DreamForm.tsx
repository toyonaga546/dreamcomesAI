"use client"; // クライアントコンポーネントとして動作させる指定（Next.js）

import React, { useState } from 'react';
import { setDream } from '../lib/auth'; // localStorage に夢を保存する関数

type Props = {
  initialValue?: string | null; // 初期値（前回の夢など）を受け取れる
  onSaved?: (value: string) => void; // 保存完了時に親へ通知するためのコールバック
};

export default function DreamForm({ initialValue = '', onSaved }: Props) {
  const [text, setText] = useState(initialValue ?? ''); // 入力内容の状態管理

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // ページリロードを防ぐ
    if (!text.trim()) {
      alert('夢を入力してください');
      return;
    }
    setDream(text.trim()); // 入力内容を localStorage に保存
    onSaved?.(text.trim()); // 保存完了を親コンポーネントへ通知（任意）
    setText(''); // 入力欄をリセット
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        今日の夢を書いてください
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)} // 入力内容をリアルタイム更新
          placeholder="夢の内容を入力..."
          rows={6}
        />
      </label>
      <div className="row">
        <button type="submit" className="btn">確定</button>
      </div>
    </form>
  );
}
