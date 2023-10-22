import { useState, useEffect } from "react";

import styles from "./login.module.scss";

import CloseIcon from "../icons/close.svg";
import { SingleInput, List, ListItem, PasswordInput } from "./ui-lib";

import { IconButton } from "./button";
import { useAuthStore, useAccessStore, useWebsiteConfigStore } from "../store";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/ui-lib";
import { generateAccessToken } from "../requests";

export function Login() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const accessStore = useAccessStore();
  const { loginPageSubTitle } = useWebsiteConfigStore();

  const [loadingUsage, setLoadingUsage] = useState(false);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  function login() {
    if (username === "") {
      showToast(Locale.LoginPage.Toast.EmptyUserName);
      return;
    }
    if (password === "") {
      showToast(Locale.LoginPage.Toast.EmptyPassword);
      return;
    }
    setLoadingUsage(true);
    showToast(Locale.LoginPage.Toast.Logining);
    authStore
      .login(username, password)
      .then((result) => {
        console.log("result", result);
        console.log("访问token测试", accessStore.token);
        if (result && result.success) {
          //获取访问token
          accessStore.getAccessToken();
          const validString = (x: string) => x && x.length > 0;
          console.log("访问token测试1", accessStore.token);
          if (!validString(accessStore.token)) {
            // 生成访问 token
            // putAccessToken(username, password);
            // 生成 oneapi 永久令牌
            const BASE_URL = process.env.BASE_URL;
            const mode = process.env.BUILD_MODE;
            const url = "/token/";
            let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;

            // 本地测试需要
            const DEV_URL = process.env.NEXT_PUBLIC_BASE_URL;
            // 如果 DEV_URL 不为空，则使用 DEV_URL
            if (DEV_URL) {
              requestUrl = DEV_URL + requestUrl;
            }

            // todo 本地测试需要替换
            // fetch("http://localhost:3000/api/token/", {
            fetch(requestUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: "default",
                remain_quota: 0,
                expired_time: -1,
                unlimited_quota: true,
              }),
            }).then((res) => {
              accessStore.getAccessToken();
            });
          }
          showToast(Locale.LoginPage.Toast.Success);
          navigate(Path.Chat);
        } else if (result && result.message) {
          showToast(result.message);
        }
      })
      .finally(() => {
        setLoadingUsage(false);
      });
  }
  function logout() {
    setTimeout(() => authStore.logout(), 500);
    setTimeout(() => accessStore.updateToken(""), 500);
  }

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.LoginPage.Title}
          </div>
          <div className="window-header-sub-title">{loginPageSubTitle}</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.LoginPage.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["login"]}>
        <List>
          <ListItem
            title={Locale.LoginPage.Username.Title}
            subTitle={Locale.LoginPage.Username.SubTitle}
          >
            {authStore.token ? (
              <span>{authStore.username}</span>
            ) : (
              <SingleInput
                value={username}
                placeholder={Locale.LoginPage.Username.Placeholder}
                onChange={(e) => {
                  setUsername(e.currentTarget.value);
                  //console.log(e)
                  //accessStore.updateCode(e.currentTarget.value);
                }}
              />
            )}
          </ListItem>

          {authStore.token ? (
            <></>
          ) : (
            <ListItem
              title={Locale.LoginPage.Password.Title}
              subTitle={Locale.LoginPage.Password.SubTitle}
            >
              <PasswordInput
                value={password}
                type="text"
                placeholder={Locale.LoginPage.Password.Placeholder}
                onChange={(e) => {
                  // console.log(e)
                  setPassword(e.currentTarget.value);
                  // accessStore.updateCode(e.currentTarget.value);
                }}
              />
            </ListItem>
          )}

          <ListItem>
            <IconButton
              type="primary"
              text={
                authStore.token
                  ? Locale.LoginPage.Actions.Logout
                  : Locale.LoginPage.Actions.Login
              }
              block={true}
              onClick={() => {
                if (authStore.token) {
                  logout();
                } else {
                  // console.log(username, password);
                  login();
                }
              }}
            />
          </ListItem>

          {authStore.token ? (
            <></>
          ) : (
            <>
              <ListItem>
                <IconButton
                  text={Locale.LoginPage.Reset}
                  type="second"
                  onClick={() => {
                    navigate(Path.Reset);
                  }}
                />
              </ListItem>
              <ListItem>
                <IconButton
                  text={Locale.LoginPage.GoToRegister}
                  type="second"
                  onClick={() => {
                    navigate(Path.Register);
                  }}
                />
              </ListItem>
            </>
          )}
        </List>
      </div>
    </ErrorBoundary>
  );
}
function putAccessToken(username: string, password: string) {}
