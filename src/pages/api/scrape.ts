import { NextApiRequest, NextApiResponse } from "next";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "只允许POST请求" });
  }

  try {
    const { url } = req.body;
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    // 创建文本分片器
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, // 每个分片的最大字符数
      chunkOverlap: 200, // 分片之间的重叠字符数
    });

    // 对文档内容进行分片
    const splitDocs = await textSplitter.splitDocuments(docs);

    res.status(200).json({ documents: splitDocs });
  } catch (error) {
    console.error("@api/scrape", error);
    res.status(500).json({
      error: "抓取网站内容时出错",
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
}
