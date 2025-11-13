"use client"; // Next.jsでクライアント側で動かす指定（サーバ側では動かない）

import React, { useState } from 'react';
import { useRouter } from 'next/router'; // ページ遷移用フック
import { setUsername } from '../lib/auth'; // localStorageに名前を保存する関数をインポート
import { getSupabase } from '../utils/supabase';

type Props = {
  initialEmail?: string; // 将来の拡張用に初期値を受け取れるようにする
};

export default function Login({ initialEmail = '' }: Props) {
  // ニックネームは不要になったため削除。
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const router = useRouter(); // ページ遷移に使う

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // フォームのデフォルト送信動作を止める
    if (!email.trim() || !password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }
    // Supabase で認証を実施
    (async () => {
      try {
        const client = getSupabase();
        if (!client) {
          alert('Supabase が未設定です。環境変数を確認してください。');
          return;
        }

        const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          console.error('signIn error', error);
          // メール未確認エラーには具体的な案内を出す
          if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
            alert('メールアドレスが確認されていません。登録時に送られた確認メールを確認してください。\n(開発中であれば Supabase の Auth 設定でメール確認を無効にできます)')
          } else {
            alert('ログインに失敗しました: ' + error.message);
          }
          return;
        }

        const user = data?.user;
        if (!user) {
          alert('ユーザー情報が取得できませんでした');
          return;
        }

        const nickname = (user.user_metadata && user.user_metadata.nickname) ? user.user_metadata.nickname : (user.email ?? email.trim());
        // localStorage に表示用の名前を保存
        setUsername(nickname);
        router.push('/dream');
      } catch (err: any) {
        console.error('unexpected signIn error', err);
        alert(err?.message || 'ログイン中にエラーが発生しました');
      }
    })();
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        メールアドレス
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          type="email"
        />
      </label>

      <label>
        パスワード
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          type="password"
        />
      </label>

      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
        <button type="submit" className="btn">ログイン</button>
        <button
          type="button"
          className="btn"
          onClick={() => router.push('/register')}
        >
          新規登録
        </button>
      </div>
    </form>
  );
}
