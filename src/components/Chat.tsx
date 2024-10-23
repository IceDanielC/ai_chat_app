import { getCompletions } from "@/utils/getCompletions";
import { Button, Textarea, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";

import { ChatLogType } from "@/utils/types";
import { getChatLogs, updateChatLogs } from "@/utils/chatStorage";

const TMP_SESSION_CHAT = "chat_01";

export const Chat: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ChatLogType[]>([]);

  // 模型选择
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

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
    const response = await getCompletions({
      prompt,
      history: historyList,
      model: selectedModel,
    });
    setLoading(false);
    // 保存历史记录上下文(gpt)
    setChatListPersist([
      ...list,
      { role: "assistant", content: response.message.content },
    ]);
    console.log("gptAPI返回:", response);
  };

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="h-[80vh] overflow-y-auto px-6 w-[80vw] bg-gray-100">
        {historyList.map((history, idx) => (
          <div key={`${history.role}-${idx}`} className="flex">
            <div
              className={clsx({
                hidden: history.role === "user",
                "self-center": history.role !== "user",
                "mr-2": history.role !== "user",
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
          className="w-3/5"
          onChange={(e) => setPrompt(e.target.value)}
        ></Textarea>
        <Select
          size="xs"
          w={"8rem"}
          value={selectedModel}
          onChange={(value) => setSelectedModel(value!)}
          data={[
            { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
            { value: "gpt-4o", label: "gpt-4o" },
            { value: "gpt-4", label: "gpt-4" },
            { value: "gpt-4o-mini", label: "gpt-4o-mini" },
          ]}
        />
        <Button
          className="self-end relative left-[-8rem]"
          leftIcon={<IconExternalLink />}
          loading={loading}
          onClick={() => getGptResponse(prompt)}
          disabled={prompt.length === 0 && !loading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
