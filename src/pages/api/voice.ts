import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export default async function handler(req: NextRequest) {
  const formdata = await req.formData();
  const file = formdata.get("file") as File;
  const history = formdata.get("history") as string;
  const options = JSON.parse(formdata.get("options") as string);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // speech to text
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  // text to completion
  const model = new ChatOpenAI({
    openAIApiKey:
      options?.model === "deepseek-reasoner"
        ? process.env.DEEPSEEK_API_KEY
        : process.env.OPENAI_API_KEY,
    modelName: options?.model,
    temperature: options?.temperature || 0.6,
    configuration: {
      baseURL:
        options?.model === "deepseek-reasoner"
          ? "https://api.deepseek.com/v1"
          : undefined,
    },
  });

  const llmResponse = await model.invoke([
    {
      role: "system",
      content: options?.systemPrompt || "You are a helpful assistant.",
    },
    ...(history ? JSON.parse(history) : []),
    {
      role: "user",
      content: transcription.text,
    },
  ]);

  // completion to speech
  const speech = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: llmResponse.content.toString(),
  });

  return new Response(
    JSON.stringify({
      transcription,
      completion: llmResponse.content,
      speechUrl: Buffer.from(await speech.arrayBuffer()).toString("base64"),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export const config = {
  runtime: "edge",
};
