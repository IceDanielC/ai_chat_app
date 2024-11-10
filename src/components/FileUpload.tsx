import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Button, Form, Popover, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import {
  setUserUploadCenter,
  removeUserUploadCenter,
  userUploadCenter,
} from "@/store/uploadStore";

const FileUpload: React.FC<{
  fileList: UploadFile[];
  setFileList: (fileList: UploadFile[]) => void;
}> = ({ fileList, setFileList }) => {
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // 只允许上传一个文件
    if (newFileList.length > 1) {
      newFileList = newFileList.slice(-1);
    }
    setFileList(newFileList);
    if (newFileList[0] && newFileList[0].status === "done") {
      setUserUploadCenter(newFileList[0]);
    }
    console.log("userUploadCenter", userUploadCenter);
  };

  const handleRemove: UploadProps["onRemove"] = (file) => {
    if (file.uid) removeUserUploadCenter(file.uid);
  };

  // 上传前预处理
  const preHandle = (file: RcFile): Promise<Blob> | undefined => {
    if (file.size! < 1024 * 1024 * 3) return;
    // 当图片大小大于2MB时启用压缩
    return new Promise<Blob>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = document.createElement("img");
        // reader.result是图片转换成base64的结果
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          // 图片压缩：toBlob的第三个参数
          canvas.toBlob((result) => resolve(result as Blob), "image/jpeg", 0.3);
        };
      };
    });
  };

  return (
    <Form labelCol={{ span: 4 }} className="mr-2">
      <Form.Item label="" name="files">
        <Upload
          action="http://118.178.238.73:8081/upload/image"
          fileList={fileList}
          onChange={handleChange}
          onRemove={handleRemove}
          beforeUpload={preHandle}
          multiple={false}
        >
          <Popover placement="top" content={"目前只支持png,jpg等格式的图片"}>
            <Button size="small" type="dashed">
              <UploadOutlined /> <span>Upload</span>
            </Button>
          </Popover>
        </Upload>
      </Form.Item>
    </Form>
  );
};

export default FileUpload;
