import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { RetrievalQAChain } from "langchain/chains";
import { embeddingModel, getAIModel } from "./model";

const SUPABASE_URL = "https://mhdgprfqcfwsosnowows.supabase.co";
const SUPABASE_PRIVATE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_KEY!;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

export async function getPDFText(pdfUrl: string) {
  // Read the file as a buffer
  const response = await fetch(pdfUrl);
  const buffer = await response.arrayBuffer();
  // Create a Blob from the buffer
  const pdfBlob = new Blob([buffer], { type: "application/pdf" });
  const loader = new WebPDFLoader(pdfBlob);
  const docs = await loader.load();
  return docs;
}

// 解析website
export async function getWebsiteDocument(website: string) {
  try {
    // 使用Next.js API代理服务器或后端API来获取网站内容
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: website }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error("获取网站内容时出错:", error);
    throw new Error(
      `无法加载网站内容: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

// 上传文档到supabase
export async function uploadDocumentToSupabase(docs: any) {
  await SupabaseVectorStore.fromDocuments(docs, embeddingModel, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  });
}

// 删除supabase中documents表中的所有数据
export async function deleteAllDocuments() {
  await supabaseClient.from("documents").delete().neq("id", 0);
}

// 利用LLM查询supabase中的数据
export async function retrievalFromSupabase(
  question: string,
  modelName: string
) {
  const fileStore = await SupabaseVectorStore.fromExistingIndex(
    embeddingModel,
    {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    }
  );
  const retreiver = RetrievalQAChain.fromLLM(
    getAIModel(modelName),
    fileStore.asRetriever()
  );
  const res = await retreiver.call({
    query: question,
  });
  return res;
}
