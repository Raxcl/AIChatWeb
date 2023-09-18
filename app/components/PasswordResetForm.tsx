import React, { useEffect, useState } from "react";
import styles from "./forget-password.module.scss";
import CloseIcon from "../icons/close.svg";
import { SingleInput, Input, List, ListItem } from "./ui-lib";
import { IconButton } from "./button";
import { useAuthStore } from "../store";
import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { showToast } from "./ui-lib";

export function PasswordResetForm() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

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

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;
    if (loading && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setLoading(false);
      setCountdown(30);
    }
    return () => {
      if (countdownInterval !== null) {
        clearInterval(countdownInterval);
      }
    };
  }, [loading, countdown]);

  async function handleSubmit() {
    if (email === null || email == "") {
      showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
      return;
    }
    setLoading(true);
    authStore.sendEmailWithResetPassword(email).then((resp) => {
      if (resp.success) {
        showToast(Locale.RegisterPage.Toast.EmailReset);
      } else {
        showToast(resp.message);
        return;
      }
    });
  }

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.ForgetPasswordPage.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.ForgetPasswordPage.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.ForgetPasswordPage.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["forget-password"]}>
        <List>
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
              autoComplete="on" // 添加这一行（输入时提示历史输入） todo 似乎没用，考虑删除
            />
          </ListItem>

          <ListItem>
            <IconButton
              type="primary"
              text={loading ? `重试 (${countdown})` : "提交"}
              block={true}
              disabled={loading}
              onClick={() => {
                handleSubmit();
              }}
            />
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
