import React, { useEffect, useState } from "react";
import DreamForm from "../components/DreamForm";
import { getUsername, getDream, clearUsername } from "../lib/auth";
import { useRouter } from "next/router";

export default function DreamPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // 初期読み込み時に localStorage から取得
  useEffect(() => {
    const u = getUsername();
    if (!u) {
      router.replace("/");
      return;
    }
    setUsername(u);
    setSaved(getDream());
  }, []);

  function handleLogout() {
    clearUsername();
    router.push("/");
  }

  return (
    <div
      className="dreamPage"
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/images/nightsky.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="dreamOverlay">
        <header className="dreamHeader">
          <div className="dreamLogo">アプリ名</div>
          <button className="secondaryButton" onClick={handleLogout}>
            ログアウト
          </button>
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
