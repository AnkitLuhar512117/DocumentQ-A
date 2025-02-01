import React, { useState } from "react";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to send message to the AI
  const handleSendMessage = async () => {
    if (!userQuery.trim()) return; // Avoid sending empty queries

    // Add the user query to the message list
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userQuery },
    ]);

    setLoading(true); // Show loading spinner

    try {
      // Send the query to the server (Fix: Send "question" instead of "query")
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuery }), // Fixed key
      });

      const data = await response.json();

      // Fix: Access "answer" instead of "response"
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "ai", text: data.answer || "No response received." },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "ai", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false); // Hide loading spinner
    }

    // Clear the input field
    setUserQuery("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#35130a]">
      <div className="w-full sm:w-[430px] bg-[#1d2429] p-6 rounded-xl shadow-lg overflow-hidden">
        <div className="h-[430px] overflow-y-auto mb-6 bg-[#202c33] p-4 rounded-lg">
          {/* Display messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 ${
                msg.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-center text-gray-400">AI is typing...</div>
          )}
        </div>

        {/* Input field and send button */}
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-3 border-2 border-[#3f4f5f] rounded-l-lg bg-[#2a343f] text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Type your query..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
