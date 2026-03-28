import { useState } from "react";
import gptLogo from "./assets/chatgpt.svg";
import addbtn from "./assets/add-30.png";
import msgicon from "./assets/message.svg";
import home from "./assets/home.svg";
import saved from "./assets/bookmark.svg";
import rocket from "./assets/rocket.svg";
import send from "./assets/send.svg";
import userIcon from "./assets/images (1).jpeg";
import gptImgLogo from "./assets/chatgptLogo.svg";
import { sendMsgToGemini } from "./openai";

import "./App.css";

const starterPrompts = [
  "What is Programming?",
  "How to use API?",
  "Explain React hooks simply",
];

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Hi! Ask me anything and I'll help you build, debug, or explain your project.",
  },
];

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSend = async (promptText = input) => {
    const trimmedInput = promptText.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedInput,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendMsgToGemini(trimmedInput);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: res || "I couldn't generate a response yet.",
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            error?.message ||
            "Something went wrong while generating the response.",
        },
      ]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages(initialMessages);
    setInput("");
  };

  return (
    <div className="app-shell">
      {isSidebarOpen && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={gptLogo} alt="AI logo" className="logo" />
            <div>
              <span className="brand">AI Mafia</span>
              <p className="brandTag">Your AI workspace</p>
            </div>
          </div>

          <button className="midBtn" onClick={handleNewChat} type="button">
            <img src={addbtn} alt="" className="addBtn" />
            New Chat
          </button>

          <div className="promptList">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                className="upperLower"
                onClick={() => handleSend(prompt)}
                type="button"
              >
                <img src={msgicon} alt="" />
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="lowerSide">
          <div className="listItems">
            <img src={home} alt="" className="listitemsImg" />
            Home
          </div>
          <div className="listItems">
            <img src={saved} alt="" className="listitemsImg" />
            Saved
          </div>
          <div className="listItems">
            <img src={rocket} alt="" className="listitemsImg" />
            Upgrade to Pro
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="mobileHeader">
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>
            ☰
          </button>
        </div>
        <div className="hero">
          <p className="eyebrow">AI Assistant</p>
          <h1>Ask better questions, get cleaner answers.</h1>
          <p className="heroCopy">
            A simple chat interface with starter prompts, live responses, and a
            layout that works on both desktop and mobile.
          </p>
        </div>

        <div className="chats">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${message.role === "assistant" ? "bot" : "user"}`}
            >
              <img
                className="chatimg"
                src={message.role === "assistant" ? gptImgLogo : userIcon}
                alt={
                  message.role === "assistant"
                    ? "Assistant avatar"
                    : "User avatar"
                }
              />
              <p>{message.text}</p>
            </div>
          ))}

          {isLoading && (
            <div className="chat bot">
              <img
                className="chatimg"
                src={gptImgLogo}
                alt="Assistant avatar"
              />
              <p>Thinking...</p>
            </div>
          )}
        </div>

        <div className="chatFooter">
          <div className="inp">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Send a message"
            />
            <button className="send" onClick={() => handleSend()} type="button">
              <img src={send} alt="Send" />
            </button>
          </div>
          <p className="footer">
            AI Mafia can make mistakes. Always verify responses before relying
            on them.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
