import styles from '../styles/Home.module.css'
import { useState } from 'react';
import { useRouter } from 'next/router';

// supabase
import { getSupabase } from '../utils/supabase';


export default function Register() {
  // useStateでユーザーが入力したメールアドレスとパスワードをemailとpasswordに格納する
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 追加: ニックネームを格納するstate
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  // supabaseのユーザー登録の関数
  const doRegister =  async () => {
    // バリデーション（簡易）
    if (!email || !password || !nickname) {
      alert('メールアドレス・パスワード・ニックネームをすべて入力してください');
      return;
    }

    try {
      // getSupabase を使ってランタイムでクライアントを取得（詳細ログを出すため）
      const client = getSupabase();
      if (!client) {
        console.error('Supabase client is not configured (env missing)')
        alert('Supabase が設定されていません。環境変数を確認してください。')
        return
      }

      // supabaseのサインアップ。metadataとしてニックネームを渡す
      const result = await client.auth.signUp({
        email,
        password,
        options: {
          data: { nickname },
          emailRedirectTo: 'https://dreamcomes-ai.vercel.app/login'
        }
      })

      // 詳細ログ（data / error オブジェクトを全部出す）
      console.log('signUp result:', result)
      // ブラウザで簡単に見えるように alert にも出す（開発時のみ推奨）
      if (result.error) {
        console.error('signUp error detail:', result.error)
        alert('登録に失敗しました： ' + JSON.stringify(result.error))
        return
      }

      // サインアップ成功（メール確認ありの場合はメール送信）
      alert('登録に成功しました。確認メールをチェックしてください。')
      // 返信の data を開発コンソールで確認できるように出す
      console.log('registered user data:', result.data)

    } catch (err) {
      console.error('unexpected error during signUp:', err)
      // err がオブジェクトの場合は詳細を表示
      try {
        alert('登録に失敗しました： ' + JSON.stringify(err))
      } catch (e) {
        alert(err.message || '登録に失敗しました')
      }
    }
  }

  return (
    // Home.module.cssでcardクラスに適用されているCCSを、このdivタグに適用する
    <div className={styles.card}>
      <h1>新規登録</h1>
      <div>
        <form onSubmit={(e) => { e.preventDefault(); doRegister(); }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>ニックネーム：</label>
            <input
              type="text"
              name="nickname"
              style={{ height: 50, fontSize: '1.2rem', width: '100%', padding: '0 0.6rem' }}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>メールアドレス：</label>
            <input
              type="email"
              name="email"
              style={{ height: 50, fontSize: '1.2rem', width: '100%', padding: '0 0.6rem' }}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>パスワード：</label>
            <input
              type="password"
              name="password"
              style={{ height: 50, fontSize: '1.2rem', width: '100%', padding: '0 0.6rem' }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            style={{ width: 220, height: 44, backgroundColor: '#5b46f7', color: 'white', border: 'none', borderRadius: 6 }}
          >
            登録
          </button>

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{ width: 220, height: 44, backgroundColor: '#cccccc', color: '#222', border: 'none', borderRadius: 6 }}
            >
              ログインページに戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
