// pages/api/job-status.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const jobId = req.query.jobId;
  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ ok: false, error: "jobId is required" });
  }

  const url = process.env.N8N_JOB_STATUS_URL;
  if (!url) {
    return res
      .status(500)
      .json({ ok: false, error: "N8N_JOB_STATUS_URL is not set" });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    const text = await response.text();
    let data: any = text;
    let parsed = false;
    try {
      data = JSON.parse(text);
      parsed = true;
    } catch {
      // そのまま raw
    }

    if (!response.ok) {
      return res
        .status(502)
        .json({ ok: false, status: response.status, data });
    }

    // n8n 側は { status, youtubeUrl } を返す想定
    return res.status(200).json({ ok: true, data, meta: { parsed } });
  } catch (e: any) {
    return res
      .status(500)
      .json({ ok: false, error: e?.message ?? String(e) });
  }
}
