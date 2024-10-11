// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = {
    model: "gpt-4o",
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "该图片最有可能是什么虫？"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://mark-ai.oss-cn-hangzhou.aliyuncs.com/20240524-17173000001.jpg"
            }
          }
        ]
      },
    ],
    // "stream": true
  };

  const response = await fetch("https://api.gptgod.online/v1/chat/completions", {
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
