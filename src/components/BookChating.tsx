import {
  Alert,
  Button,
  Collapse,
  CollapseProps,
  Form,
  FormProps,
  Input,
  message,
  Modal,
  Select,
  Skeleton,
  Slider,
  Switch,
  Tooltip,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  UploadOutlined,
  SendOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  deleteAllDocuments,
  getPDFText,
  getWebsiteDocument,
  retrievalFromSupabase,
  uploadDocumentToSupabase,
} from "@/utils/pdfRetriever";
import { MODELS } from "@/utils/constant";
import Markdown from "./Markdown";
import Image from "next/image";

import styles from "./BookChating.module.scss";

type FieldType = {
  website?: boolean;
  bookInfo?: any;
  websiteUrl?: string;
  question?: string;
  models?: string;
  temperature?: number;
};

export const BookChating = () => {
  const [open, setOpen] = useState(false);
  const [uploadedBook, setUploadedBook] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const [responseText, setResponseText] = useState("");
  // pdf or website false -> pdf, true -> website
  const [fieldType, setFieldType] = useState(false);
  const [form] = Form.useForm();

  // 关闭时重置内容
  useEffect(() => {
    if (!open) {
      setUploadedBook([]);
      setResponseText("");
      setModel("gpt-4o");
      setLoading(false);
      setFieldType(false);
    }
  }, [open]);

  const advancedConfigs: CollapseProps["items"] = useMemo(
    () => [
      {
        key: "advanced-config",
        label: "Advanced Config",
        children: (
          <>
            <Form.Item<FieldType>
              label="Models"
              name="models"
              labelCol={{ span: 4 }}
              style={{ marginTop: "15px" }}
            >
              <Select
                showSearch
                placeholder="Select a model"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                defaultValue={"gpt-4o"}
                value={model}
                onChange={(m) => setModel(m)}
                options={MODELS.filter((model) => model.value !== "dall-e-3")}
              />
            </Form.Item>
            <Form.Item<FieldType>
              label={
                <Tooltip title="temperature越大，模型越随机，例如代码生成选择0，诗歌创作选择1">
                  <span>Temperature </span>
                  <QuestionCircleOutlined />
                </Tooltip>
              }
              name="temperature"
              labelCol={{ span: 6 }}
              style={{ marginTop: "15px" }}
            >
              <Slider min={0} max={1} step={0.01} defaultValue={0} />
            </Form.Item>
          </>
        ),
      },
    ],
    [model]
  );

  // 表单提交
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const {
      bookInfo,
      question,
      models = "gpt-4o",
      websiteUrl,
      temperature = 0,
    } = values;
    // 错误处理
    try {
      setLoading(true);
      setResponseText("");
      // 判断是pdf还是website
      let docs = null;
      if (fieldType) {
        docs = await getWebsiteDocument(websiteUrl as string);
      } else {
        const pdfUrl = bookInfo.file.response?.data;
        docs = await getPDFText(pdfUrl ?? "");
      }
      // 先删除所有文档
      await deleteAllDocuments();
      // 上传docs
      await uploadDocumentToSupabase(docs);
      // 使用llm进行retrieve
      console.log("retrieve models:", models);
      const answer = await retrievalFromSupabase(
        question as string,
        models as string,
        temperature
      );
      setResponseText(answer);
      setLoading(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "发生未知错误");
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const onFileChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setUploadedBook(newFileList);
  };

  return (
    <div className={styles["book-container"]}>
      {/* Basic */}
      <Button type="primary" size="small" onClick={() => setOpen(true)}>
        Book Chating
      </Button>
      <Modal
        title="Book&Website Chating"
        centered
        open={open}
        onCancel={() => setOpen(false)}
        width={800}
        style={{
          maxHeight: "90vh",
          overflow: "scroll", // 或 'scroll'
        }}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form
          form={form}
          name="basic"
          className={styles["form-container"]}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, marginTop: "20px" }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType> label="Is use website" name="website">
            <div className={styles.question}>
              <Switch
                checked={fieldType}
                onChange={(isChecked) => {
                  setResponseText("");
                  setUploadedBook([]);
                  form.resetFields();
                  setFieldType(isChecked);
                }}
              />
            </div>
          </Form.Item>
          {!fieldType ? (
            <Form.Item<FieldType>
              label="Uploaded pdf(word)"
              name="bookInfo"
              rules={[{ required: true, message: "Please upload!" }]}
            >
              <Upload
                action="http://118.178.238.73:8081/upload/image"
                listType="picture"
                multiple={false}
                maxCount={1}
                fileList={uploadedBook}
                onChange={onFileChange}
                onRemove={() => {
                  setUploadedBook([]);
                }}
              >
                <Button type="primary" size="small" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>
          ) : (
            <Form.Item<FieldType>
              label="Input website"
              name="websiteUrl"
              rules={[
                { required: true, message: "Please enter a website!" },
                {
                  pattern: new RegExp(
                    /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
                  ),
                  message: "Must contain valid domain (e.g. example.com)",
                },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item<FieldType>
            label="Question"
            name="question"
            rules={[{ required: true, message: "Please input your question" }]}
          >
            <div className={styles.question}>
              <Input.TextArea rows={5} />
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
              >
                Send
              </Button>
            </div>
          </Form.Item>
          <Collapse items={advancedConfigs} />
        </Form>
        {/* 检索结果 */}
        {/* <pre>
          <Markdown markdownText={responseText} />
        </pre> */}
        <Alert
          style={{
            marginTop: "20px",
          }}
          message={
            responseText ? (
              <Markdown markdownText={responseText} />
            ) : loading ? (
              <Skeleton active />
            ) : (
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                <Image
                  src="https://mark-ai.oss-cn-hangzhou.aliyuncs.com/20241013-020521045cb66e283bf8db2832480e7d93f00d.jpg"
                  alt=""
                  width={50}
                  height={100}
                  className="rounded-full"
                  style={{
                    display: "inline-block",
                    marginRight: "15px",
                  }}
                />
                Upload File and Ask Questions!
              </div>
            )
          }
          type="success"
        />
      </Modal>
    </div>
  );
};
