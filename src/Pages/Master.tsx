import { Button, Result } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function Master() {
  const navigationTo = useNavigate();

  return (
    <Result
      style={{ marginTop: 200 }}
      icon={<SmileOutlined />}
      title="Great, But I Know You Are Not Master 😉"
      subTitle="!!! This Page Is Only For Master !!!"
      extra={
        <Button type="primary" onClick={() => navigationTo("/login")}>
          Back To Login
        </Button>
      }
    />
  );
}
