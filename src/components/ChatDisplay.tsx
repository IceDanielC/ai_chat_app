import { Content, WebsiteInfo } from "@/utils/types";
import assert from "assert";
import Image from "next/image";
import Markdown from "./Markdown";
import { Collapse, Spin } from "antd";

type DisplayProps = {
  role: "user" | "assistant" | "system";
  content: string | Content[];
  websites?: WebsiteInfo[];
  cot?: string;
};

const WebsiteList: React.FC<{ websites: WebsiteInfo[] }> = ({ websites }) => {
  return (
    <div className="text-sm text-gray-600 ml-4">
      {websites.map((site, index) => (
        <div key={index} className="mb-2">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {site.title}
          </a>
        </div>
      ))}
    </div>
  );
};

const ChatDisplay: React.FC<DisplayProps> = ({
  role,
  content,
  websites,
  cot,
}) => {
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
    if (!content && !cot) {
      return <Spin />;
    }
    /* 如果以http开头，并以.png或者.jpg或者.jpeg或者.webp结尾，视为图片，展示图片 */
    if (/^https?:\/\/.*\.(png|jpg|jpeg|webp)/i.test(content)) {
      return <Image src={content} alt="" width={500} height={0} />;
    } else {
      return (
        <div>
          {/* 展示思维链 */}
          {cot && (
            <Collapse
              ghost
              className="bg-gray-50 rounded my-2"
              defaultActiveKey={["1"]}
              items={[
                {
                  key: "1",
                  label: <span style={{ color: "#8f91a8" }}>已深度思考</span>,
                  children: (
                    <div className="text-sm text-gray-600 mb-3 border-l-4 border-gray-300 pl-2">
                      {cot}
                    </div>
                  ),
                },
              ]}
            />
          )}
          {/* 展示查到的网页 */}
          {websites && websites.length > 0 && (
            <Collapse
              ghost
              className="bg-gray-50 rounded my-2"
              items={[
                {
                  label: (
                    <span
                      style={{ color: "#8f91a8" }}
                    >{`检索到的${websites.length}个网页`}</span>
                  ),
                  children: <WebsiteList websites={websites} />,
                },
              ]}
            />
          )}
          <Markdown markdownText={content} />
        </div>
      );
    }
  }
};

export default ChatDisplay;
