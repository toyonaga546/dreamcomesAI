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
  console.log(`[API][${reqId}] Request body:`, req.body);

  if (!url) {
    return res
      .status(500)
      .json({ ok: false, error: "N8N_WEBHOOK_URL is not set", reqId });
  }

  try {
    const { userId = "anonymous", message = "" } =
      (req.body ?? {}) as Record<string, any>;

    const outgoingPayload = {
      userId,
      message,
      meta: {
        source: "nextjs-pages",
        ua: req.headers["user-agent"] ?? "",
        ts: new Date().toISOString(),
        reqId,
      },
    };

    console.log(`[API][${reqId}] Sending payload -> n8n:`, outgoingPayload);

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
      `[API][${reqId}] Response from n8n:`,
      { status: response.status, ok: response.ok, parsed },
      data
    );

    if (!response.ok) {
      return res
        .status(502)
        .json({ ok: false, status: response.status, data, reqId });
    }

    // 正規化：配列/オブジェクト/文字列 → { message: ... } に寄せる
    const normalize = (d: any) => {
      if (Array.isArray(d) && d[0]?.greeting) return { message: String(d[0].greeting) };
      if (d?.greeting) return { message: String(d.greeting) };
      if (d?.data && Array.isArray(d.data) && d.data[0]?.greeting) return { message: String(d.data[0].greeting) };
      if (d?.data?.greeting) return { message: String(d.data.greeting) };
      if (typeof d === "string") return { message: d };
      return d;
    };
    const normalized = normalize(data);

    console.log(`[API][${reqId}] Normalized payload:`, normalized);

    // リクエストIDをヘッダにも返す
    res.setHeader("X-Request-Id", reqId);
    return res.status(200).json({ ok: true, data: normalized, reqId, meta: { parsed, rawLength: text.length } });
  } catch (e: any) {
    console.error(`[API][${reqId}] ERROR:`, e);
    return res
      .status(500)
      .json({ ok: false, error: e?.message ?? String(e), reqId });
  }
};

export default handler;
