export const online_prompt = (searchRes: string, userPrompt: string) => {
  return `
        您现在是一个具备联网功能的智能助手。我将提供一段来自互联网的文本信息。请根据这段文本以及用户提出的问题来给出回答。如果网络资料中的信息不足以回答用户的问题，请回复说无法提供确切的答案，不要试图编造答案。
        网络资料:
        ------------------------------------------
        ${searchRes}
        -------------------------------------------
        用户问题:
        --------------------------------------------
        ${userPrompt}
        ---------------------------------------------`;
};

export const googleSearch = async (searchKey: string) => {
  const googleSearchKey = "AIzaSyAI_9SWpOk8vt2TnQjVSHzwMxDHrRgd3fc";
  const googleCxId = "73f004d0b3ac04d0c";

  try {
    // 用Next.js做一层代理，避免国内的网络访问被限制
    const response = await fetch("/api/google_search", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ googleSearchKey, googleCxId, searchKey }),
    });
    const data = await response.json();

    return data.items
      .map((item: { snippet: string }) => item.snippet)
      .join("\n"); // 返回搜索结果
  } catch (error) {
    console.error("搜索错误:", error);
    return "搜索结果出现异常，请忽略";
  }
};

// 获取网站url和title
export const getUrlAndTitleList = async (searchKey: string) => {
  const googleSearchKey = "AIzaSyAI_9SWpOk8vt2TnQjVSHzwMxDHrRgd3fc";
  const googleCxId = "73f004d0b3ac04d0c";
  const response = await fetch("/api/google_search", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ googleSearchKey, googleCxId, searchKey }),
  });
  const data = await response.json();
  return data.items;
};
