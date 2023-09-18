import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
import { requestLogin, generateAccessToken } from "../requests";
import {
  requestRegister,
  requestSendEmailCode,
  requestResetPassword,
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

        if (result && result.success) {
          // 获取token（前端校验需要）
          let queryToken: string;
          fetch("http://localhost:3000/api/user/token", {
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
        if (result && result.code == 0 && result.data) {
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
    }),
    {
      name: StoreKey.Auth,
      version: 1,
    },
  ),
);
