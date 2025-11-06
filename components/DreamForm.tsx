"use client";

import React, { useState } from 'react';
import { setDream } from '../lib/auth';

type Props = {
  initialValue?: string | null;
  onSaved?: (value: string) => void;
};

export default function DreamForm({ initialValue = '', onSaved }: Props) {
  const [text, setText] = useState(initialValue ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      alert('夢を入力してください');
      return;
    }
    setDream(text.trim());
    onSaved?.(text.trim());
    setText('');
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        今日の夢を書いてください
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
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
