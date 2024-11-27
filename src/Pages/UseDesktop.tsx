import { Result } from "antd";
import { useEffect } from "react";
import { FRONTEND_URL } from "../../config";

export default function Usedesktop() {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // You can adjust this threshold as needed
        // Redirect or display a message to prompt users to switch to a laptop or desktop
        window.location.href = `${FRONTEND_URL}/usedesktop`;
      } else {
        window.location.href = `${FRONTEND_URL}`;
      }
    };

    // Attach the resize event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // useEffect(() => {
  //   localStorage.clear();
  // });

  return (
    <Result
      style={{ marginTop: 150, color: "white" }}
      status="500"
      
      title="Use Laptop Or Desktop to Access this page"
      subTitle=" !!! Contact To Developer !!!"
    />
  );
}
