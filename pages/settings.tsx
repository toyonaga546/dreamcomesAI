"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUsername, setUsername } from "../lib/auth";
import { getSupabase } from "../utils/supabase";

// --- 選択肢の定数を定義 ---
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

// MBTI 16タイプ
const MBTI_OPTIONS = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

export default function SettingsPage() {
  const router = useRouter();

  // --- State 定義 ---
  // 既存
  const [nickname, setNicknameState] = useState<string>("");
  const [theme, setTheme] = useState<"morning" | "night">(() => {
    if (typeof window === "undefined") return "night";
    const localTheme = window.localStorage.getItem("theme");
    return localTheme === "morning" || localTheme === "night"
      ? localTheme
      : "night";
  });

  // ★ 新規追加: 年齢、性別、MBTI
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [mbti, setMbti] = useState<string>("");

  // 初期表示時に Supabase からユーザー情報を取得
  useEffect(() => {
    const init = async () => {
      const client = getSupabase();
      if (!client) {
        alert("Supabase が未設定です。環境変数を確認してください。");
        router.replace("/");
        return;
      }

      const { data, error } = await client.auth.getUser();

      if (error || !data.user) {
        router.replace("/");
        return;
      }

      // user_metadata を取得
      const metadata = data.user.user_metadata || {};
      
      const supaNickname = metadata.nickname ?? "";
      const supaTheme = metadata.theme;
      
      // ★ 新規追加分の読み込み (未設定なら空文字)
      const supaAge = metadata.age ?? "";
      const supaGender = metadata.gender ?? "";
      const supaMbti = metadata.mbti ?? "";

      // ニックネーム設定
      if (supaNickname) {
        setNicknameState(supaNickname);
        setUsername(supaNickname);
      } else {
        const local = getUsername();
        if (local) {
          setNicknameState(local);
        }
      }

      // テーマ設定
      if (supaTheme === "morning" || supaTheme === "night") {
        setTheme(supaTheme);
      }

      // ★ Stateにセット
      setAge(supaAge);
      setGender(supaGender);
      setMbti(supaMbti);
    };

    init();
  }, [router]);

  // 設定の保存
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = nickname.trim();
    if (!trimmed) {
      alert("ニックネームを入力してください。");
      return;
    }

    const client = getSupabase();
    if (!client) {
      alert("Supabase が未設定です。環境変数を確認してください。");
      return;
    }

    // ★ Supabase 上のユーザー情報を更新
    // ここで data オブジェクトに追加するだけで自動的に保存されます
    const { error } = await client.auth.updateUser({
      data: { 
        nickname: trimmed, 
        theme,
        age,    // 追加
        gender, // 追加
        mbti    // 追加
      },
    });

    if (error) {
      alert("更新に失敗しました: " + error.message);
      return;
    }

    // localStorage 側も更新
    setUsername(trimmed);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
    router.push("/dream");
  };

  return (
    <div className={`loginPage ${theme === "morning" ? "loginPage--morning" : ""}`}>
      <div className="loginCard">
        <h1 className="loginTitle">設定</h1>

        <form onSubmit={handleSave}>
          {/* ニックネーム設定 */}
          <div className="field">
            <label htmlFor="nickname" className="label">
              ニックネーム
            </label>
            <input
              id="nickname"
              type="text"
              className="input"
              placeholder="表示する名前"
              value={nickname}
              onChange={(e) => setNicknameState(e.target.value)}
            />
          </div>

          {/* ★ 年齢設定 (セレクトボックス) */}
          <div className="field">
            <label htmlFor="age" className="label">年齢</label>
            <select
              id="age"
              className="input" // inputクラスを流用してスタイルを統一
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option value="">選択してください</option>
              {AGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* ★ 性別設定 (セレクトボックス) */}
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

          {/* ★ MBTI設定 (セレクトボックス) */}
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

          {/* テーマ設定（朝 / 夜） */}
          <div className="field">
            <span className="label">テーマ</span>
            <div className="themeToggle">
              <button
                type="button"
                className={`themeButton ${theme === "morning" ? "isActive" : ""}`}
                onClick={() => setTheme("morning")}
              >
                朝
              </button>
              <button
                type="button"
                className={`themeButton ${theme === "night" ? "isActive" : ""}`}
                onClick={() => setTheme("night")}
              >
                夜
              </button>
            </div>
          </div>

          <div className="buttonRow">
            <button type="submit" className="primaryButton">
              保存
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => router.push("/dream")}
            >
              戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}