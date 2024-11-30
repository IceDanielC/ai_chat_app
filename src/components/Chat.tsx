import { Button, Textarea, Select, Switch, ActionIcon } from "@mantine/core";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  IconPlayerStop,
  IconTrash,
  IconBrandTelegram,
} from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";
import { message, Popconfirm, UploadFile } from "antd";

import styles from "./Chat.module.scss";
import { ChatLogType, SessionInfo } from "@/utils/types";
import chatService from "@/utils/getCompletions";
import {
  clearChatLogs,
  getChatLogs,
  updateChatLogs,
} from "@/utils/chatStorage";
import { getGeneratedImage } from "@/utils/getGeneratedImage";
import { googleSearch, online_prompt } from "@/utils/google";
import { Wellcome } from "./Wellcome";
import FileUpload from "./FileUpload";
import ChatDisplay from "./ChatDisplay";
import { removeUserUploadCenter, userUploadCenter } from "@/store/uploadStore";
import { DEFAULT_NEW_SESSION_NAME, MODELS } from "@/utils/constant";
import { SessionContext } from "@/pages";

export const Chat: React.FC = () => {
  const { sessionId, setSessionList } = useContext(SessionContext);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ChatLogType[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const chatLayoutRef = useRef<HTMLDivElement>(null);

  // 模型选择
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  // 联网设置
  const [isOnline, setIsOnline] = useState(false);

  const setChatListPersist = useCallback(
    (logs: ChatLogType[]) => {
      setHistoryList(logs);
      // 持久化
      if (sessionId) updateChatLogs(sessionId, logs);
      else {
        // 获取url中的sessionId
        const sessionId = new URLSearchParams(window.location.search).get(
          "sessionId"
        );
        updateChatLogs(sessionId!, logs);
      }
    },
    [sessionId]
  );

  const setSuggestion = useCallback(
    (suggestion: string) => {
      const len = historyList.length;
      const lastMessage = len ? historyList[len - 1] : null;
      let newList: ChatLogType[] = [];
      if (lastMessage?.role === "assistant") {
        historyList.pop();
        newList = [
          ...historyList,
          {
            ...lastMessage,
            content: suggestion,
          },
        ];
      } else {
        newList = [
          ...historyList,
          {
            role: "assistant",
            content: suggestion,
          },
        ];
      }
      setChatListPersist(newList);
    },
    [historyList, setChatListPersist]
  );

  // 提供给chatService的回调
  useEffect(() => {
    chatService.actions = {
      onStream: (sug) => setSuggestion(sug),
      onFinish: () => {
        setLoading(false);
      },
    };
  }, [setSuggestion]);

  useEffect(() => {
    const getChatList = getChatLogs(sessionId);
    setHistoryList(getChatList);
  }, [sessionId]);

  // 滚动到最底部
  useLayoutEffect(() => {
    if (chatLayoutRef.current) {
      chatLayoutRef.current.scrollTo({
        top: chatLayoutRef.current.scrollHeight,
        behavior: "smooth", // 使用平滑滚动效果
      });
    }
  }, [historyList]);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const getGptResponse = useCallback(
    async (prompt: string, attachedFileUrl?: string) => {
      // 若正在请求中，停止请求
      if (loading) {
        chatService.abortStream();
        return;
      }
      setLoading(true);
      // 用户是否上传了文件
      const list: ChatLogType[] = attachedFileUrl
        ? [
            ...historyList,
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: attachedFileUrl,
                  },
                },
              ],
            },
          ]
        : [...historyList, { role: "user", content: prompt }];
      // 保存历史记录上下文(user)
      setChatListPersist(list);
      // 清空输入框
      setPrompt("");
      // 若开启联网
      let enhancedPrompt = "";
      if (isOnline) {
        // 若开启联网，调用google搜索
        const searchRes = await googleSearch(prompt);
        enhancedPrompt = online_prompt(searchRes, prompt);
      }

      try {
        if (attachedFileUrl) {
          // 若用户上传了文件
          chatService.getStreamCompletions({
            prompt: [
              {
                type: "text",
                text: isOnline ? enhancedPrompt : prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: attachedFileUrl,
                },
              },
            ],
            history: historyList,
            model: selectedModel,
          });
        } else {
          chatService.getStreamCompletions({
            prompt: isOnline ? enhancedPrompt : prompt,
            history: historyList,
            model: selectedModel,
          });
        }
      } catch (error) {
        //若出现异常回退
        messageApi.error(error + "");
        setLoading(false);
        list.pop();
        setChatListPersist(list);
        return;
      }
    },
    [
      historyList,
      isOnline,
      loading,
      messageApi,
      selectedModel,
      setChatListPersist,
    ]
  );

  // dall-e-3 生成图片
  const generateImage = useCallback(
    async (prompt: string) => {
      // 若正在请求中，停止请求
      if (loading) {
        chatService.abortStream();
        return;
      }
      setLoading(true);
      // 清空输入框
      setPrompt("");
      // 保存历史记录上下文(user)
      const list: ChatLogType[] = [
        ...historyList,
        { role: "user", content: prompt },
      ];
      setChatListPersist(list);
      let image = null;
      try {
        image = await getGeneratedImage({
          prompt,
          model: selectedModel,
        });
      } catch (error) {
        // 若出现异常回退
        messageApi.error(error + "");
        setLoading(false);
        list.pop();
        setChatListPersist(list);
        return;
      }
      setLoading(false);
      // 保存历史记录上下文(gpt)
      setChatListPersist([
        ...list,
        { role: "assistant", content: image.data[0].url },
      ]);
      console.log("dall-e-3返回:", image.data[0]);
    },
    [historyList, loading, messageApi, selectedModel, setChatListPersist]
  );

  return (
    <div className="h-screen flex flex-col items-center grow bg-light-green-gradient">
      {contextHolder}
      {/* chat展示区域 */}
      <div className="my-3 text-2xl font-bold font-sans">
        🌳 Your all-purpose QA assistant
      </div>
      <div
        ref={chatLayoutRef}
        className="h-[80vh] overflow-y-auto px-6 w-[80vw] bg-gray-100 rounded-lg"
      >
        {historyList.length === 0 && (
          // 兜底图
          <div className="flex justify-center">
            <Wellcome />
          </div>
        )}
        {historyList.map((history, idx) => (
          <div key={`${history.role}-${idx}`} className="flex">
            <div
              className={clsx({
                hidden: history.role === "user",
                "self-start": history.role !== "user",
                "mr-2": history.role !== "user",
                relative: history.role !== "user",
                "top-[20px]": history.role !== "user",
              })}
            >
              <Image
                src="https://mark-ai.oss-cn-hangzhou.aliyuncs.com/20241013-020521045cb66e283bf8db2832480e7d93f00d.jpg"
                alt=""
                width={50}
                height={100}
                className="rounded-full"
              />
            </div>
            <div
              className={
                clsx({
                  "bg-green-200": history.role === "user",
                  "bg-white": history.role === "assistant",
                  relative: history.role === "user",
                  "left-[100%]": history.role === "user",
                  "transform translate-x-[-100%]": history.role === "user",
                }) + " px-4 py-3 rounded-lg my-4 table shrink-[20]"
              }
            >
              <ChatDisplay role={history.role} content={history.content} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-[80vw] justify-center mt-2">
        <FileUpload fileList={fileList} setFileList={setFileList} />
        <Textarea
          value={prompt}
          placeholder="Enter your Content Here..."
          className={styles["chat-input"]}
          onChange={(e) => setPrompt(e.target.value)}
          styles={() => ({
            input: {
              height: "90px",
            },
          })}
        />
        <div>
          <Switch
            className="my-1 ml-1"
            labelPosition="left"
            label="Online"
            size="xs"
            checked={isOnline}
            onChange={(value) => {
              setIsOnline(value.target.checked);
              if (value.target.checked) {
                messageApi.success("online is opened");
              } else {
                messageApi.info("online is closed");
              }
            }}
          />
          <Select
            size="xs"
            w={"150px"}
            value={selectedModel}
            onChange={(value) => setSelectedModel(value!)}
            data={MODELS}
          />
          <div className="flex">
            <Button
              className={"self-end " + (loading ? styles["ripple-button"] : "")}
              leftIcon={loading ? <IconPlayerStop /> : <IconBrandTelegram />}
              onClick={() => {
                if (selectedModel === "dall-e-3") {
                  // 图片生成模型
                  generateImage(prompt);
                } else {
                  // 通过userUploadCenter的uid判断用户是否上传图片（文件）
                  if (userUploadCenter.uid) {
                    getGptResponse(prompt, userUploadCenter.response?.data);
                    // 清空center和Upload组件的List
                    removeUserUploadCenter(userUploadCenter.uid);
                    setFileList([]);
                  } else {
                    getGptResponse(prompt);
                  }
                }
                // 若当然会话的name是"新会话",则改为prompt.slice(8)
                // url获取当前sessionId
                const url = new URL(window.location.href);
                const sessionId = url.searchParams.get("sessionId");
                let alter = false;
                if (sessionId) {
                  const list = JSON.parse(
                    localStorage.getItem("sessionList") || "[]"
                  ) as SessionInfo[];
                  list.forEach((session) => {
                    if (
                      session.sessionId === sessionId &&
                      session.sessionName === DEFAULT_NEW_SESSION_NAME
                    ) {
                      session.sessionName = prompt.slice(0, 8) + "...";
                      alter = true;
                    }
                  });
                  if (alter) {
                    localStorage.setItem("sessionList", JSON.stringify(list));
                    // 让SessionManager重新渲染
                    setSessionList(list);
                  }
                }
              }}
              disabled={prompt.length === 0 && !loading}
            >
              {loading ? "Stop" : "Send"}
            </Button>
            <Popconfirm
              title="Clear context records for this session"
              description="Are you sure you want to clear the all context record?"
              onConfirm={() => {
                clearChatLogs(sessionId);
                messageApi.success("All context records have been cleared");
                // 刷新页面
                window.location.reload();
              }}
              okText="Yes"
              cancelText="No"
            >
              <ActionIcon
                className="self-center ml-1"
                color="red"
                variant="outline"
              >
                <IconTrash size="1.125rem" />
              </ActionIcon>
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>
  );
};
