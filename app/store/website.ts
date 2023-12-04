import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";

export interface AiPlugin {
  id: number;
  uuid: string;
  name: string;
  logo?: string;
  alone: boolean;
  builtin: boolean;
  state: number;
}

export type ModelContentType = "Text" | "Image";
export interface SimpleModel {
  name: string;
  contentType: ModelContentType;
}

export interface WebsiteConfigStore {
  title: string;
  mainTitle: string;
  subTitle: string;
  loginPageSubTitle: string;
  registerPageSubTitle: string;
  pricingPageTitle: string;
  pricingPageSubTitle: string;
  chatPageSubTitle: string;
  sensitiveWordsTip: string;
  balanceNotEnough: string;
  registerTypes: string[];
  hideGithubIcon: boolean;
  botHello: string;
  availableModels: SimpleModel[];
  defaultSystemTemplate?: string;
  plugins?: AiPlugin[];
  fetchWebsiteConfig: () => Promise<any>;
}

export interface WebsiteConfig {
  title: string;
  mainTitle: string;
  subTitle: string;
  loginPageSubTitle: string;
  registerPageSubTitle: string;
  registerTypes: string[];
  pricingPageTitle: string;
  pricingPageSubTitle: string;
  chatPageSubTitle: string;
  sensitiveWordsTip: string;
  balanceNotEnough: string;
  hideGithubIcon: boolean;
  botHello: string;
  defaultSystemTemplate: string;
  availableModels: SimpleModel[];
  plugins?: AiPlugin[];
}
export interface WebsiteConfigData {
  websiteContent: WebsiteConfig;
}

import { Response } from "../api/common";
export type WebsiteConfigResponse = Response<WebsiteConfigData>;

export const useWebsiteConfigStore = create<WebsiteConfigStore>()(
  persist(
    (set, get) => ({
      title: "",
      mainTitle: "",
      subTitle: "",
      loginPageSubTitle: "",
      registerPageSubTitle: "",
      registerTypes: [],
      pricingPageTitle: "",
      pricingPageSubTitle: "",
      chatPageSubTitle: "",
      sensitiveWordsTip: "",
      balanceNotEnough: "",
      hideGithubIcon: false,
      botHello: "",
      availableModels: [] as SimpleModel[],
      defaultSystemTemplate: "",
      plugins: [] as AiPlugin[],

      // todo 暂停
      async fetchWebsiteConfig() {
        const url = "/about";
        const BASE_URL = process.env.BASE_URL;
        const mode = process.env.BUILD_MODE;
        console.log("mode", mode);
        let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;
        return fetch(requestUrl, {
          method: "get",
        })
          .then((res) => res.json())
          .then((res) => {
            const website = {
              title: "CoCo-AI",
              mainTitle: "CoCo-AI",
              subTitle: "智能化问答助手",
              loginPageSubTitle: "登录后可与AI交流",
              registerPageSubTitle: "注册后赠送免费额度哦",
              registerTypes: ["OnlyUsername"],
              pricingPageTitle: "充值中心",
              pricingPageSubTitle:
                "免费额度有限，请充值额度，继续让本站为您服务吧~",
              chatPageSubTitle: "",
              sensitiveWordsTip: "My Sensitive Words Tip",
              balanceNotEnough: "My Balance Not Enough Message",
              hideGithubIcon: true,
              botHello: "Hello, I'm Bot",
              availableModels: [
                {
                  name: "gpt-3.5-turbo",
                  contentType: "Text",
                },
                {
                  name: "gpt-4",
                  contentType: "Text",
                },
              ] as SimpleModel[],
              defaultSystemTemplate: "My Default System Template",
              plugins: [] as AiPlugin[],
            };
            website.botHello = res.data;
            set(() => ({
              title: website.title,
              mainTitle: website.mainTitle,
              subTitle: website.subTitle,
              loginPageSubTitle: website.loginPageSubTitle,
              registerPageSubTitle: website.registerPageSubTitle,
              registerTypes:
                website.registerTypes && website.registerTypes.length
                  ? website.registerTypes
                  : (["OnlyUsername"] as string[]),
              pricingPageTitle: website.pricingPageTitle,
              pricingPageSubTitle: website.pricingPageSubTitle,
              chatPageSubTitle: website.chatPageSubTitle,
              sensitiveWordsTip: website.sensitiveWordsTip,
              balanceNotEnough: website.balanceNotEnough,
              hideGithubIcon: website.hideGithubIcon,
              botHello: website.botHello,
              availableModels: website.availableModels,
              defaultSystemTemplate: website.defaultSystemTemplate,
              plugins: website.plugins,
            }));
            // return res;
            return Promise.resolve(website);
          })
          .catch(() => {
            console.error("[GlobalConfig] failed to fetch config");
          })
          .finally(() => {
            // fetchState = 2;
          });
      },

      // fetchWebsiteConfig() {
      //   const website = {
      //     title: "CoCo-AI",
      //     mainTitle: "CoCo-AI",
      //     subTitle: "智能化问答助手",
      //     loginPageSubTitle: "登录后可与AI交流",
      //     registerPageSubTitle: "注册后赠送免费额度哦",
      //     registerTypes: ["OnlyUsername"],
      //     pricingPageTitle: "充值中心",
      //     pricingPageSubTitle:
      //       "免费额度有限，请充值额度，继续让本站为您服务吧~",
      //     chatPageSubTitle: "",
      //     sensitiveWordsTip: "My Sensitive Words Tip",
      //     balanceNotEnough: "My Balance Not Enough Message",
      //     hideGithubIcon: true,
      //     botHello: "Hello, I'm Bot",
      //     availableModels: [
      //       {
      //         name: "gpt-3.5-turbo",
      //         contentType: "Text",
      //       },
      //       {
      //         name: "gpt-4",
      //         contentType: "Text",
      //       },
      //     ] as SimpleModel[],
      //     defaultSystemTemplate: "My Default System Template",
      //     plugins: [] as AiPlugin[],
      //   };
      //   set(() => ({
      //     title: website.title,
      //     mainTitle: website.mainTitle,
      //     subTitle: website.subTitle,
      //     loginPageSubTitle: website.loginPageSubTitle,
      //     registerPageSubTitle: website.registerPageSubTitle,
      //     registerTypes: website.registerTypes,
      //     pricingPageTitle: website.pricingPageTitle,
      //     pricingPageSubTitle: website.pricingPageSubTitle,
      //     chatPageSubTitle: website.chatPageSubTitle,
      //     sensitiveWordsTip: website.sensitiveWordsTip,
      //     balanceNotEnough: website.balanceNotEnough,
      //     hideGithubIcon: website.hideGithubIcon,
      //     botHello: website.botHello,
      //     availableModels: website.availableModels,
      //     defaultSystemTemplate: website.defaultSystemTemplate,
      //     plugins: website.plugins,
      //   }));
      //   return Promise.resolve(website);
      // },
    }),
    {
      name: StoreKey.WebsiteConfig,
      version: 1,
    },
  ),
);
