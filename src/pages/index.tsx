import { Chat } from "@/components/Chat";
import { ConfigProvider } from "antd";

export default function Home() {
  return (
    <main>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#40c057",
          },
        }}
      >
        <Chat />
      </ConfigProvider>
    </main>
  );
}
