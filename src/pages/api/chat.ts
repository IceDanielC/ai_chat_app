// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { StreamPayload } from "@/utils/types";
import { createParser } from "eventsource-parser";
import type { NextRequest } from "next/server";

export default async function handler(req: NextRequest) {
  const { prompt, history = [], options = {}, model } = await req.json();

  const data = {
    model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      ...history,
      {
        role: "user",
        content: prompt,
      },
    ],
    ...options,
    // 流式传输
    stream: true,
  };

  const stream = await requestCompletionStream(data);
  return new Response(stream);
}

const requestCompletionStream = async (payload: StreamPayload) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if(response.status !== 200) {
        return response.status + ": " + response.statusText
    }

    return handleStream(response);
  } catch (error: any) {
    // 网络、token超额等问题
    console.log("err: ", error);
    return error.cause;
  } 
};

const handleStream = (response: Response, counter: number = 0) => {
  const decoder = new TextDecoder("utf-8");
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const parser = createParser({
        onEvent: (event) => {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0]?.delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        },
      });

      for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
        // console.log("@", decoder.decode(chunk));
        parser.feed(decoder.decode(chunk));
      }
    },
  });
};

// API route returned a Response object in the Node.js runtime, this is not supported.
// Please use `runtime: "edge"` instead: https://nextjs.org/docs/api-routes/edge-api-routes
export const config = {
  runtime: "edge",
};
