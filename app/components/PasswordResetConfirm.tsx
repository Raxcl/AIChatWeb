import React, { useEffect, useState } from "react";
import styles from "./forget-password.module.scss";
import CloseIcon from "../icons/close.svg";
import { SingleInput, Input, List, ListItem } from "./ui-lib";
import { IconButton } from "./button";
import { useAuthStore } from "../store";
import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "./ui-lib";
import { copyToClipboard } from "../utils";

export function PasswordResetConfirm() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const [newPassword, setNewPassword] = useState("");

  const [searchParams] = useSearchParams();

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
    let token = searchParams.get("token");
    let email = searchParams.get("email");
    setEmail(email ?? "");
    setToken(token ?? "");
  }, []);

  // 30秒后可再次点击
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
    authStore.PasswordResetConfirm(email, token).then((resp) => {
      if (resp.success) {
        let password = resp.data;
        setNewPassword(password);
        copyToClipboard(password);
        showToast(`新密码已复制到剪贴板：${password}`);
      } else {
        showToast(resp.message);
      }
    });
  }

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.ForgetPasswordConfirmPage.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.ForgetPasswordConfirmPage.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.ForgetPasswordConfirmPage.Actions.Close}
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
              readOnly
            />
          </ListItem>
          {newPassword ? (
            <ListItem
              title={Locale.RegisterPage.NewPassword.Title}
              subTitle={Locale.RegisterPage.NewPassword.SubTitle}
            >
              <SingleInput
                value={newPassword}
                placeholder={Locale.RegisterPage.NewPassword.Placeholder}
                readOnly
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.select();
                  navigator.clipboard.writeText(newPassword);
                  showToast(`密码已复制到剪贴板：${newPassword}`);
                }}
              />
            </ListItem>
          ) : (
            <></>
          )}

          <ListItem>
            <IconButton
              type="primary"
              text={loading ? `密码重置完成` : "提交"}
              block={true}
              disabled={loading}
              onClick={handleSubmit}
            />
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
