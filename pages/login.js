import styles from '../styles/Home.module.css'
// 現時点で使わないものもあるが今後のことを考えて入れておく
import { Col, Container, Form, FormGroup, Input, Label, Row, Button } from "reactstrap";
import { useEffect, useState } from 'react';

// supabase
import { getSupabase } from '../utils/supabase';
import { setUsername } from '../lib/auth';


export default function Register() {
  // useStateでユーザーが入力したメールアドレスとパスワードをemailとpasswordに格納する
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    // Home.module.cssでcardクラスに適用されているCCSを、このdivタグに適用する
    <div className={styles.card}>
      <h1>ログイン</h1>
      <div>
        <Form>
            <FormGroup>
              <Label>
                メールアドレス：
              </Label>
              <Input
                type="email"
                name="email"
                style={{ height: 50, fontSize: "1.2rem" }}
                // onChangeでユーザーが入力した値を取得し、その値をemailに入れる
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>
                パスワード：
              </Label>
              <Input
                type="password"
                name="password"
                style={{ height: 50, fontSize: "1.2rem" }}
                // onChangeでユーザーが入力した値を取得し、その値をpasswordに入れる
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>
            <Button
                style={{ width: 220 }}
                color="primary"
                // 登録ボタンがクリックされたとき関数が実行されるようにする
                onClick={()=>{
                  doLogin();
                }}
              >
              ログイン
            </Button>
        </Form>
      </div>
    </div>
  )
}
