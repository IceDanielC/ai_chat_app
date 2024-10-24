export const googleSearch = async (searchKey: string) => {
  const googleSearchKey = "AIzaSyAI_9SWpOk8vt2TnQjVSHzwMxDHrRgd3fc";
  const googleCxId = "73f004d0b3ac04d0c";
  const baseurl = "https://www.googleapis.com/customsearch/v1";
  try {
    const response = await fetch(
      `${baseurl}?key=${googleSearchKey}&cx=${googleCxId}&q=${searchKey}&c2coff=1&start=1&end=10&dateRestrict=m[1]`
    );
    const data = await response.json();
    return data.items.map((item: { snippet: string; }) => item.snippet).join("\n"); // 返回搜索结果
  } catch (error) {
    console.error("搜索错误:", error);
    return "搜索结果出现异常，请忽略";
  }
};
