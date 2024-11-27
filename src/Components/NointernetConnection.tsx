import { Button, Result } from "antd";
import { useState, useEffect, PropsWithChildren } from "react";

const NoInternetConnection = (props: PropsWithChildren) => {
  // state variable holds the state of the internet connection
  const [isOnline, setOnline] = useState(true);

  // On initization set the isOnline state.
  useEffect(() => {
    setOnline(navigator.onLine);
  }, []);

  // event listeners to update the state
  window.addEventListener("online", () => {
    setOnline(true);
  });

  window.addEventListener("offline", () => {
    setOnline(false);
  });
  // if user is online, return the child component else return a custom component
  if (isOnline) {
    return props.children;
  } else {
    return (
      <Result
        style={{ marginTop: 150 }}
        status="500"
        title="No Internet Connection"
        subTitle="Please Try Later !!!"
        extra={
          <Button
            onClick={() => {
              window.location.reload();
            }}
            type="primary"
          >
            Referesh
          </Button>
        }
      />
    );
  }
};

export default NoInternetConnection;
