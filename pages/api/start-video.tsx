// pages/api/start-video.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // 動画生成フロー用の Webhook URL
  const url = process.env.N8N_VIDEO_FLOW_URL;
  if (!url) {
    return res
      .status(500)
      .json({ ok: false, error: "N8N_VIDEO_FLOW_URL is not set" });
  }

  // ここで jobId や夢の内容などを n8n に渡す
  const payload = req.body ?? {};

  // 「向こうからの返答は使わない」ので、
  // エラーだけ握りつぶしてすぐ 200 を返す
  try {
    // 返答を待たずに投げっぱなしに近づけるなら、await を付けない手もあるが
    // エラーを拾いたいので一応 await は付けておく（ボディは無視）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5秒だけ待ってなにもなければ打ち切り

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch(() => {
      // n8n 側で返答が無い / タイムアウトした場合もここで握りつぶす
    });

    clearTimeout(timeout);
  } catch (e) {
    // ここも握りつぶし。ログだけ出しておけば十分
    console.error("[start-video] error:", e);
  }

  // フロントには「とりあえず受け付けたよ」だけ返す
  return res.status(200).json({ ok: true });
}
