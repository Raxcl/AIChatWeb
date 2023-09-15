import { useState, useEffect } from "react";

import styles from "./register.module.scss";

import CloseIcon from "../icons/close.svg";
import { SingleInput, List, ListItem, PasswordInput } from "./ui-lib";

import { IconButton } from "./button";
import { useAuthStore, useWebsiteConfigStore } from "../store";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/ui-lib";

export function Register() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const { registerPageSubTitle } = useWebsiteConfigStore();

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

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return uuid;
  }

  const [captchaId] = useState("register-" + generateUUID());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSending, setEmailCodeSending] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [comfirmedPassword, setComfirmedPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  function handleClickSendEmailCode() {
    if (email === null || email == "") {
      showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
      return;
    }
    setEmailCodeSending(true);
    authStore
      .sendEmailCode(email)
      .then((resp) => {
        if (resp.code == 0) {
          showToast(Locale.RegisterPage.Toast.EmailCodeSent);
          return;
        }
        if (resp.code == 10121) {
          showToast(Locale.RegisterPage.Toast.EmailFormatError);
          return;
        } else if (resp.code == 10122) {
          showToast(Locale.RegisterPage.Toast.EmailCodeSentFrequently);
          return;
        }
        showToast(resp.message);
      })
      .finally(() => {
        setEmailCodeSending(false);
      });
  }
  function register() {
    if (password == null || password.length == 0) {
      showToast(Locale.RegisterPage.Toast.PasswordEmpty);
      return;
    }
    // 邮箱注册
    if (email === null || email == "") {
      showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
      return;
    }
    if (emailCode === null || emailCode === "") {
      showToast(Locale.RegisterPage.Toast.EmailCodeEmpty);
      return;
    }
    setLoadingUsage(true);
    showToast(Locale.RegisterPage.Toast.Registering);
    authStore
      .register(
        name,
        username,
        password,
        captchaId,
        captchaInput,
        email,
        emailCode,
      )
      .then((result) => {
        console.log("result", !result);
        // console.log("resul详情为：", result);
        if (!result) {
          // console.log("我不会进来的")
          showToast(Locale.RegisterPage.Toast.Failed);
          return;
        }
        if (result.success) {
          showToast(Locale.RegisterPage.Toast.Success);
          navigate(Path.Chat);
        } else {
          if (!result.message) {
            showToast(
              Locale.RegisterPage.Toast.FailedWithReason + result.message,
            );
          } else {
            showToast(Locale.RegisterPage.Toast.Failed);
          }
        }
      })
      .finally(() => {
        setLoadingUsage(false);
      });
  }

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.RegisterPage.Title}
          </div>
          <div className="window-header-sub-title">{registerPageSubTitle}</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.RegisterPage.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["register"]}>
        <List>
          {/* <ListItem
            title={Locale.RegisterPage.Name.Title}
            subTitle={Locale.RegisterPage.Name.SubTitle}
          >
            <SingleInput
              value={name}
              placeholder={Locale.RegisterPage.Name.Placeholder}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
            />
          </ListItem> */}

          <>
            <ListItem
              title={Locale.RegisterPage.Email.Title}
              subTitle={Locale.RegisterPage.Email.SubTitle}
            >
              <SingleInput
                value={email}
                placeholder={Locale.RegisterPage.Email.Placeholder}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                }}
              />
            </ListItem>

            <ListItem>
              <IconButton
                text={
                  emailCodeSending
                    ? Locale.RegisterPage.Toast.EmailCodeSending
                    : Locale.RegisterPage.Toast.SendEmailCode
                }
                disabled={emailCodeSending}
                onClick={() => {
                  handleClickSendEmailCode();
                }}
              />
            </ListItem>

            <ListItem
              title={Locale.RegisterPage.EmailCode.Title}
              subTitle={Locale.RegisterPage.EmailCode.SubTitle}
            >
              <SingleInput
                value={emailCode}
                placeholder={Locale.RegisterPage.EmailCode.Placeholder}
                onChange={(e) => {
                  setEmailCode(e.currentTarget.value);
                }}
              />
            </ListItem>
          </>

          <ListItem
            title={Locale.RegisterPage.Username.Title}
            subTitle={Locale.RegisterPage.Username.SubTitle}
          >
            <SingleInput
              value={username}
              placeholder={Locale.RegisterPage.Username.Placeholder}
              onChange={(e) => {
                setUsername(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem
            title={Locale.RegisterPage.Password.Title}
            subTitle={Locale.RegisterPage.Password.SubTitle}
          >
            <PasswordInput
              value={password}
              type="text"
              placeholder={Locale.RegisterPage.Password.Placeholder}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem>
            <IconButton
              type="primary"
              text={Locale.RegisterPage.Title}
              block={true}
              disabled={loadingUsage}
              onClick={() => {
                console.log(username, password);
                register();
              }}
            />
          </ListItem>

          <ListItem>
            <IconButton
              text={Locale.RegisterPage.GoToLogin}
              type="second"
              onClick={() => {
                navigate(Path.Login);
              }}
            />
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
