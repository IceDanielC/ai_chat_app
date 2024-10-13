import { ChatLogType, CompletionProps } from "./types"

type GptResponseType = {
    message: ChatLogType;
    index: number;
    finish_reason: string;
}

export const getCompletions = async (params: CompletionProps): Promise<GptResponseType> => {
    const resp = await fetch("/api/chat", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(params)
    })
    if(!resp.ok) {
        throw new Error("Failed to fetch completions "+ resp.statusText)
    }
    return resp.json()
}