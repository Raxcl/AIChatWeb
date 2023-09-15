import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";

export interface NoticeStore {
  show: boolean;
  success: boolean;
  splash: boolean;
  message: string;
  title: string;
  data: string;
  fetchNoticeConfig: (token: string) => Promise<any>;
}

export interface NoticeConfigData {
  show: boolean;
  success: boolean;
  splash: boolean;
  message: string;
  title: string;
  data: string;
}

import { Response } from "../api/common";
export type NoticeConfigResponse = Response<NoticeConfigData>;

export const useNoticeConfigStore = create<NoticeStore>()(
  persist(
    (set, get) => ({
      show: true,
      success: true,
      splash: true,
      message: "",
      title: "你好，我是通知页标题",
      data: "你好，我是通知页内容",

      async fetchNoticeConfig(token: string) {
        const url = "/api/notice";
        const BASE_URL = process.env.BASE_URL;
        const mode = process.env.BUILD_MODE;
        let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;
        return fetch(requestUrl, {
          method: "get",
          headers: {
            Authorization: "Bearer " + token,
          },
        })
          .then((res) => res.json())
          .then((res: NoticeConfigResponse) => {
            console.log("[GlobalConfig] got notice config from server", res);
            const notice = res.data;
            set(() => ({
              success: notice.success,
              message: notice.message,
              data: notice.data,
            }));
            return res;
          })
          .catch(() => {
            console.error("[GlobalConfig] failed to fetch config");
          })
          .finally(() => {
            // fetchState = 2;
          });
      },
    }),
    {
      name: StoreKey.NoticeConfig,
      version: 1,
    },
  ),
);
