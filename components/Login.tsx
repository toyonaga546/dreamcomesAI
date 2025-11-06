"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { setUsername } from '../lib/auth';

type Props = {
  initialName?: string;
};

export default function Login({ initialName = '' }: Props) {
  const [name, setName] = useState(initialName);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('名前を入力してください');
      return;
    }
    setUsername(name.trim());
    router.push('/dream');
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        お名前
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 山田 太郎"
        />
      </label>
      <button type="submit" className="btn">ログイン</button>
    </form>
  );
}
