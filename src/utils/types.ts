export type ChatLogType = {
    role: "user" | "assistant" | "system"; 
    content: string;
}

export type CompletionProps = {
    prompt: string;
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
    model: string
}

export type ChatLogsStoragetype = {
    [key: string]: ChatLogType[];
}

export type ImageRequestType = {
    model: string;
    prompt: string;
    size?: string;
    n?: number;
}

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
}

export type SessionInfo = {
    sessionId: string;
    sessionName: string;
}