"use client";

import React, { useState } from "react";
import { setDream } from "../lib/auth";
import { analyzeDream } from "../components/DreamFortune";

type Props = {
  initialValue?: string | null;
  username: string;
  // 親コンポーネントから受け取るプロフィール情報
  userProfile?: {
    nickname: string;
    age: string;
    gender: string;
    mbti: string;
  };
  onSaved?: (value: string) => void;
  onVideoDone?: () => void;
  onJobCreated?: (jobId: string) => void;
};

export default function DreamForm({
  initialValue = "",
  username,
  userProfile,
  onSaved,
  onVideoDone,
  onJobCreated,
}: Props) {
  const [text, setText] = useState(initialValue ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // デバッグ用の状態
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [lastStatus, setLastStatus] = useState<number | null>(null);
  const [lastRaw, setLastRaw] = useState<string | null>(null);
  const [lastReqId, setLastReqId] = useState<string | null>(null);

  // 一行表示用（API側で { message } に寄せている想定）
  const greeting =
    lastResponse?.data?.message ??
    lastResponse?.data?.data?.message ??
    lastResponse?.message ??
    null;

  /*
  // 追加: YouTube の watch URL → embed URL に変換するヘルパー
  const toEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    return url;
  };
  */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onVideoDone?.();

    if (!text.trim()) {
      alert("夢を入力してください");
      return;
    }

    const trimmed = text.trim();
    setDream(trimmed);
    onSaved?.(trimmed);

    // 夢占いの分類と結果を計算
    const analysis = analyzeDream(trimmed);

    const fortunePayload = analysis
      ? {
          fortune: analysis.fortune,
          fortuneTheme: analysis.theme,
          fortuneSentiment: analysis.sentiment,
          fortuneScene: analysis.scene,
          fortuneTimeFrame: analysis.timeFrame,
          fortuneRole: analysis.role,
        }
      : {};

    setSending(true);
    setError(null);
    setLastResponse(null);
    setLastStatus(null);
    setLastRaw(null);
    setLastReqId(null);

    try {
      // 一旦 fetch → text で生を確保し，その後 JSON 解析に挑戦
      const res = await fetch("/api/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // プロフィール情報を含めて送信
        body: JSON.stringify({
          userId: username,
          message: trimmed,
          nickname: userProfile?.nickname || username,
          age: userProfile?.age || "",
          gender: userProfile?.gender || "",
          mbti: userProfile?.mbti || "",
          // ここに夢占いの分類と結果を追加
          ...fortunePayload,
        }),
      });

      setLastStatus(res.status);
      setLastReqId(res.headers.get("X-Request-Id"));

      const raw = await res.text();
      setLastRaw(raw);

      let json: any = null;
      try {
        json = JSON.parse(raw);
      } catch {
        // JSON でなければ null のまま（raw は画面に表示する）
      }

      setLastResponse(json);

      if (!res.ok || json?.ok === false) {
        // エラー時も reqId と raw を画面に残す
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }

      // ここで jobId を取り出して親に渡す
      const jobId: string | undefined =
        json?.data?.jobId ?? json?.jobId ?? undefined;
      if (jobId) {
        onJobCreated?.(jobId);

        // ここで「動画生成フロー」を一回だけキック
        // 結果は使わないので await するかどうかは好み
        // 「絶対に投げっぱなし」にしたければ await を付けずに Promise を無視してもOK
        fetch("/api/start-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            // 必要なら動画生成に使う情報もここで渡す
            userId: username,
            message: trimmed,
            nickname: userProfile?.nickname || username,
            age: userProfile?.age || "",
            gender: userProfile?.gender || "",
            mbti: userProfile?.mbti || "",
          }),
        }).catch(() => {
          // ここも握りつぶしでOK（UI的には何も起こさない）
        });
      }

      setText("");
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        なるべく詳細に書いてください
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="夢の内容を入力..."
          rows={6}
        />
      </label>

      <div className="row">
        <button type="submit" className="btn" disabled={sending}>
          {sending ? "送信中..." : "動画生成を開始！"}
        </button>
      </div>

      {/* エラー（API/ネットワーク/JSON 解析など） */}
      {error && <p style={{ color: "crimson" }}>エラー：{error}</p>}

      {/*
      <details style={{ marginTop: 8 }}>
        <summary>デバッグ情報を表示</summary>
        <div
          style={{
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div>status: {String(lastStatus)}</div>
          <div>reqId: {lastReqId ?? "-"}</div>
          <div>hasJSON: {String(Boolean(lastResponse))}</div>
          <div>hasRaw: {String(Boolean(lastRaw))}</div>
          {lastResponse && (
            <>
              <div style={{ marginTop: 6 }}>JSON:</div>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </>
          )}
        </div>
      </details>
      */}
    </form>
  );

    const debugJobId = lastResponse?.data?.jobId ?? lastResponse?.jobId ?? null;
    const debugJobStatus = lastResponse?.data?.status ?? lastResponse?.status ?? null;

}
