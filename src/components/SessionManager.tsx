import type { SessionInfo } from "@/utils/types";
import { Button, List, Modal } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SessionManager.module.scss";
import { IconTrash } from "@tabler/icons-react";
import { SessionContext } from "@/pages";
import { DEFAULT_NEW_SESSION_NAME } from "@/utils/constant";

const SessionManager: React.FC = () => {
  const { setSessionId, sessionList, setSessionList } =
    useContext(SessionContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState("");

  // 创建新会话
  const createSession = useCallback(() => {
    const newSession = {
      sessionId: Date.now().toString(),
      sessionName: DEFAULT_NEW_SESSION_NAME,
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
      // 如果sessionId为空，设置为第一个会话的sessionId
      if (!sessionId) {
        router.push(pathname + "?sessionId=" + sessionList[0].sessionId);
      }
      setSessionId(sessionId || sessionList[0].sessionId);
      setCurrentSession(sessionId || sessionList[0].sessionId);
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
        ➕ New Session
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
        title="Are you sure to delete this session record?"
        open={isModalOpen}
        onOk={deleteSession}
        onCancel={() => setIsModalOpen(false)}
      >
        <p>The session records cannot be recovered or retrieved after deletion, so please be careful!</p>
      </Modal>
    </div>
  );
};

export default SessionManager;
