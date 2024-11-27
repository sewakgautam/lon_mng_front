import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigationTo = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      style={{ marginTop: 150, color: "white" }}
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => navigationTo("/")}>
          Back To Dashboard
        </Button>
      }
    />
  );
}
