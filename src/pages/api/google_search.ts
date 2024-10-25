// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { googleSearchKey, googleCxId, searchKey } = req.body;

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${googleSearchKey}&cx=${googleCxId}&q=${searchKey}&c2coff=1&start=1&end=10&dateRestrict=m[1]`
    );

    const json = await response.json();

    res.status(200).json(json);
  } catch (error) {
    // 网络链接失败等问题
    res.status(500).json({ error });
  }
}
