import { ChatLogsStoragetype, ChatLogType } from "./types";

// 存储chatLogs
const CHAT_LOGS_KEY = "ai_chat_logs";

export const getChatLogsContainer = (): ChatLogsStoragetype => {
  let list = JSON.parse(localStorage.getItem(CHAT_LOGS_KEY) ?? "{}");
  if (!list) {
    list = {};
    localStorage.setItem(CHAT_LOGS_KEY, JSON.stringify(list));
  }
  return list;
};

export const getChatLogs = (id: string) => {
    return getChatLogsContainer()[id] || [];
};

export const updateChatLogs = (id: string, chatLogs: ChatLogType[]) => {
    const logs = getChatLogsContainer();
    logs[id] = chatLogs;
    localStorage.setItem(CHAT_LOGS_KEY, JSON.stringify(logs));
}

export const clearChatLogs = (id: string) => {
    const logs = getChatLogsContainer();
    if (logs[id]) {
        logs[id] = [];
        localStorage.setItem(CHAT_LOGS_KEY, JSON.stringify(logs));
    }
}