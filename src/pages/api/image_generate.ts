// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { model, prompt, size = "1024x1024" } = req.body;

  const data = {
    model,
    prompt,
    n: 1,
    size,
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });

  const json = await response.json();

  res.status(200).json(json);
}
