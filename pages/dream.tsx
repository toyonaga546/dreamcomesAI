// pages/dream.tsx
import React, { useEffect, useState } from "react";
import DreamForm from "../components/DreamForm";
import { getUsername, getDream, clearUsername } from "../lib/auth";
import { useRouter } from "next/router";
import SettingsIcon from "../components/SettingsIcon";
import Papa from "papaparse";
import DreamFortune from "../components/DreamFortune";
import LoadingBox from "../components/LoadingBox";

export default function DreamPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [theme, setTheme] = useState<"morning" | "night">("night");

  // Excel 列Aのデータ
  const [excelColumnA, setExcelColumnA] = useState<string[] | null>(null);

  // 今日のひとこと用
  const [isOneWordLoading, setIsOneWordLoading] = useState(false);
  const [randomFromExcel, setRandomFromExcel] = useState<string | null>(null);

  // 夢占いローディング状態
  const [isFortuneLoading, setIsFortuneLoading] = useState(false);

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
  }, [router]);

  // Excel 読み込み
  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      complete: (result) => {
        const rows = result.data as string[][];
        const colA = rows
          .map((row) => row[0] as string) // 各行のA列（0番目）だけ取り出す
          .filter((v) => v !== undefined && v !== null && v !== "");

        setExcelColumnA(colA);
      },
    });
  }, []);

  // saved（最後に保存した夢）が変わったら 2秒間ローディング
  useEffect(() => {
    if (!saved) {
      setIsFortuneLoading(false);
      return;
    }

    setIsFortuneLoading(true);

    const timer = setTimeout(() => {
      setIsFortuneLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [saved]);

  function handleLogout() {
    clearUsername();
    router.push("/");
  }

  function handleSettings() {
    router.push("/settings");
  }

  // 動画生成ボタンを押したときに呼ぶ（今日のひとこともここで決める）
  function handleVideoDone() {
    if (!excelColumnA || excelColumnA.length === 0) {
      console.warn("Excelデータがまだ読み込まれていません");
      return;
    }

    // ボタンを押した瞬間に「ひとこと生成中」にする
    setIsOneWordLoading(true);

    // 新しい「ひとこと」をランダムに選ぶ
    const idx = Math.floor(Math.random() * excelColumnA.length);
    const word = excelColumnA[idx];

    // 2秒くるくるしたあとに反映
    setTimeout(() => {
      setRandomFromExcel(word);   // 前回のひとことを更新
      setIsOneWordLoading(false); // ローディング終了
    }, 2000);
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
                onVideoDone={handleVideoDone}
              />
            )}

            {saved && (
              <section className="saved">
                <h3 className="savedTitle">最後に見た夢</h3>
                <p className="savedBody">{saved}</p>
              </section>
            )}

            {/* 動画表示セクション */}
            <section className="videoSection" style={{ marginTop: "24px" }}>
              <h3 className="savedTitle">生成された動画</h3>
              <div
                style={{
                  position: "relative",
                  paddingTop: "56.25%", // 16:9
                  marginTop: "12px",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <iframe
                  src="https://youtube.com/embed/ZUntasvVrPc"
                  title="生成された夢動画"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </section>

            {/* 今日のひとこと */}
            <section className="excelSection">
              <h3 className="savedTitle">今日のひとこと</h3>

              {/* まだ一度も生成していないとき */}
              {!isOneWordLoading && randomFromExcel === null ? (
                <div className="dreamFortuneBox">
                  <p className="dreamFortuneText">
                    ひとことが保存されていません．
                  </p>
                </div>
              ) : (
                // 生成中 or 一度でも生成済み
                <LoadingBox
                  loading={isOneWordLoading}
                  loadingMessage="ひとことを生成中です…"
                  result={randomFromExcel}
                />
              )}
            </section>

            {/* 夢占いの結果表示 */}
            <DreamFortune text={saved} loading={isFortuneLoading} />
          </section>
        </main>
      </div>
    </div>
  );
}
