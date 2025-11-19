"use client"; // Next.js（App Router環境なら必要）

import React, { useState } from "react";
import { useRouter } from "next/router";
import { getSupabase } from "../utils/supabase";

export default function Register() {
  // 入力値
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const router = useRouter();

  // ユーザー登録処理
  const doRegister = async () => {
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      alert("メールアドレス・パスワード・ニックネームをすべて入力してください");
      return;
    }

    try {
      const client = getSupabase();

      if (!client) {
        alert("Supabase が未設定です。環境変数を確認してください。");
        return;
      }

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { nickname },
          emailRedirectTo: "https://dreamcomes-ai.vercel.app/login",
        },
      });

      if (error) {
        alert("登録に失敗しました: " + error.message);
        console.error("SignUp Error:", error);
        return;
      }

      alert("登録に成功しました。確認メールをチェックしてください。");
      console.log("Registered User Data:", data);
    } catch (err: any) {
      console.error("unexpected error during signUp:", err);
      alert("登録に失敗しました：" + (err.message || "不明なエラーです"));
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="loginTitle">新規登録</h1>

        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            doRegister();
          }}
        >
          {/* ニックネーム */}
          <div className= "field">
            <label htmlFor="nickname" className="label">
              ニックネーム
            </label>
            <input
              id="nickname"
              type="text"
              className="input"
              placeholder="例：Taro"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

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

          {/* 登録ボタン */}
          <button type="submit" className="primaryButton">
            登録
          </button>

          {/* ログインページに戻る */}
          <div style={{ marginTop: 16 }}>
            <button type="button" className="secondaryButton" onClick={() => router.push("/")}>
              ログインページに戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
