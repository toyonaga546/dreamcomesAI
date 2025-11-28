"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { getSupabase } from "../utils/supabase";

// --- 選択肢の定数（SettingsPageと同じ） ---
const AGE_OPTIONS = [
  "10代",
  "20代",
  "30代",
  "40代",
  "50代",
  "60代以上",
];

const GENDER_OPTIONS = [
  "男性",
  "女性",
  "どちらでもない",
];

const MBTI_OPTIONS = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

export default function Register() {
  // 入力値
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  
  // ★ 追加: 年齢・性別・MBTI
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mbti, setMbti] = useState("");

  const router = useRouter();

  // ユーザー登録処理
  const doRegister = async () => {
    // バリデーション：すべての項目をチェック
    if (
      !email.trim() || 
      !password.trim() || 
      !nickname.trim() ||
      !age ||
      !gender ||
      !mbti
    ) {
      alert("すべての項目を入力・選択してください");
      return;
    }

    try {
      const client = getSupabase();

      if (!client) {
        alert("Supabase が未設定です。環境変数を確認してください。");
        return;
      }

      // ★ signUp時にメタデータとして保存
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { 
            nickname,
            age,    // 追加
            gender, // 追加
            mbti    // 追加
          },
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
      
      // 登録後はログイン画面などへ戻す
      router.push("/");

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
          <div className="field">
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

          {/* ★ 年齢 (セレクトボックス) */}
          <div className="field">
            <label htmlFor="age" className="label">年齢</label>
            <select
              id="age"
              className="input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option value="">選択してください</option>
              {AGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* ★ 性別 (セレクトボックス) */}
          <div className="field">
            <label htmlFor="gender" className="label">性別</label>
            <select
              id="gender"
              className="input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">選択してください</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* ★ MBTI (セレクトボックス) */}
          <div className="field">
            <label htmlFor="mbti" className="label">MBTI</label>
            <select
              id="mbti"
              className="input"
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
            >
              <option value="">選択してください</option>
              {MBTI_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
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

          {/* ボタンエリア（横並び） */}
          <div className="buttonRow">
            <button type="submit" className="primaryButton">
              登録
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => router.push("/")}
            >
              ログインページに戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}