import { CompletionProps, WebsiteInfo } from "./types";

type Actions = {
  onStream: (
    completions: string,
    websites?: WebsiteInfo[],
    thoughtChain?: string
  ) => void;
  onFinish?: (completions: string) => void;
};

// 单例ChatService
class ChatService {
  private constructor() {
    this.controller = new AbortController();
  }

  private controller: AbortController;
  public actions?: Actions;
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async getStreamCompletions(params: CompletionProps) {
    let completions = "";
    let thoughtChain = "";

    try {
      const response = await fetch("/api/chat", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(params),
        signal: this.controller.signal,
      });

      // 解析response的stream
      const data = response.body;
      if (!data) return null;
      const reader = data.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReadStream } = await reader.read();
        done = doneReadStream;
        const chunkValue = decoder.decode(value);

        // 检查是否是思维链输出 (以 "THOUGHT:" 含有的内容)
        if (chunkValue.includes("THOUGHT:")) {
          // 使用正则移除所有 "THOUGHT:"
          thoughtChain += chunkValue.replace(/THOUGHT:|\n/g, "");
          this.actions?.onStream(completions, undefined, thoughtChain);
        } else {
          completions += chunkValue;
          this.actions?.onStream(completions, params.websites, thoughtChain);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Failed to fetch completions", error);
    } finally {
      this.actions?.onFinish?.(completions);
      this.controller = new AbortController();
    }
  }

  public abortStream() {
    this.controller.abort();
  }
}

export default ChatService.getInstance();
