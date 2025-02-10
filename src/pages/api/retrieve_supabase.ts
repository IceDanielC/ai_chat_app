// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseClient } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { question, modelName, temperature } = req.body;

    const supabaseClient = createSupabaseClient();

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

    // 获取模型
    const model = new ChatOpenAI({
      openAIApiKey:
        modelName === "deepseek-reasoner"
          ? process.env.DEEPSEEK_API_KEY
          : process.env.OPENAI_API_KEY,
      modelName,
      temperature,
      configuration: {
        baseURL:
          modelName === "deepseek-reasoner"
            ? "https://api.deepseek.com/v1"
            : undefined,
      },
    });

    const prompt = ChatPromptTemplate.fromTemplate(
      `Answer the following question based only on the provided context:
      
      <context>{context}</context>
      
      Question: {input}
      
      Answer: `
    );

    const documentChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever: fileStore.asRetriever(),
    });

    const { context, answer } = await retrievalChain.invoke({
      input: question,
    });

    res.status(200).json({ data: answer });
  } catch (error) {
    // 网络链接失败等问题
    console.log("error in retrieve_supabase: ", error);
    res.status(500).json({ error });
  }
}
