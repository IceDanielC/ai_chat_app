import { ImageRequestType } from "./types";

type ImageResponseType = {
  created: number;
  data: {
    revised_prompt: string;
    url: string;
  }[];
};

export const getGeneratedImage = async (
  params: ImageRequestType
): Promise<ImageResponseType> => {
  const resp = await fetch("/api/image_generate", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(params),
  });
  if (!resp.ok) {
    throw new Error("Failed to generate image" + resp.statusText);
  }
  return resp.json();
};
