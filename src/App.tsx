import "./App.css";
import { Route, Routes } from "react-router-dom";
import Base from "./Pages/Base";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
// import NoInternetConnection from "./Components/NointernetConnection";
import Sales from "./Pages/Sales";
import Locker from "./Pages/Locker";
import UserProfile from "./Pages/UserProfile";
import Dhito from "./Pages/Collateral";
import Lilami from "./Pages/Lilami";
import { ReactQueryDevtools } from "react-query/devtools";
import { useEffect } from "react";
import { FRONTEND_URL } from "../config";
import Usedesktop from "./Pages/UseDesktop";
import PageNotFound from "./Pages/PageNotFound";
import NoInternetConnection from "./Components/NointernetConnection";
import Master from './Pages/Master';

// import NoInternetConnection from "./Components/NointernetConnection";

function App() {
  const winSize = window.innerWidth;
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // You can adjust this threshold as needed
        // Redirect or display a message to prompt users to switch to a laptop or desktop
        window.location.href = `${FRONTEND_URL}/usedesktop`;
      }
    };

    // Attach the resize event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [winSize]);
  return (
    <>
      <div className="App">
        <NoInternetConnection>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Base />}>
              <Route path="/" element={<Dashboard />}></Route>
              <Route path="/dhito" element={<Dhito />}></Route>
              <Route path="/dhito/:userId" element={<UserProfile />}></Route>
              <Route path="/sales" element={<Sales />}></Route>
              <Route path="/bank" element={<Locker />}></Route>
              <Route path="/lilami" element={<Lilami />}></Route>
            </Route>
            <Route path="/usedesktop" element={<Usedesktop />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/i-am-master" element={<Master />}></Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </NoInternetConnection>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default App;
