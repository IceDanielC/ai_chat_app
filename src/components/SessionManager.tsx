import type { SessionInfo } from "@/utils/types";
import { Button, List, Modal } from "antd";
import { useEffect, useState } from "react";
import styles from "./SessionManager.module.scss";
import { IconTrash } from "@tabler/icons-react";

export const SessionManager: React.FC<{
  setSessionId: (sessionId: string) => void;
  sessionList: SessionInfo[];
  setSessionList: (sessionList: SessionInfo[]) => void;
}> = ({ setSessionId, sessionList, setSessionList }) => {
  const [activeSession, setActiveSession] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const sessionList = JSON.parse(localStorage.getItem("sessionList") || "[]");
    setSessionList(sessionList);
    // 从url的sessionId中获取activeSession
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("sessionId");
    setActiveSession(sessionId || "");
  }, [setSessionList]);

  // 创建新会话
  const createSession = () => {
    const newSession = {
      sessionId: Date.now().toString(),
      sessionName: "新会话",
    };
    localStorage.setItem(
      "sessionList",
      JSON.stringify([newSession, ...sessionList])
    );
    const url = new URL(window.location.href);
    url.searchParams.set("sessionId", newSession.sessionId);
    window.history.pushState({}, "", url);
    setActiveSession(newSession.sessionId);
    setSessionId(newSession.sessionId);
    setSessionList([newSession, ...sessionList]);
  };

  // 删除当前会话
  const deleteSession = () => {
    const newSessionList = sessionList.filter(
      (session) => session.sessionId !== activeSession
    );
    localStorage.setItem("sessionList", JSON.stringify(newSessionList));
    setSessionList(newSessionList);
    setIsModalOpen(false);
    // 切换到第一个会话
    if (newSessionList.length > 0) {
      const url = new URL(window.location.href);
      url.searchParams.set("sessionId", newSessionList[0].sessionId);
      window.history.pushState({}, "", url);
      setActiveSession(newSessionList[0].sessionId);
      setSessionId(newSessionList[0].sessionId);
    }
  };

  return (
    <div className={styles["manager-list"] + " grow-[2]"}>
      <Button
        type="dashed"
        className="grow-[1] mt-2 relative left-[20%] w-[50%]"
        onClick={createSession}
      >
        ➕ 创建新会话
      </Button>
      <List
        itemLayout="horizontal"
        split={false}
        dataSource={sessionList}
        renderItem={(item) => (
          <List.Item
            className={
              styles["item-list"] +
              " " +
              styles[activeSession === item.sessionId ? "active" : ""]
            }
            onClick={() => {
              // 将url的sessionId设置为item.sessionId，但不要刷新页面
              const url = new URL(window.location.href);
              url.searchParams.set("sessionId", item.sessionId);
              window.history.pushState({}, "", url);
              setActiveSession(item.sessionId);
              setSessionId(item.sessionId);
            }}
          >
            <div className="ml-3">{item.sessionName}</div>
            <IconTrash
              style={{ display: "none" }}
              size={20}
              className={"mr-2 " + styles["delete-icon"]}
              onClick={() => setIsModalOpen(true)}
            />
          </List.Item>
        )}
      ></List>
      <Modal
        title="确认删除这 1 条对话记录吗？"
        open={isModalOpen}
        onOk={deleteSession}
        onCancel={() => setIsModalOpen(false)}
      >
        <p>删除后对话记录无法恢复和找回，请谨慎操作</p>
      </Modal>
    </div>
  );
};
