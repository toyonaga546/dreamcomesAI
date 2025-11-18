import styles from '../styles/Home.module.css'
// 現時点で使わないものもあるが今後のことを考えて入れておく
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; 

// supabase
import { getSupabase } from '../utils/supabase';
import { setUsername } from '../lib/auth';


export default function Register() {
  // useStateでユーザーが入力したメールアドレスとパスワードをemailとpasswordに格納する
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // ログインの関数
  const doLogin =  async () => {
    const client = getSupabase()
    if (!client) {
      alert('Supabase が未設定です。環境変数を確認してください。')
      return
    }

    // supabaseで用意されているログインの関数
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      // メール未確認のエラーなら具体案内
      if (error.message && String(error.message).toLowerCase().includes('email not confirmed')) {
        alert('ログインに失敗しました: メールアドレスが確認されていません。登録時に送られた確認メールを確認してください。\n(開発中であれば Supabase の Auth 設定でメール確認を無効にできます)')
      } else {
        alert('ログインに失敗しました: ' + error.message)
      }
      return
    }

    // ユーザー情報を取得してニックネームがあるか確認
    const { data: userData } = await client.auth.getUser()
    const user = userData.user
    const nickname = (user && user.user_metadata && user.user_metadata.nickname) ? user.user_metadata.nickname : null
    if (!nickname) {
      // ニックネームが設定されていないアカウントは登録ページで作成されたものではないとみなしログアウト
      await supabase.auth.signOut()
      alert('このアカウントは新規登録フォームで作成されたアカウントではないためログインできません。')
      return
    }

    // ローカルにニックネームを保存しておく（表示用）
    setUsername(nickname)
    console.log('ログイン成功. nickname:', nickname)
  }

  return (
    // Home.module.css で card クラスに適用されているCSSを、このdivタグに適用
    <div className={styles.card}>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '24px' }}>夢日記へようこそ</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // ページリロード防止
            doLogin();
          }}
        >
          {/* メールアドレス */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: 8 }}
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                height: 48,
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                padding: '0 14px',
                fontSize: '1rem',
              }}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* パスワード */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: 8 }}
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="パスワード"
              style={{
                width: '100%',
                height: 48,
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                padding: '0 14px',
                fontSize: '1rem',
              }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ボタン2つを横並びに */}
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              gap: 12,
            }}
          >
            <button
              type="submit"
              style={{
                flexShrink: 0,
                minWidth: 120,
                padding: '10px 24px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: '#4f46e5',
                color: 'white',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              ログイン
            </button>

            <button
              type="button"
              onClick={() => router.push('/register')}
              style={{
                flexShrink: 0,
                minWidth: 120,
                padding: '10px 24px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: '#4f46e5',
                color: 'white',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              新規登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
