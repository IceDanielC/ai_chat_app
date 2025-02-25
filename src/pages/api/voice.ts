import { OpenAI } from "openai";
import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export default async function handler(req: NextRequest, res: NextApiResponse) {
  const formdata = await req.formData();
  const file = formdata.get("file") as File;
  const history = formdata.get("history") as string;
  const options = JSON.parse(formdata.get("options") as string);
  const modelName = formdata.get("modelName") as string;

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
      modelName === "deepseek-reasoner"
        ? process.env.DEEPSEEK_API_KEY
        : process.env.OPENAI_API_KEY,
    modelName,
    temperature: options?.temperature || 0.6,
    configuration: {
      baseURL:
        modelName === "deepseek-reasoner"
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

  res.status(200).json({
    transcription,
    completion: llmResponse.content,
    speechUrl: Buffer.from(await speech.arrayBuffer()).toString("base64"),
  });
}

export const config = {
  runtime: "edge",
};
