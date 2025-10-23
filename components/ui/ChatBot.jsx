"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Trash, Send } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [awaitingMenuReturn, setAwaitingMenuReturn] = useState(false);
  const chatRef = useRef(null);

  // Load FAQs & chat history
  useEffect(() => {
    fetch("/api/gemini")
      .then(res => res.json())
      .then(data => {
        setFaqs(data.faqs || []);
        if (!localStorage.getItem("chatHistory") || messages.length === 0) {
          showMenu(data.faqs || []);
        }
      })
      .catch(err => console.error(err));

    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  // Save chat history & scroll
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Show FAQ menu line by line
  const showMenu = (faqList) => {
    if (!faqList || faqList.length === 0) return;
    const menu = "Please select a number:\n" + faqList.map(f => `${f.id}. ${f.question}`).join("\n");
    setMessages(prev => [...prev, { sender: "bot", text: menu }]);
    setAwaitingMenuReturn(false);
  };

  // Handle user input
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const trimmed = input.trim();
    const selectedNumber = parseInt(trimmed);
    const faq = faqs.find(f => f.id === selectedNumber);

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: trimmed }]);

    if (awaitingMenuReturn) {
      showMenu(faqs);
      setInput("");
      return;
    }

    if (faq) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: faq.answer },
        { sender: "bot", text: "Press Enter to see the menu again." }
      ]);
      setAwaitingMenuReturn(true);
    } else {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Invalid selection. Please enter a number from the menu." }
      ]);
    }

    setInput(""); // clear input
  };

  // Clear chat and restore menu
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
    showMenu(faqs);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-50"
        onClick={toggleChat}
      >
        <MessageCircle size={24} />
      </button>

      {/* ChatBox */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-6 bg-black text-white rounded-2xl shadow-2xl flex flex-col border border-gray-700 transition-all duration-300 z-50 ${
            isExpanded ? "w-[380px] h-[500px]" : "w-[320px] h-[400px]"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-gray-900 text-white rounded-t-2xl">
            <span className="font-bold">AI Career Coach</span>
            <div className="flex space-x-2">
              <button onClick={toggleExpand} className="p-1 hover:text-gray-400">
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button onClick={toggleChat} className="p-1 hover:text-gray-400">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 max-w-[75%] rounded-lg text-sm break-words ${
                  msg.sender === "user" ? "bg-white text-black ml-auto" : "bg-gray-800 text-white"
                }`}
              >
                {msg.text.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-900 flex items-center space-x-2 border-t border-gray-700 rounded-b-2xl">
            <div className="flex-1 bg-black p-2 rounded-full flex items-center border border-gray-700">
              <input
                type="text"
                placeholder="Enter number or press Enter..."
                className="w-full text-sm bg-transparent text-white px-3 focus:outline-none placeholder-gray-400"
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
