import { Layout, Menu, Avatar, Popconfirm, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import {
  RightCircleOutlined,
  LeftCircleOutlined,
  DashboardOutlined,
  SlidersOutlined,
  CopyOutlined,
} from "@ant-design/icons";
// import logo from "../assets/MyCPADash.png";
// import logo from "../assets//MeroPasalDash.png";
// import minilogo from "../assets/RJLogoSmall.png";
import styles from "./Css/Base.module.css";
import { Link, Outlet, useNavigate } from "react-router-dom";
const { Header, Sider } = Layout;
import { color } from "./../../config";
import { useQuery } from "react-query";
import { sessionUser } from "../utils/bridge";
// import Master from "./Master";
// import { Footer } from "antd/es/layout/layout";

export default function Base() {
  const navigateTo = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);

  const Session: string | null = localStorage.getItem("session");
  const userSession = Session ? JSON.parse(Session) : null;
  useEffect(() => {
    if (!Session || !userSession?.token) {
      // navigateTo("/login");
      messageApi.open({
        type: "success",
        content: "Session Expired !!! ",
      });
    }
  }, [navigateTo, userSession?.token, messageApi, Session]);

  const { data: userInformation } = useQuery("userInfo", () =>
    sessionUser(userSession?.token)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        if (
          err?.response?.status === 401 ||
          err.message === "Network Error" ||
          err?.response?.status === 400
        ) {
          navigateTo("/login");
          messageApi.open({
            type: "success",
            content: "Session Expired !!! ",
          });
          localStorage.removeItem("loginData");
        }
      })
  );

  // if (userInformation?.data?.status === 401 || !userSession) {
  //   localStorage.removeItem("loginData");
  //   messageApi.open({
  //     type: "success",
  //     content: "Session Expired !!! ",
  //   });
  //   navigateTo("/login");
  // }

  const Logoutconfirm = () =>
    new Promise(() => {
      setTimeout(() => {
        localStorage.clear();
        message.success("Logout Success !!!");
        navigateTo("/login");
      }, 3000);
    });

  const pathLocation = window.location.pathname.match(/^\/([^/]*)/);
  // const AdminSideBar = [
  //   {
  //     key: "Create User",
  //     icon: <DashboardOutlined />,
  //     label: <Link to={"/i-am-master"} children={"Users"} />,
  //   },
  // ];
  const CleintSideBar = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to={"/"} children={"Dashboard"} />,
    },
    {
      key: "dhito",
      style: { overflow: "hidden", height: "100%" },
      icon: <SlidersOutlined />,
      label: <Link to={"/dhito"} children={"Customers"} />,
    },
    // {
    //   key: "bank",
    //   icon: <BankOutlined />,
    //   label: <Link to={"/bank"} children={"Bank records"} />,
    // },
    // {
    //   key: "sales",
    //   icon: <GoldOutlined />,
    //   label: <Link to={"/sales"} children={"Sales"} />,
    // },
    {
      key: "auction",
      icon: <CopyOutlined />,
      label: <Link to={"/lilami"} children={"Auction"} />,
    },
  ];

  return (
    <>
      {contextHolder}
      <Spin
        spinning={false}
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        tip="Loading ...... "
        delay={500}
      >
        <div>
          <Layout style={{ height: "100vh" }}>
            <Sider
              style={{
                background: color.Tabs,
              }}
              trigger={null}
              collapsible
              collapsed={collapsed}
            >
              <div className={styles.logo}>
                {collapsed ? (
                  <img
                    src="https://bravelender.com/assets/images/bravelender-logo.png"
                    // src={userInformation?.data?.logo}
                    className={styles.minilogo}
                    alt="logo"
                  />
                ) : (
                  <img
                    src="                    https://bravelender.com/assets/images/bravelender-logo.png
                  "
                    // src={userInformation?.data?.logo}
                    // src={logo}
                    className={styles.mainLogo}
                    alt="logo"
                    style={{ padding: 10 }}
                  />
                )}
              </div>
              <Menu
                style={{
                  background: color.Tabs,
                  color: "white",
                  border: "none",
                }}
                theme="dark"
                mode="inline"
                defaultSelectedKeys={[
                  pathLocation
                    ? pathLocation[1] == ""
                      ? "dashboard"
                      : pathLocation[1]
                    : "dashboard",
                ]}
                items={CleintSideBar}
              />
            </Sider>
            <Layout className="site-layout">
              <Header
                style={{
                  padding: 0,
                  background: color.Tabs,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {React.createElement(
                  collapsed ? RightCircleOutlined : LeftCircleOutlined,
                  {
                    className: "trigger",
                    style: { color: "white" },
                    onClick: () => setCollapsed(!collapsed),
                  }
                )}
                <Popconfirm
                  title="Logout !!!"
                  description="Are You Sure Want to Logout"
                  onConfirm={Logoutconfirm}
                  onOpenChange={() => console.log("open change")}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 50,
                    }}
                  >
                    <Avatar
                      src="https://static.vecteezy.com/system/resources/previews/024/183/502/original/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg"
                      shape="circle"
                      style={{ marginRight: 10 }}
                      size={40}
                    />
                    <p style={{ fontSize: 15, color: "white" }}>
                      {userInformation?.data?.fullName}
                    </p>
                  </div>
                </Popconfirm>
              </Header>
              <Outlet />
            </Layout>
          </Layout>
        </div>
        u
      </Spin>
    </>
  );
}
