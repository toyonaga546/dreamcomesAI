// components/LoadingBox.tsx
"use client";

import React from "react";

type Props = {
  loading: boolean;          // 今ローディング中か
  loadingMessage: string;    // ローディング中に出すメッセージ
  result: string | null;     // 完了後に表示するテキスト
};

export default function LoadingBox({ loading, loadingMessage, result }: Props) {
  return (
    <div className="dreamFortuneBox">
      {loading ? (
        <div className="fortuneLoading">
          <div className="fortuneSpinner" />
          <div className="fortuneLoadingText">{loadingMessage}</div>
        </div>
      ) : (
        result && <p className="dreamFortuneText">{result}</p>
      )}
    </div>
  );
}
