import type { SessionInfo } from "@/utils/types";
import { Button, List, Modal } from "antd";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SessionManager.module.scss";
import { IconTrash } from "@tabler/icons-react";

const SessionManager: React.FC<{
  setSessionId: (sessionId: string) => void;
  sessionList: SessionInfo[];
  setSessionList: (sessionList: SessionInfo[]) => void;
}> = ({ setSessionId, sessionList, setSessionList }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState("");

  // 创建新会话
  const createSession = useCallback(() => {
    const newSession = {
      sessionId: Date.now().toString(),
      sessionName: "新会话",
    };
    localStorage.setItem(
      "sessionList",
      JSON.stringify([newSession, ...sessionList])
    );
    router.push(pathname + "?sessionId=" + newSession.sessionId);
    setSessionId(newSession.sessionId);
    setSessionList([newSession, ...sessionList]);
    setCurrentSession(newSession.sessionId);
  }, [pathname, router, sessionList, setSessionId, setSessionList]);

  // 组件挂载时，用户刷新浏览器
  useEffect(() => {
    const sessionList = JSON.parse(
      localStorage.getItem("sessionList") || "[]"
    ) as SessionInfo[];
    // 当前sessionList为空时，自动创建新的会话
    if (sessionList.length === 0) {
      createSession();
    } else {
      setSessionList(sessionList);
      const sessionId = new URLSearchParams(window.location.search).get(
        "sessionId"
      );
      setSessionId(sessionId || "");
      if (sessionId) setCurrentSession(sessionId);
    }
  }, []);

  // 删除当前会话
  const deleteSession = () => {
    const newSessionList = sessionList.filter(
      (session) => session.sessionId !== currentSession
    );
    localStorage.setItem("sessionList", JSON.stringify(newSessionList));
    setSessionList(newSessionList);
    setIsModalOpen(false);
    // 切换到第一个会话
    if (newSessionList.length > 0) {
      router.push(pathname + "?sessionId=" + newSessionList[0].sessionId);
      setSessionId(newSessionList[0].sessionId);
      setCurrentSession(newSessionList[0].sessionId);
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
              (currentSession === item.sessionId ? styles.active : "")
            }
            onClick={() => {
              // 将url的sessionId设置为item.sessionId，但不刷新页面
              router.push(pathname + "?sessionId=" + item.sessionId);
              setSessionId(item.sessionId);
              setCurrentSession(item.sessionId);
            }}
          >
            <div className="ml-3">{item.sessionName}</div>
            <IconTrash
              style={{ display: "none" }}
              size={20}
              className={"mr-2 " + styles["delete-icon"]}
              onClick={() => {
                setIsModalOpen(true);
                setCurrentSession(item.sessionId);
              }}
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

export default SessionManager;
