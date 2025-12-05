// pages/api/n8n.ts
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const url = process.env.N8N_WEBHOOK_URL;
  // デバッグ：リクエストIDを発行
  const reqId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[API][${reqId}] .env URL:`, url);
  // console.log(`[API][${reqId}] Request body:`, req.body); // 全体ログだと長くなるので必要ならコメントアウト解除

  if (!url) {
    return res
      .status(500)
      .json({ ok: false, error: "N8N_WEBHOOK_URL is not set", reqId });
  }

  try {
    // ★ ここから：一時的に n8n を呼ばずダミーデータを返すテスト用コード
    /*
    const dummy = {
      userId: "pote",
      message: "空をとんだ",
      nickname: "テスト太郎",
      age: "20代",
      gender: "男性",
      mbti: "ENTJ",
      youtubeUrl: "https://www.youtube.com/watch?v=8aS-PJg_jYs",
    };

    console.log(`[API][${reqId}] return dummy data (skip n8n)`, dummy);

    res.setHeader("X-Request-Id", reqId);
    return res.status(200).json({
      ok: true,
      data: dummy,
      reqId,
      meta: { parsed: true, rawLength: JSON.stringify(dummy).length },
    });
    */
    // ★ ここまでを「テストしたいときだけ」コメントアウト解除する

    // ★ 変更点1: ここで age, gender, mbti, nickname を受け取るように追加
    const { 
      userId = "anonymous", 
      message = "", 
      nickname = "",
      age = "",
      gender = "",
      mbti = "",
      fortune = "",
      fortuneTheme,
      fortuneSentiment,
      fortuneScene,
      fortuneTimeFrame,
      fortuneRole,
    } = (req.body ?? {}) as Record<string, any>;

    // ★ 変更点2: n8nに送るデータ(outgoingPayload)にプロフィール情報を含める
    const outgoingPayload = {
      userId,
      message,
      nickname,
      age,
      gender,
      mbti,
      // 夢占いの結果本文
      fortune,

      // 夢占いの分類情報（n8n 側で扱いやすいよう，まとまりにしておく）
      fortuneAnalysis: {
        theme: fortuneTheme,
        sentiment: fortuneSentiment,
        scene: fortuneScene,
        timeFrame: fortuneTimeFrame,
        role: fortuneRole,
      },
      
      meta: {
        source: "nextjs-pages",
        ua: req.headers["user-agent"] ?? "",
        ts: new Date().toISOString(),
        reqId,
      },
    };

    console.log(`[API][${reqId}] Sending payload -> n8n:`, outgoingPayload);
    // ここから

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(outgoingPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text();
    let data: any = text;
    let parsed = false;
    try {
      data = JSON.parse(text);
      parsed = true;
    } catch {
      // keep raw text
    }

    console.log(
      `[API][${reqId}] Response from n8n (raw text):`,
      { status: response.status, ok: response.ok },
      text
    );

    console.log(
      `[API][${reqId}] Response from n8n (parsed):`,
      { status: response.status, ok: response.ok, parsed },
      data
    );


    if (!response.ok) {
      return res
        .status(502)
        .json({ ok: false, status: response.status, data, reqId });
    }

    // 正規化処理
    const jobId =
      (data && (data.jobId || data.job_id)) ||
      (Array.isArray(data) && data[0] && (data[0].jobId || data[0].job_id)) ||
      null;

    const status =
      (data && (data.status || data.state)) ||
      (Array.isArray(data) && data[0] && (data[0].status || data[0].state)) ||
      null;

    const normalized = { jobId, status };

    console.log(`[API][${reqId}] Normalized job info:`, normalized);

    res.setHeader("X-Request-Id", reqId);
    return res
      .status(200)
      .json({ ok: true, data: normalized, reqId, meta: { parsed, rawLength: text.length } });
  } catch (e: any) {
    console.error(`[API][${reqId}] ERROR:`, e);
    return res
      .status(500)
      .json({ ok: false, error: e?.message ?? String(e), reqId });
  }
};

export default handler;