import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
import { requestLogin, generateAccessToken } from "../requests";
import {
  requestRegister,
  requestSendEmailCode,
  requestResetPassword,
  requestSendEmailWithResetPassword,
  requestPasswordResetConfirm,
  requestChangePassword,
} from "../requests";

export interface AuthStore {
  token: string;
  username: string;
  email: string;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  sendEmailCode: (email: string) => Promise<any>;
  register: (
    username: string,
    password: string,
    password2: string,
    email: string,
    verification_code: string,
    aff_code: string,
  ) => Promise<any>;
  resetPassword: (
    password: string,
    password2: string,
    email: string,
    code: string,
  ) => Promise<any>;
  changePassword: (username: string, password: string) => Promise<any>;
  sendEmailWithResetPassword: (email: string) => Promise<any>;
  PasswordResetConfirm: (email: string, token: string) => Promise<any>;
  removeToken: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      name: "",
      username: "",
      email: "",
      token: "",

      async login(username, password) {
        // set(() => ({
        //   username,
        // }));

        let result = await requestLogin(username, password, {
          onError: (err) => {
            console.error(err);
          },
        });

        const BASE_URL = process.env.BASE_URL;
        const mode = process.env.BUILD_MODE;
        const url = "/user/token";
        let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;

        if (result && result.success) {
          // 获取token（前端校验需要）
          let queryToken: string;
          fetch(requestUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((data) => {
              queryToken = data.data;
              console.log("queryToken数据，", queryToken);
              console.log("token数据，", data);

              set(() => ({
                username: result.data?.username || "",
                email: result.data?.userEntity?.email || "",
                token: queryToken,
              }));
              console.log("token值为：", get().token);
            });
        }

        return result;
      },
      logout() {
        set(() => ({
          username: "",
          email: "",
          token: "",
        }));
      },
      removeToken() {
        set(() => ({ token: "" }));
      },
      async sendEmailCode(email) {
        let result = await requestSendEmailCode(email, {
          onError: (err) => {
            console.error(err);
          },
        });
        return result;
      },
      async register(
        username,
        password,
        password2,
        email,
        verification_code,
        aff_code,
      ) {
        let result = await requestRegister(
          username,
          password,
          password2,
          email,
          verification_code,
          aff_code,
          {
            onError: (err) => {
              console.error(err);
            },
          },
        );
        console.log("result", result);
        if (result && result.success) {
          set(() => ({
            username,
            email: email,
          }));
        }

        return result;
      },
      async resetPassword(password, email, code) {
        let result = await requestResetPassword(password, email, code, {
          onError: (err) => {
            console.error(err);
          },
        });
        //console.log("result", result);
        if (result && result.success && result.data) {
          const data = result.data;
          const user = data.userEntity;
          set(() => ({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            token: data.token || "",
          }));
        }
        return result;
      },
      async changePassword(username, password) {
        let result = await requestChangePassword(username, password, {
          onError: (err) => {
            console.error(err);
          },
        });
        //console.log("result", result);
        if (result && result.success && result.data) {
          const data = result.data;
          const user = data.userEntity;
          set(() => ({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            token: data.token || "",
          }));
        }
        return result;
      },
      async sendEmailWithResetPassword(email) {
        let result = await requestSendEmailWithResetPassword(email, {
          onError: (err) => {
            console.error(err);
          },
        });
        return result;
      },
      async PasswordResetConfirm(email, token) {
        let result = await requestPasswordResetConfirm(email, token, {
          onError: (err) => {
            console.error(err);
          },
        });
        return result;
      },
    }),
    {
      name: StoreKey.Auth,
      version: 1,
    },
  ),
);
