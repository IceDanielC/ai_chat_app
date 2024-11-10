import { Content } from "@/utils/types";
import assert from "assert";
import Image from "next/image";
import Markdown from "./Markdown";

type DisplayProps = {
  role: "user" | "assistant" | "system";
  content: string | Content[];
};

const ChatDisplay: React.FC<DisplayProps> = ({ role, content }) => {
  if (role === "user") {
    // 不带文件，直接展示
    if (typeof content === "string") return <div>{content}</div>;
    // 带文件，展示prompt和图片
    else {
      return (
        <>
          <div>{content[0].text}</div>
          <div className="mt-2">
            <Image
              src={content[1].image_url?.url}
              alt=""
              width={400}
              height={100}
            />
          </div>
        </>
      );
    }
  } else if (role === "assistant") {
    // 如果role是assistant，content是string
    assert(typeof content === "string");
    /* 如果以http开头，并以.png或者.jpg或者.jpeg或者.webp结尾，视为图片，展示图片 */
    if (/^https?:\/\/.*\.(png|jpg|jpeg|webp)/i.test(content)) {
      return <Image src={content} alt="" width={500} height={0} />;
    } else {
      return <Markdown markdownText={content} />;
    }
  }
};

export default ChatDisplay;
