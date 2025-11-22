import React, { useEffect, useState } from "react";
import DreamForm from "../components/DreamForm";
import { getUsername, getDream, clearUsername } from "../lib/auth";
import { useRouter } from "next/router";
import SettingsIcon from "../components/SettingsIcon";

export default function DreamPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [theme, setTheme] = useState<"morning" | "night">("night");

  // 初期読み込み時に localStorage から取得
  useEffect(() => {
    const u = getUsername();
    if (!u) {
      router.replace("/");
      return;
    }
    setUsername(u);
    setSaved(getDream());
    // 設定画面で保存したテーマを反映
    if (typeof window !== "undefined") {
      const localTheme = window.localStorage.getItem("theme");
      if (localTheme === "morning" || localTheme === "night") {
        setTheme(localTheme);
      }
    }
  }, []);

  function handleLogout() {
    clearUsername();
    router.push("/");
  }

  function handleSettings() {
    router.push("/settings");
  }

  return (
    <div
      className="dreamPage"
      style={{
        minHeight: "100vh",
        backgroundImage:
          theme === "morning"
            ? 'url("/images/morningsky.jpg")'
            : 'url("/images/nightsky.png")',
        backgroundSize: "cover",
        backgroundPosition: "right center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="dreamOverlay">
        <header className="dreamHeader">
          <div className="dreamLogo">アプリ名</div>
          <div className="header-right">
            <button className="secondaryButton" onClick={handleLogout}>
              ログアウト
            </button>
            <button className="settings" onClick={handleSettings}>
              <SettingsIcon size={27} />
            </button>
          </div>
        </header>

        <main className="dreamMain">
          <section className="dreamHero">
            <h1 className="dreamTitle">
              {username ?? ""}さんの夢を，みんなに届けよう
            </h1>
            <p className="dreamSubtitle">
              あなたが見た夢をAIが物語や映像に変換します．
            </p>
          </section>

          <section className="dreamCard">
            <h2 className="dreamCardTitle">見た夢を教えてください</h2>

            {username && (
              <DreamForm
                initialValue={saved}
                username={username}
                onSaved={(v) => setSaved(v)}
              />
            )}

            {saved && (
              <section className="saved">
                <h3 className="savedTitle">最後に見た夢</h3>
                <p className="savedBody">{saved}</p>
              </section>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
