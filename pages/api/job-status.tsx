// pages/api/job-status.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET 以外は受け付けない（ポーリング専用のため）
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // jobId がクエリに無い場合は即エラー（ステータス確認ができないため）
  const jobId = req.query.jobId;
  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ ok: false, error: "jobId is required" });
  }

  // n8n のステータス確認用 Webhook URL が環境変数に無い場合
  const url = process.env.N8N_JOB_STATUS_URL;
  if (!url) {
    return res
      .status(500)
      .json({ ok: false, error: "N8N_JOB_STATUS_URL is not set" });
  }

  try {
    // n8n のステータス取得フローに jobId を POST で送る
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    // n8n からの返り値を一度テキストとして取得
    const text = await response.text();
    let data: any = text;
    let parsed = false;

    try {
      // JSON として解釈できる場合はパース
      data = JSON.parse(text);
      parsed = true;
    } catch {
      // パースできない場合はそのまま raw の文字列を返す
    }

    // n8n 側でエラー応答だった場合は内容をそのまま転送
    if (!response.ok) {
      return res
        .status(502)
        .json({ ok: false, status: response.status, data });
    }

    // 正常に取得できたら JSON として返す
    // data には { status, youtubeUrl } が入る想定
    return res.status(200).json({ ok: true, data, meta: { parsed } });

  } catch (e: any) {
    // fetch 自体が失敗した場合（n8n が落ちてる・ネットワーク不良など）
    return res
      .status(500)
      .json({ ok: false, error: e?.message ?? String(e) });
  }
}