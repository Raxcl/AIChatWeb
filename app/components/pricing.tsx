import { useState, useEffect } from "react";

import styles from "./profile.module.scss";

import CloseIcon from "../icons/close.svg";
import {
  Input,
  List,
  DangerousListItem,
  Modal,
  PasswordInput,
  SingleInput,
  ListItem,
} from "./ui-lib";

import { IconButton } from "./button";
import { useAuthStore, useAccessStore, useWebsiteConfigStore } from "../store";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { showToast } from "./ui-lib";
import { renderNumber } from "../helpers/render";

interface Package {
  id: number;
  state: number;
  calcType: string;
  calcTypeId: number;
  drawCount: number;
  chatCount: number;
  advancedChatCount: number;
  tokens: number;
  price: string;
  title: string;
  subTitle: string;
  uuid: string;
  top: number;
  days: string;
}
interface PackageResponse {
  code: number;
  message?: string;
  data: Package[];
}

export function Pricing() {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const { pricingPageTitle, pricingPageSubTitle } = useWebsiteConfigStore();

  const [packages, setPackages] = useState([] as Package[]);
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setTokenValid] = useState("unknown");
  const [topUpLink, setTopUpLink] = useState("");
  const [redemptionCode, setRedemptionCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userQuota, setUserQuota] = useState(0);
  const BASE_URL = process.env.BASE_URL;
  const mode = process.env.BUILD_MODE;

  // useEffect(() => {
  //   setLoading(true);
  //   const url = "/package/onSales";
  //   const BASE_URL = process.env.BASE_URL;
  //   const mode = process.env.BUILD_MODE;
  //   let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;
  //   fetch(requestUrl, {
  //     method: "get",
  //     headers: {
  //       Authorization: "Bearer " + authStore.token,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((res) => {
  //       const packagesResp = res as unknown as PackageResponse;
  //       if (Math.floor(packagesResp.code / 100) === 100) {
  //         setTokenValid("invalid");
  //       } else {
  //         setTokenValid("valid");
  //       }
  //       if (!packagesResp.data) {
  //         setPackages([]);
  //         return;
  //       }
  //       setPackages(
  //         packagesResp.data.map((pkg) => {
  //           pkg = { ...pkg };
  //           if (pkg.title && !pkg.title.includes("<")) {
  //             pkg.title = `<div style="font-size: 20px;">${pkg.title}</div>`;
  //           }
  //           if (!pkg.subTitle) {
  //             const prefix = {
  //               1: "总额",
  //               2: "每天",
  //               3: "每小时",
  //               4: "每3小时",
  //             }[pkg.calcTypeId];
  //             pkg.subTitle =
  //               `<ul style="margin-top: 5px;padding-inline-start: 10px;">` +
  //               (pkg.tokens
  //                 ? `<li>${prefix} <span style="font-size: 18px;">${pkg.tokens}</span> tokens</li>`
  //                 : "") +
  //               (pkg.chatCount
  //                 ? `<li>${prefix} <span style="font-size: 18px;">${pkg.chatCount}</span> 次基础聊天（GPT3.5）</li>`
  //                 : "") +
  //               (pkg.advancedChatCount
  //                 ? `<li>${prefix} <span style="font-size: 18px;">${pkg.advancedChatCount}</span> 次高级聊天（GPT4）</li>`
  //                 : "") +
  //               (pkg.drawCount
  //                 ? `<li>${prefix} <span style="font-size: 18px;">${pkg.drawCount}</span> 次AI绘画</li>`
  //                 : "") +
  //               `<li>有效期： <span style="font-size: 18px;">${pkg.days}</span> 天</li>` +
  //               `</ul>`;
  //           }
  //           return pkg;
  //         }),
  //       );
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, [authStore.token]);

  interface Status {
    top_up_link?: string;
  }

  useEffect(() => {
    let status = localStorage.getItem("status");
    if (status) {
      const parsedStatus: Status = JSON.parse(status);
      if (parsedStatus.top_up_link) {
        setTopUpLink(parsedStatus.top_up_link);
      }
    }
    getUserQuota().then();
  }, []);

  const openTopUpLink = () => {
    if (!topUpLink) {
      showToast("超级管理员未设置充值链接！");
      return;
    }
    window.open(topUpLink, "_blank");
  };

  const topUp = async () => {
    if (redemptionCode === "") {
      showToast("请输入充值码！");
      return;
    }
    setIsSubmitting(true);

    const url = "/user/topup";
    let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;

    try {
      const res = await fetch(requestUrl, {
        method: "post",
        headers: {
          Authorization: "Bearer " + authStore.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: redemptionCode,
        }),
      }).then((res) => res.json());
      const { success, message, data } = res;
      if (success) {
        showToast("充值成功！");
        setUserQuota((quota) => {
          return quota + data;
        });
        setRedemptionCode("");
      } else {
        showToast(message);
      }
    } catch (err) {
      showToast("请求失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserQuota = async () => {
    const url = Path.UserProfile;
    let requestUrl = (mode === "export" ? BASE_URL : "") + "/api" + url;
    const res = await fetch(requestUrl, {
      method: "get",
      headers: {
        Authorization: "Bearer " + authStore.token,
      },
      body: null,
    }).then((res) => res.json());
    const { success, message, data } = res;
    if (success) {
      setUserQuota(data.quota);
    } else {
      showToast(message);
    }
  };

  function handleClickBuy(pkg: Package) {
    console.log("buy pkg", pkg);
    showToast(Locale.PricingPage.ConsultAdministrator);
  }

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {pricingPageTitle || "购买套餐"}
          </div>
          <div className="window-header-sub-title">
            {pricingPageSubTitle || "畅享与AI聊天的乐趣"}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.PricingPage.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["profile"]}>
        {loading ? (
          <div style={{ height: "100px", textAlign: "center" }}>
            {Locale.PricingPage.Loading}
          </div>
        ) : (
          <></>
        )}
        {!loading && isTokenValid === "invalid" && (
          <div style={{ height: "100px", textAlign: "center" }}>
            <a
              href="javascript:void(0)"
              onClick={() => {
                navigate(Path.Login);
              }}
            >
              {Locale.PricingPage.PleaseLogin}
            </a>
          </div>
        )}
        <div className={styles["profile"]}>
          <List>
            <ListItem>
              <IconButton
                text={Locale.BalancePage.Actions.GetRedeemCode}
                block={true}
                type="primary"
                onClick={openTopUpLink}
              />
            </ListItem>
            <ListItem>
              <SingleInput
                style={{ flex: 0.7 }}
                value={redemptionCode}
                placeholder={Locale.BalancePage.Placeholder}
                onChange={(e) => {
                  setRedemptionCode(e.currentTarget.value);
                }}
              />
              <IconButton
                style={{ flex: 0.08 }}
                text={
                  isSubmitting
                    ? Locale.BalancePage.Actions.Redeeming
                    : Locale.BalancePage.Actions.ActionRedeem
                }
                block={true}
                type="primary"
                disabled={isSubmitting}
                onClick={topUp}
              />
            </ListItem>

            <DangerousListItem title={"剩余积分"}>
              <div style={{ minWidth: "100px" }}>
                <div
                  style={{
                    margin: "10px",
                    fontSize: "30px",
                    textAlign: "center",
                  }}
                >
                  {renderNumber(userQuota)}
                  {/* {userQuota} */}
                </div>
              </div>
            </DangerousListItem>
          </List>
        </div>

        {/* {!loading &&
        !(isTokenValid === "invalid") &&
        (!packages || packages.length === 0) ? (
          <div style={{ height: "100px", textAlign: "center" }}>
            {Locale.PricingPage.NoPackage}
          </div>
        ) : (
          <></>
        )}
        {packages.map((item) => {
          return (
            <List key={item.uuid}>
              <DangerousListItem title={item.title} subTitle={item.subTitle}>
                <div style={{ minWidth: "100px" }}>
                  <div
                    style={{
                      margin: "10px",
                      fontSize: "24px",
                      textAlign: "center",
                    }}
                  >
                    ￥{item.price}
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <IconButton
                      text={Locale.PricingPage.Actions.Buy}
                      type="primary"
                      block={true}
                      onClick={() => {
                        handleClickBuy(item);
                      }}
                    />
                  </div>
                </div>
              </DangerousListItem>
            </List>
          );
        })} */}
      </div>
    </ErrorBoundary>
  );
}
