// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt, history = [], options = {} } = req.body;

  const data = {
    model: "gpt-3.5-turbo",
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
  res.status(200).json(json.choices[0]);
}
