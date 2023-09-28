// import type { ChatRequest, ChatResponse } from "./api/openai/typing";
// import type { LoginResponse } from "./api/login/route";
// import type { RegisterResponse } from "./api/register/route";
import type { Response } from "./api/common";
// const BASE_URL = process.env.BASE_URL
// console.log('BASE_URL', BASE_URL)

export interface CallResult {
  success: boolean;
  message: string;
  data?: any;
}
export interface LoginResult {
  success: boolean;
  message: string;
  data?: any;
}
export interface RegisterResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function request(
  url: string,
  method: string,
  body: any,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<CallResult> {
  try {
    // todo 无法读取 BASE_URL，先手动设置，后续再研究
    // const BASE_URL = "http://localhost:3000/api";
    const BASE_URL = process.env.BASE_URL;
    // const mode = "export";
    const mode = process.env.BUILD_MODE;
    console.log("BASE_URL", BASE_URL);
    console.log("url", url);
    let requestUrl = (mode === "export" ? BASE_URL : "") + "/api" + url;
    console.log("请求url：", requestUrl);
    const res = await fetch(requestUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body === null ? null : JSON.stringify(body),
      // // @ts-ignore
      // duplex: "half",
    });
    console.log("res等于", res);
    if (res.status == 200) {
      let json: Response<any>;
      try {
        json = (await res.json()) as Response<any>;
      } catch (e) {
        console.error("json formatting failure", e);
        options?.onError({
          name: "json formatting failure",
          message: "json formatting failure",
        });
        return {
          success: false,
          message: "json formatting failure",
        };
      }
      if (!json.success) {
        options?.onError({
          name: json.message,
          message: json.message,
        });
      }
      return json;
    }
    console.error("register result error(1)", res);
    options?.onError({
      name: "unknown error(1)",
      message: "unknown error(1)",
    });
    return {
      success: false,
      message: "unknown error(2)",
    };
  } catch (err) {
    console.error("NetWork Error(3)", err);
    options?.onError(err as Error);
    return {
      success: false,
      message: "NetWork Error(3)",
    };
  }
}

export function requestResetPassword(
  password: string,
  email: string,
  code: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  return request("/resetPassword", "POST", { password, code, email }, options);
}
export function requestChangePassword(
  username: string,
  password: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  return request("/user/self", "PUT", { username, password }, options);
}

export async function requestLogin(
  username: string,
  password: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<LoginResult> {
  return request("/user/login", "POST", { username, password }, options);
}

export async function generateAccessToken(
  // username: string,
  // password: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<LoginResult> {
  return request("/user/token", "GET", undefined, options);
}

export async function requestRegister(
  username: string,
  password: string,
  password2: string,
  email: string,
  verification_code: string,
  aff_code: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  return request(
    "/user/register",
    "POST",
    { username, password, password2, email, verification_code, aff_code },
    options,
  );
}

export async function requestSendEmailCode(
  email: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  return request(`/verification?email=${email}`, "GET", undefined, options);
}
export async function requestSendEmailWithResetPassword(
  email: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  return request(`/reset_password?email=${email}`, "GET", undefined, options);
}
export async function requestPasswordResetConfirm(
  email: string,
  token: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  return request(`/user/reset`, "POST", { email, token }, options);
}
