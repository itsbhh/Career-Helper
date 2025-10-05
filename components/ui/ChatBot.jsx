"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Trash, Send } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Scroll to the latest message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.text };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "Error getting response!" }]);
    }

    setInput("");
  };

  return (
    <>
      {/* Floating Chat Button with Animation */}
      <button
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105"
        onClick={toggleChat}
      >
        <MessageCircle size={24} />
      </button>

      {/* ChatBox Modal */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-6 bg-black text-white ${
            isExpanded ? "w-96 h-[500px]" : "w-80 h-96"
          } rounded-2xl shadow-2xl flex flex-col border border-gray-700 transition-all duration-300`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-gray-900 text-white rounded-t-2xl">
            <span className="text-sm font-bold">AI Career Coach</span>
            <div className="flex space-x-3">
              <button onClick={toggleExpand} className="p-1 hover:text-gray-400">
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={toggleChat} className="p-1 hover:text-gray-400">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatRef} className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 max-w-[75%] rounded-lg text-sm ${
                  msg.sender === "user" ? "bg-white text-black ml-auto" : "bg-gray-800 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input - Fully Rounded */}
          <div className="p-3 bg-gray-900 flex items-center space-x-2 border-t border-gray-700 rounded-b-2xl">
            <div className="flex-1 bg-black p-2 rounded-full flex items-center border border-gray-700">
              <input
                type="text"
                className="w-full text-sm bg-transparent text-white px-3 focus:outline-none placeholder-gray-400"
                placeholder="Ask career-related queries..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>
            <button onClick={handleSendMessage} className="bg-white text-black p-2 rounded-full hover:bg-gray-300">
              <Send size={18} />
            </button>
            <button onClick={clearChat} className="p-2 hover:text-red-500">
              <Trash size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
