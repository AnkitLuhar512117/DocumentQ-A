import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../components/logo.jpg";
import ChatBox from "../components/ChatBox";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const documentName = location.state?.documentName || "Untitled Document";
  const documentId = location.state?.documentId;
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex justify-center items-center p-6">
      {/* Chat container */}
      <div className="w-full max-w-3xl h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
            />
            <span className="text-lg font-semibold text-gray-700 truncate hover:text-blue-600">
              {documentName}
            </span>
          </div>
          <span className="flex items-center gap-2 text-green-500 font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Connected
          </span>
        </div>

        {/* Chat messages */}
        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          <ChatBox documentId={documentId} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
