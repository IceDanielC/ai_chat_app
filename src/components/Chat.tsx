import { getCompletions } from "@/utils/getCompletions";
import { Button, Textarea, Select, Switch } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";
import { message } from "antd";

import styles from "./Chat.module.scss";
import { ChatLogType } from "@/utils/types";
import { getChatLogs, updateChatLogs } from "@/utils/chatStorage";
import { getGeneratedImage } from "@/utils/getGeneratedImage";
import { googleSearch } from "@/utils/google";

const TMP_SESSION_CHAT = "chat_01";

export const Chat: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ChatLogType[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  // 模型选择
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  // 联网设置
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const getChatList = getChatLogs(TMP_SESSION_CHAT);
    setHistoryList(getChatList);
  }, []);

  const setChatListPersist = (logs: ChatLogType[]) => {
    setHistoryList(logs);
    // 持久化
    updateChatLogs(TMP_SESSION_CHAT, logs);
  };

  const getGptResponse = async (prompt: string) => {
    setLoading(true);
    // 保存历史记录上下文(user)
    const list = [...historyList, { role: "user", content: prompt }];
    setChatListPersist(list);
    // 清空输入框
    setPrompt("");
    // 若开启联网
    let enhancedPrompt = "";
    if (isOnline) {
      // 若开启联网，调用google搜索
      const searchRes = await googleSearch(prompt);
      enhancedPrompt = `
        您现在是一个具备联网功能的智能助手。我将提供一段来自互联网的文本信息。请根据这段文本以及用户提出的问题来给出回答。如果网络资料中的信息不足以回答用户的问题，请回复说无法提供确切的答案。
        网络资料:
        ------------------------------------------
        ${searchRes}
        -------------------------------------------
        用户问题:
        --------------------------------------------
        ${prompt}
        ---------------------------------------------`;
    }

    let response = null;
    try {
      response = await getCompletions({
        prompt: isOnline ? enhancedPrompt : prompt,
        history: historyList,
        model: selectedModel,
      });
    } catch (error) {
      //若出现异常回退
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
      { role: "assistant", content: response.message.content },
    ]);
    console.log("gptAPI返回:", response);
  };

  // dall-e-3 生成图片
  const generateImage = async (prompt: string) => {
    setLoading(true);
    // 清空输入框
    setPrompt("");
    // 保存历史记录上下文(user)
    const list = [...historyList, { role: "user", content: prompt }];
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
  };

  return (
    <div className="h-screen flex flex-col items-center">
      {contextHolder}
      <div className="h-[80vh] overflow-y-auto px-6 w-[80vw] bg-gray-100">
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
              <div>{history.content}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-[80vw] justify-center">
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
            label="开启联网"
            size="xs"
            checked={isOnline}
            onChange={(value) => {
              setIsOnline(value.target.checked);
              if (value.target.checked) {
                messageApi.success("联网已开启");
              } else {
                messageApi.info("联网已关闭");
              }
            }}
          />
          <Select
            size="xs"
            w={"150px"}
            value={selectedModel}
            onChange={(value) => setSelectedModel(value!)}
            data={[
              { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
              { value: "gpt-4o", label: "gpt-4o" },
              { value: "gpt-4", label: "gpt-4" },
              { value: "gpt-4o-mini", label: "gpt-4o-mini" },
              { value: "dall-e-3", label: "dall-e-3" },
            ]}
          />
          <Button
            className="self-end"
            leftIcon={<IconExternalLink />}
            loading={loading}
            onClick={() => {
              if (selectedModel === "dall-e-3") {
                generateImage(prompt);
              } else {
                getGptResponse(prompt);
              }
            }}
            disabled={prompt.length === 0 && !loading}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
