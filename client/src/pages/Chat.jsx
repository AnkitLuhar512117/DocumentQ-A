import React from "react";
import logo from "../components/logo.jpg";
import { useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";

const Chat = () => {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div>
      <div className="bg-[#35130a] h-screen w-screen">
        {/* {logo} */}
        <div className="flex items-center justify-center w-48 absolute  left-4">
          <img
            src={logo}
            alt="Logo"
            className="flex items-center justify-center object-cover"
            onClick={handleLogoClick}
          />
        </div>
        <div className="flex items-center justify-center">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Chat;
