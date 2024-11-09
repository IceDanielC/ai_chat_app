import { Chat } from "@/components/Chat";
import { SessionManager } from "@/components/SessionManager";
import { SessionInfo } from "@/utils/types";
import { ConfigProvider } from "antd";
import { useEffect, useState } from "react";

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
    <main>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#40c057",
          },
        }}
      >
        <div className="flex">
          <SessionManager
            setSessionId={setSessionId}
            sessionList={sessionList}
            setSessionList={setSessionList}
          />
          <Chat sessionId={sessionId} setSessionList={setSessionList} />
        </div>
      </ConfigProvider>
    </main>
  );
}
