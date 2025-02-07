// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { RetrievalQAChain } from "langchain/chains";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { question, modelName } = req.body;

    const SUPABASE_URL = "https://mhdgprfqcfwsosnowows.supabase.co";
    const SUPABASE_PRIVATE_KEY = process.env.SUPABASE_PRIVATE_KEY!;

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

    const embeddingModel = new OpenAIEmbeddings({
      openAIApiKey: `${process.env.OPENAI_API_KEY}`,
      modelName: "text-embedding-ada-002",
    });

    const fileStore = await SupabaseVectorStore.fromExistingIndex(
      embeddingModel,
      {
        client: supabaseClient,
        tableName: "documents",
        queryName: "match_documents",
      }
    );

    // 获取模型 TODO 后续可以考虑使用deepseek-r1
    const openaiModel = new ChatOpenAI({
      openAIApiKey: `${process.env.OPENAI_API_KEY}`,
      modelName,
      temperature: 0,
    });

    const retreiver = RetrievalQAChain.fromLLM(
      openaiModel,
      fileStore.asRetriever()
    );

    const answer = await retreiver.call({
      query: question,
    });

    res.status(200).json({ data: answer });
  } catch (error) {
    // 网络链接失败等问题
    console.log("error in retrieve_supabase: ", error);
    res.status(500).json({ error });
  }
}
