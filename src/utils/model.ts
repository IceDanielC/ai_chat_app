import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export const embeddingModel = new OpenAIEmbeddings({
  openAIApiKey: `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
  modelName: "text-embedding-ada-002",
});

export const getAIModel = (modelName: string) => {
  // TODO 兼容deepseek-r1
  return new ChatOpenAI({
    openAIApiKey: `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    modelName,
    temperature: 0,
  });
};

export const embeddingToSupabaseApi = async (
  docs: Document[]
): Promise<OpenAIEmbeddings> => {
  const response = await fetch("/api/embedding_to_supabase", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ docs }),
  });
  const data = await response.json();
  return data;
};
