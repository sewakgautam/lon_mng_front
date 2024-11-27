import { Alert, Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { axiosInstance } from "../utils/bridge";
import { useNavigate } from "react-router-dom";
// import { axiosInstance } from "../../Bridge";
// import axios from "axios";


export default function Login() {
  // const [messageApi] = message.useMessage();
  const navigateTo = useNavigate();
  const [loading, setLoading] = useState(false);

  const [cerdential, setCredential] = useState<{
    username: string;
    password: string;
  }>({ username: "", password: "" });

  const [credentialError, setCredentialError] = useState(false);
  // const [jwtToken, setJwtToken] = useState("");

  // const info = (message: string) => {
  //   messageApi.success(message);
  // };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await axiosInstance.post("/auth/login", cerdential);
      if (data?.data?.statusCode === 401 && data.status === 201) {
        message.info(data?.data?.message);
      } else if (data.data.token) {
        localStorage.setItem("session", JSON.stringify(data.data));
        message.success("Login Successful !!!");
        setLoading(false);
        navigateTo("/");
      } else {
        message.warning("Unknown Error Contact To Admin");
      }
    } catch (err) {
      setLoading(false);
      console.log("thhis is err", err);
      message.error("Credential Not Matched");
      setCredentialError(true);
    }
  };
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {/* <div> */}
        <img
          style={{
            flex: "50%",
            objectFit: "cover",
            filter: "brightness(30%)",
          }}
          // src={jwelImage}
          src={
            "https://www.rbsarchitects.co.uk/assets/uploads/projects/25/65-large-pg_new-HML05.jpg"
          }
        ></img>
        {/* </div> */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flex: "50%",
            height: "100vh",
            boxShadow: "50px 100px #000",
            // borderRadius:'100px'
          }}
        >
          <div
            style={{
              marginTop: "25vh",
              backgroundColor: "#172C69",
              height: "400px",
              padding: 50,
              borderRadius: 10,
              boxShadow: "1px 1px 30px #1039",
            }}
          >
            {/* {contextHolder} */}
            <Form
              disabled={loading}
              name="normal_login"
              className="login-form"
              onFinish={() => handleLogin()}
              autoComplete="off"
            >
              <Form.Item>
                <img
                  src="https://bravelender.com/assets/images/bravelender-logo.png"
                  alt="logo"
                  style={{ width: 410 }}
                />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your Username!" },
                ]}
              >
                <Input
                  style={{ width: 410 }}
                  status={credentialError ? "error" : undefined}
                  value={cerdential.username}
                  onChange={(text) => {
                    setCredentialError(false);
                    setCredential({
                      ...cerdential,
                      username: text.target.value,
                    });
                    // console.log(text.target.value);
                  }}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input
                  status={credentialError ? "error" : ""}
                  value={cerdential.password}
                  style={{ width: 410 }}
                  onChange={(text) => {
                    setCredentialError(false);
                    setCredential({
                      ...cerdential,
                      password: text.target.value,
                    });
                  }}
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              {credentialError ? (
                <Alert
                  showIcon
                  closable
                  onClose={() => setCredentialError(false)}
                  style={{ marginTop: 10, width: 410, marginBottom: 30 }}
                  message="Credential Invalid"
                  type="error"
                />
              ) : undefined}

              <Form.Item>
                <Button
                  style={{ width: 410 }}
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  // loading={loading}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
