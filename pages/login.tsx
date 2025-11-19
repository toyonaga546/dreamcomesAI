"use client"; // Next.js（App Router使用時に必要）

import React, { useState } from "react";
import { useRouter } from "next/router";
import { getSupabase } from "../utils/supabase";
import { setUsername } from "../lib/auth";

export default function Login() {
  // フォーム入力データ
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  // ログイン処理
  const doLogin = async () => {
    const client = getSupabase();
    if (!client) {
      alert("Supabase が未設定です。環境変数を確認してください。");
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message?.toLowerCase().includes("email not confirmed")) {
        alert(
          "ログインに失敗しました: メールアドレスが確認されていません。登録時に送られた確認メールを確認してください。\n(開発中であれば Supabase の Auth 設定でメール確認を無効にできます)"
        );
      } else {
        alert("ログインに失敗しました: " + error.message);
      }
      return;
    }

    // ユーザー情報確認
    const { data: userData } = await client.auth.getUser();
    const user = userData?.user;

    if (!user || !user.user_metadata?.nickname) {
      await client.auth.signOut();
      alert("このアカウントは新規登録フォームで作成されたアカウントではないためログインできません。");
      return;
    }

    setUsername(user.user_metadata.nickname);
    console.log("ログイン成功. nickname:", user.user_metadata.nickname);
    router.push("/dream");
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="loginTitle">DreamComesAI</h1>

        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            doLogin();
          }}
        >
          {/* メールアドレス */}
          <div className="field">
            <label htmlFor="email" className="label">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* パスワード */}
          <div className="field">
            <label htmlFor="password" className="label">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ボタン */}
          <div className="buttonRow">
            <button type="submit" className="primaryButton">
              ログイン
            </button>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="secondaryButton"
            >
              新規登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
