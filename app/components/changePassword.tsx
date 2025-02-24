import { useState, useEffect } from "react";
import Image from "next/image";

import styles from "./forget-password.module.scss";

import CloseIcon from "../icons/close.svg";
import { SingleInput, Input, List, ListItem, PasswordInput } from "./ui-lib";

import { IconButton } from "./button";
import { useAuthStore, useAccessStore, useWebsiteConfigStore } from "../store";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { showToast } from "./ui-lib";

export function ChangePassword() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  // const accessStore = useAccessStore();
  const { registerPageSubTitle } = useWebsiteConfigStore();
  // const registerType = registerTypes[0];
  // const REG_TYPE_ONLY_USERNAME = "OnlyUsername";
  // const REG_TYPE_USERNAME_WITH_CAPTCHA = "OnlyUsernameWithCaptcha";
  // const REG_TYPE_USERNAME_AND_EMAIL_WITH_CAPTCHA_AND_CODE =
  //   "UsernameAndEmailWithCaptchaAndCode";

  const [loadingUsage, setLoadingUsage] = useState(false);
  // const [captcha, setCaptcha] = useState("");

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
  // function handleClickSendEmailCode() {
  //   if (email === null || email == "") {
  //     showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
  //     return;
  //   }
  //   setEmailCodeSending(true);
  //   authStore
  //     .sendEmailCodeForResetPassword(email)
  //     .then((resp) => {
  //       if (resp.code == 0) {
  //         showToast(Locale.RegisterPage.Toast.EmailCodeSent);
  //         return;
  //       }
  //       if (resp.code == 10121) {
  //         showToast(Locale.RegisterPage.Toast.EmailFormatError);
  //         return;
  //       } else if (resp.code == 10122) {
  //         showToast(Locale.RegisterPage.Toast.EmailCodeSentFrequently);
  //         return;
  //       }
  //       showToast(resp.message);
  //     })
  //     .finally(() => {
  //       setEmailCodeSending(false);
  //     });
  // }
  function changePassword() {
    if (password == null || password.length == 0) {
      showToast(Locale.RegisterPage.Toast.PasswordEmpty);
      return;
    }
    // if (email === null || email == "") {
    //   showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
    //   return;
    // }
    // if (emailCode === null || emailCode === "") {
    //   showToast(Locale.RegisterPage.Toast.EmailCodeEmpty);
    //   return;
    // }
    setLoadingUsage(true);
    showToast(Locale.ForgetPasswordPage.Toast.PasswordResetting);
    authStore
      .changePassword(username, password)
      .then((result) => {
        console.log("result", result);
        if (!result) {
          showToast(Locale.ChangePasswordConfirmPage.Toast.PasswordResetFailed);
          return;
        }
        if (result.success) {
          showToast(
            Locale.ChangePasswordConfirmPage.Toast.PasswordResetSuccess,
          );
          navigate(Path.Chat);
        } else {
          if (result.message) {
            showToast(
              Locale.ChangePasswordConfirmPage.Toast
                .PasswordResetFailedWithReason + result.message,
            );
          } else {
            showToast(
              Locale.ChangePasswordConfirmPage.Toast.PasswordResetFailed,
            );
          }
        }
      })
      .finally(() => {
        setLoadingUsage(false);
      });
  }
  // function getRegisterCaptcha(captchaId: string) {
  //   // console.log('getRegisterCaptcha', captchaId)
  //   fetch("/api/getRegisterCaptcha?captchaId=" + captchaId, {
  //     method: "get",
  //   }).then(async (resp) => {
  //     const result = await resp.json();
  //     if (result.code != 0) {
  //       showToast(result.message);
  //     } else {
  //       setCaptcha("data:image/jpg;base64," + result.data);
  //     }
  //   });
  // }
  // useEffect(() => {
  //   getRegisterCaptcha(captchaId);
  // }, [captchaId]);

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.ChangePasswordPage.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.ChangePasswordPage.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.ChangePasswordPage.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["forget-password"]}>
        <List>
          <ListItem
            title={Locale.RegisterPage.NewPassword.Title}
            subTitle={Locale.RegisterPage.ChangePassword.SubTitle}
          >
            <PasswordInput
              value={password}
              type="text"
              placeholder={Locale.RegisterPage.ChangePassword.Placeholder}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem>
            <IconButton
              type="primary"
              text={Locale.ChangePasswordConfirmPage.Title}
              block={true}
              disabled={loadingUsage}
              onClick={() => {
                changePassword();
              }}
            />
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
