import { UploadFile } from "antd";

export const userUploadCenter: UploadFile = {
    uid: "",
    name: "",
}

export const setUserUploadCenter = (file: UploadFile) => {
    Object.assign(userUploadCenter, file);
}

export const removeUserUploadCenter = (uid: string) => {
    if (userUploadCenter.uid === uid) {
        Object.assign(userUploadCenter, {
            uid: "",
            name: "",
        })
    }
}