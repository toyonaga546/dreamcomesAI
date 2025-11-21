"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUsername, setUsername, clearUsername } from "../lib/auth";
import { getSupabase } from "../utils/supabase"; // ★ 追加

export default function SettingsPage() {
  const router = useRouter();

  // ニックネーム（表示名）
  const [nickname, setNicknameState] = useState<string>("");

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
        // ログインしていない / セッション切れなど
        router.replace("/");
        return;
      }

      // Supabase に入っている nickname を優先
      const supaNickname =
        (data.user.user_metadata as any)?.nickname ?? "";


      if (supaNickname) {
        setNicknameState(supaNickname);
        // localStorage 側も揃えておく
        setUsername(supaNickname);
      } else {
        // もし metadata に入ってなければ localStorage を fallback に
        const local = getUsername();
        if (local) {
          setNicknameState(local);
        }
      }
    };

    init();
  }, [router]);

  // 設定の保存：Supabase の metadata & localStorage 両方更新
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

    // Supabase 上のユーザー情報を更新
    const { error } = await client.auth.updateUser({
      data: { nickname: trimmed },
    });

    if (error) {
      alert("ニックネームの更新に失敗しました: " + error.message);
      return;
    }

    // localStorage 側も更新（アプリ内の既存処理と揃える）
    setUsername(trimmed);

    alert("設定を保存しました。");
    router.push("/dream");
  };

  return (
    <div className="loginPage">
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
