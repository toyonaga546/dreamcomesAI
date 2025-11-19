// components/DreamForm.tsx
"use client";

import React, { useState } from "react";
import { setDream } from "../lib/auth";

type Props = {
  initialValue?: string | null;
  username: string;
  onSaved?: (value: string) => void;
};

export default function DreamForm({ initialValue = "", username, onSaved }: Props) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      alert("夢を入力してください");
      return;
    }

    const trimmed = text.trim();
    setDream(trimmed);
    onSaved?.(trimmed);

    setSending(true);
    setError(null);
    setLastResponse(null);
    setLastStatus(null);
    setLastRaw(null);
    setLastReqId(null);

    try {
      // 一旦 fetch → text で“生”を確保し，その後 JSON 解析に挑戦
      const res = await fetch("/api/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: username, message: trimmed }),
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

      {/* 一行の挨拶文（最も見たい情報） */}
      <p style={{ marginTop: 12 }}>
        {greeting ?? "応答がありません"}
      </p>

      {/* ─ デバッグブロック ─ */}
      <details style={{ marginTop: 8 }}>
        <summary>デバッグ情報を表示</summary>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, lineHeight: 1.5 }}>
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
          {lastRaw && (
            <>
              <div style={{ marginTop: 6 }}>RAW:</div>
              <pre style={{ whiteSpace: "pre-wrap" }}>{lastRaw}</pre>
            </>
          )}
        </div>
      </details>
    </form>
  );
}
