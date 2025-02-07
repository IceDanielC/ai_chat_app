// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { docs } = req.body;

    const SUPABASE_URL = "https://mhdgprfqcfwsosnowows.supabase.co";
    const SUPABASE_PRIVATE_KEY = process.env.SUPABASE_PRIVATE_KEY!;

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

    const embeddingModel = new OpenAIEmbeddings({
      openAIApiKey: `${process.env.OPENAI_API_KEY}`,
      modelName: "text-embedding-ada-002",
    });

    await SupabaseVectorStore.fromDocuments(docs, embeddingModel, {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    });

    res.status(200).json({ msg: "success" });
  } catch (error) {
    // 网络链接失败等问题
    res.status(500).json({ error });
  }
}
