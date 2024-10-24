export type ChatLogType = {
    role: string;
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