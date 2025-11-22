import React, { useEffect, useState } from "react";
import DreamForm from "../components/DreamForm";
import { getUsername, getDream, clearUsername } from "../lib/auth";
import { useRouter } from "next/router";
import SettingsIcon from "../components/SettingsIcon";
import Papa from "papaparse";


export default function DreamPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [theme, setTheme] = useState<"morning" | "night">("night");
  // Excel 列Aの数値データを格納する状態
  const [excelColumnA, setExcelColumnA] = useState<string[] | null>(null);

  // 動画生成が完了したかどうか
  const [isVideoDone, setIsVideoDone] = useState(false);

  // Excel(A列)からランダムで1つ選ばれた数値
  const [randomFromExcel, setRandomFromExcel] = useState<string | null>(null);

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

  // テスト用★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  /*
  // 動画が終わっていて、かつExcelデータがあるときだけランダムに1つ選ぶ
  useEffect(() => {
    if (!isVideoDone) return;
    if (!excelColumnA || excelColumnA.length === 0) return;

    const idx = Math.floor(Math.random() * excelColumnA.length);
    setRandomFromExcel(excelColumnA[idx]);
  }, [isVideoDone, excelColumnA]);
  */

  function handleLogout() {
    clearUsername();
    router.push("/");
  }

  function handleSettings() {
    router.push("/settings");
  }

  // 動画生成が完了したときに呼ぶ
  function handleVideoDone() {
    setIsVideoDone(true);


    // テスト用★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    if (!excelColumnA || excelColumnA.length === 0) {
      console.warn("Excelデータがまだ読み込まれていません");
      return;
    }

    const idx = Math.floor(Math.random() * excelColumnA.length);
    setRandomFromExcel(excelColumnA[idx]);
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
                // ★ 追加：動画生成完了時に呼ぶコールバック
                onVideoDone={handleVideoDone}
              />
            )}

            {saved && (
              <section className="saved">
                <h3 className="savedTitle">最後に見た夢</h3>
                <p className="savedBody">{saved}</p>
              </section>
            )}

                        {/* ★ 常に枠だけは表示しておく */}
            <section className="excelSection">
              <h3 className="savedTitle">今日のひとこと</h3>
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  textAlign: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  minHeight: "48px", // ちょっと高さ確保しておくと安定
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isVideoDone && randomFromExcel !== null ? (
                  <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                    {randomFromExcel}
                  </span>
                ) : (
                  <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                    動画生成が完了するとここに表示されます
                  </span>
                )}
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
