import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_API_HOST, StoreKey } from "../constant";
import { getHeaders } from "../client/api";
import { BOT_HELLO } from "./chat";
import { ALL_MODELS } from "./config";
import { getClientConfig } from "../config/client";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  needCode: boolean;
  hideUserApiKey: boolean;
  openaiUrl: string;
  hideBalanceQuery: boolean;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  updateOpenAiUrl: (_: string) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
  fetch: () => void;
  getAccessToken: () => void; //新增一个获取访问token的方法
}

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      needCode: true,
      hideUserApiKey: false,
      openaiUrl: DEFAULT_OPENAI_URL,
      hideBalanceQuery: false,

      enabledAccessControl() {
        get().fetch();

        return get().needCode;
      },
      updateCode(code: string) {
        set(() => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set(() => ({ token }));
      },
      updateOpenAiUrl(url: string) {
        set(() => ({ openaiUrl: url }));
      },
      isAuthorized() {
        get().fetch();

        // has token or has code or disabled access control
        return (
          !!get().token || !!get().accessCode || !get().enabledAccessControl()
        );
      },
      fetch() {
        if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
        fetchState = 1;
        fetch("/api/config", {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        })
          .then((res) => res.json())
          .then((res: DangerConfig) => {
            console.log("[Config] got config from server", res);
            set(() => ({ ...res }));

            if (!res.enableGPT4) {
              ALL_MODELS.forEach((model) => {
                if (model.name.startsWith("gpt-4")) {
                  (model as any).available = false;
                }
              });
            }

            if ((res as any).botHello) {
              BOT_HELLO.content = (res as any).botHello;
            }
          })
          .catch(() => {
            console.error("[Config] failed to fetch config");
          })
          .finally(() => {
            fetchState = 2;
          });
      },
      getAccessToken() {
        const BASE_URL = process.env.BASE_URL;
        const mode = process.env.BUILD_MODE;
        const url = "/token/?p=0";
        let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;
        console.log("获取访问token");

        // 本地测试需要
        const DEV_URL = process.env.NEXT_PUBLIC_BASE_URL;
        // 如果 DEV_URL 不为空，则使用 DEV_URL
        if (DEV_URL) {
          requestUrl = DEV_URL + requestUrl;
        }

        // todo 本地测试需要替换
        // fetch("http://localhost:3000/api/token/?p=0", {
        fetch(requestUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            let queryToken = data.data;
            console.log("令牌token数据，", data.data);
            queryToken = queryToken[queryToken.length - 1].key;
            set(() => ({
              token: queryToken,
            }));
            console.log("设置后的令牌token数据，", get().token);
          });
      },
    }),
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
