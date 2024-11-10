import { Chat } from "@/components/Chat";
import SessionManager from "@/components/SessionManager";
import { SessionInfo } from "@/utils/types";
import { ConfigProvider } from "antd";
import { createContext, useEffect, useState } from "react";

export const SessionContext = createContext<{
  sessionId: string;
  setSessionId: (sessionId: string) => void;
  sessionList: SessionInfo[];
  setSessionList: (sessionList: SessionInfo[]) => void;
}>({} as any);

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const [sessionList, setSessionList] = useState<SessionInfo[]>([]);

  useEffect(() => {
    // 从url获取sessionId
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("sessionId");
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, []);

  return (
    <main className="min-w-[600px]">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#40c057",
          },
        }}
      >
        <div className="flex">
          <SessionContext.Provider
            value={{ sessionId, setSessionId, sessionList, setSessionList }}
          >
            <SessionManager />
            <Chat />
          </SessionContext.Provider>
        </div>
      </ConfigProvider>
    </main>
  );
}
