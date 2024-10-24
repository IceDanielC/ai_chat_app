// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt, history = [], options = {}, model } = req.body;

  const data = {
    model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      ...history,
      {
        role: "user",
        content: prompt,
      },
    ],
    ...options,
    // "stream": true
  };

  try {
    const response = await fetch(
      // "https://api.gptgod.online/v1/chat/completions",
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    const json = await response.json();

    // 返回200的openai的错误处理
    if (json.error) {
      console.error("error", json.error);
      res.status(500).json(json);
      return;
    }

    res.status(200).json(json.choices[0]);
  } catch (error) {
    // 网络、token超额等问题
    res.status(500).json({
      error,
    });
  }
}
