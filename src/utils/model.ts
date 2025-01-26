import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export const embeddingModel = new OpenAIEmbeddings({
  openAIApiKey: `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
  modelName: "text-embedding-ada-002",
  // modelName: "text-embedding-3-large",
});

export const getAIModel = (modelName: string) => {
  return new ChatOpenAI({
    openAIApiKey: `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    modelName,
    temperature: 0,
  });
};
