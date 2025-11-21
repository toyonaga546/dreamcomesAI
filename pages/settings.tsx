"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUsername, setUsername, clearUsername } from "../lib/auth";

export default function SettingsPage() {
  const router = useRouter();

  // ニックネーム（表示名）
  const [nickname, setNicknameState] = useState<string>("");

  // 初期表示時に現在のユーザー名を取得
  useEffect(() => {
    const name = getUsername();
    if (!name) {
      // 未ログインならトップへ戻す
      router.replace("/");
      return;
    }
    setNicknameState(name);
  }, [router]);

  // 設定の保存（ここではローカルの setUsername のみ）
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = nickname.trim();
    if (!trimmed) {
      alert("ニックネームを入力してください。");
      return;
    }

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

          {/* （例）今後増やしたい設定があればここに field を足していく */}

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
