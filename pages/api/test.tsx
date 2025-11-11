import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = "https://n8n.monmontraining.com/webhook/from-app";

    const payload = {
      userId: "test-api",
      message: "direct fetch test from Next.js",
      meta: { source: "api-test", ts: new Date().toISOString() },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data: any = text;
    try { data = JSON.parse(text); } catch {}

    res.status(response.status).json({ ok: response.ok, status: response.status, data });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
