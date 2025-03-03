import React, { useState, useRef } from "react";
import { FloatButton, Tooltip } from "antd";
import { IconMicrophone } from "@tabler/icons-react";
import MicroRecorder from "mic-recorder-to-mp3";
import styles from "./Voice.module.scss";
import { getChatLogs } from "@/utils/chatStorage";

// 创建录音实例
const mp3Recorder = new MicroRecorder({
  bitRate: 1128,
  mimeType: "audio/mp3",
});

interface VoiceProps {
  onVoiceRecognized?: (userText: string, assistantText: string) => void;
  sessionId: string;
  options: {
    model: string;
    systemPrompt?: string;
    temperature?: number;
  };
  onLoadingChange?: (isLoading: boolean) => void;
}

const Voice: React.FC<VoiceProps> = ({
  onVoiceRecognized,
  sessionId,
  options,
  onLoadingChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // 更新加载状态的函数
  const updateLoadingState = (loading: boolean) => {
    setIsLoading(loading);
    // 通知父组件加载状态变化
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  };

  const handleVoiceAndGetAnswer = async (blob: Blob) => {
    const history = getChatLogs(sessionId);
    const assistantOptions = options || {};
    const formData = new FormData();
    formData.append("file", blob, "prompt.mp3");
    formData.append("options", JSON.stringify(assistantOptions));
    formData.append("history", JSON.stringify(history));

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("语音识别结果:", data);

      // 如果有回调函数，通过识别的文本
      if (onVoiceRecognized && data.transcription && data.transcription.text) {
        onVoiceRecognized(data.transcription.text, data.completion);
      }

      // 处理完成，更新加载状态
      updateLoadingState(false);

      const audio = new Audio(`data:audio/mp3;base64,${data.speechUrl}`);
      audio.play();
    } catch (error) {
      console.error("语音处理失败:", error);
      updateLoadingState(false);
    }
  };

  // 开始语音录制
  const startVoiceChat = () => {
    // 获取麦克风权限
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        // 保存媒体流的引用
        mediaStreamRef.current = stream;
        // 开始录音
        mp3Recorder
          .start()
          .then(() => {
            // 设置录音状态为 true，改变按钮背景色
            setIsRecording(true);
          })
          .catch((err) => console.error("录音失败:", err));
      })
      .catch((err) => {
        console.error("获取麦克风权限失败:", err);
        setIsRecording(false); // 失败时恢复按钮状态
      });
  };

  // 停止语音录制
  const stopVoiceChat = () => {
    if (!isRecording) return;

    // 停止所有音频轨道
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    // 更新加载状态
    updateLoadingState(true);

    mp3Recorder
      .stop()
      .getMp3()
      .then(async ([buffer, blob]: [any, Blob]) => {
        console.log("录音已停止，处理录音数据", blob);
        await handleVoiceAndGetAnswer(blob);
      })
      .catch((err: Error) => {
        console.error("停止录音失败:", err);
        updateLoadingState(false);
      });
  };

  return (
    <Tooltip title="按住说话">
      <FloatButton
        type="primary"
        className={`absolute top-[8px] right-1/4 ${styles["float-voice-btn"]} ${
          isRecording ? styles["recording-btn"] : ""
        }`}
        style={{ zIndex: 49 }}
        onMouseDown={startVoiceChat}
        onMouseUp={stopVoiceChat}
        onMouseLeave={stopVoiceChat} // 鼠标移出按钮范围也停止录音
        icon={<IconMicrophone />}
      />
    </Tooltip>
  );
};

export default Voice;
