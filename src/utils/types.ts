export type Content = {
  type: "text" | "image_url";
  text?: string;
  image_url?: Record<string, any>;
};

export type WebsiteInfo = {
  title: string;
  url: string;
  content?: string;
};

export type ChatLogType = {
  role: "user" | "assistant" | "system";
  content: string | Content[];
  websites?: WebsiteInfo[];
  cot?: string;
};

export type CompletionProps = {
  prompt: string | Content[];
  history?: ChatLogType[];
  options?: {
    temperature?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string | string[];
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    logit_bias?: Record<string, number>;
    user?: string;
  };
  model: string;
  websites?: WebsiteInfo[];
};

export type ChatLogsStoragetype = {
  [key: string]: ChatLogType[];
};

export type ImageRequestType = {
  model: string;
  prompt: string;
  size?: string;
  n?: number;
};

export type StreamPayload = {
  model: string;
  messages: ChatLogType[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
};

export type SessionInfo = {
  sessionId: string;
  sessionName: string;
};
