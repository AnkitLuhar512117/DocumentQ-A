import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChatBox = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!userQuery.trim()) return;
    const currentQuery = userQuery;
    setUserQuery("");

    setMessages((prev) => [...prev, { sender: "user", text: currentQuery }]);
    setLoading(true);

    try {
      const response = await fetch("https://documentq-a-3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuery, documentId }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.answer || "No response received." },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Oops! Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Messages */}
      <div className="flex-grow overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200/50 p-2">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[65%] px-5 py-3 rounded-2xl shadow-sm break-words text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-4 border-t border-gray-200 bg-white">
        <input
          type="text"
          placeholder="Ask something about this document..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 px-4 py-3 rounded-l-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 shadow-sm transition"
        />
        <button
          onClick={handleSendMessage}
          className="px-5 py-3 bg-blue-600 rounded-r-3xl hover:bg-blue-700 text-white font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
