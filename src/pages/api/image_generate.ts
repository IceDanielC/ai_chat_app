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

  try {
    const response = await fetch(
      `${process.env.BASE_URL}images/generations`,
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
    if(json.error) {
        console.error('error', json.error);
        res.status(500).json(json)
        return
    }
    
    res.status(200).json(json);
  } catch (error) {
    // 网络链接失败、token超额等问题
    res.status(500).json({
      error,
    });
  }
}
