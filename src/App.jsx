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
import { useState, useRef, useEffect } from "react";

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
  const [activePage, setActivePage] = useState("home");
  const [savedChats, setSavedChats] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const chatContainerRef = useRef(null);
  const hasUserStartedChat = messages.length > 1;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    setActivePage("home");
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

              {isPro && <span className="proBadge">Pro</span>}
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
                onClick={() => {
                  setActivePage("home");
                  handleSend(prompt);
                }}
                type="button"
              >
                <img src={msgicon} alt="" />
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="lowerSide">
          <div
            className={`navCard ${activePage === "home" ? "active" : ""}`}
            onClick={() => {
              setActivePage("home");
              setIsSidebarOpen(false);
            }}
          >
            <img src={home} alt="" className="listitemsImg" />
            Home
          </div>
          <div
            className={`navCard ${activePage === "saved" ? "active" : ""}`}
            onClick={() => {
              setActivePage("saved");
              setIsSidebarOpen(false);
            }}
          >
            <img src={saved} alt="" className="listitemsImg" />
            Saved
          </div>
          <div
            className={`navCard ${activePage === "pro" ? "active" : ""}`}
            onClick={() => {
              setActivePage("pro");
              setIsSidebarOpen(false);
            }}
          >
            <img src={rocket} alt="" className="listitemsImg" />
            Upgrade to Pro
          </div>
        </div>
      </aside>

      <main className={`main ${hasUserStartedChat ? "chatMode" : ""}`}>
        <div className="mobileHeader">
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>
            ☰
          </button>
        </div>

        {activePage === "home" && (
          <>
            {/* ✅ Show hero only before chat starts */}
            {!hasUserStartedChat && (
              <div className="hero">
                <p className="eyebrow">AI Assistant</p>
                <h1>Ask better questions, get cleaner answers.</h1>
                <p className="heroCopy">
                  A simple chat interface with starter prompts.
                </p>
              </div>
            )}

            {/* ✅ Always visible */}
            <div className={`svbtn ${hasUserStartedChat ? "chatTop" : ""}`}>
              <button
                className="saveBtn"
                onClick={() => {
                  setSavedChats((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      messages: messages,
                      createdAt: new Date().toLocaleString(),
                    },
                  ]);
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 2000);
                }}
              >
                {isSaved ? "Saved ✅" : "Save Chat"}
              </button>
            </div>

            <div className="chats" ref={chatContainerRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${message.role === "assistant" ? "bot" : "user"}`}
                >
                  <img
                    className="chatimg"
                    src={message.role === "assistant" ? gptImgLogo : userIcon}
                    alt=""
                  />
                  <p>{message.text}</p>
                </div>
              ))}

              {isLoading && (
                <div className="chat bot">
                  <img className="chatimg" src={gptImgLogo} alt="" />
                  <p>Thinking...</p>
                </div>
              )}
            </div>

            <div className="chatFooter">
              <div className="inp">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Send a message"
                />
                {
                  /* <button className="send" onClick={() => handleSend()}>
                  <img src={send} alt="Send" />
                </button> */
                  <button
                    className={`send ${input.trim() && !isLoading ? "enabled" : "disabled"}`}
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                  >
                    <img src={send} alt="Send" />
                  </button>
                }
              </div>
              <p className="footer">
                AI Mafia can make mistakes. Always verify responses before
                relying on them.
              </p>
            </div>
          </>
        )}
        {activePage === "saved" && (
          <div className="savedPage">
            <div className="savedHeader">
              <div>
                <p className="savedEyebrow">Saved chats</p>
                <h2>Conversations archive</h2>
                <p className="savedCopy">Open your most recent saved chat</p>
              </div>
            </div>

            {savedChats.length === 0 ? (
              <div className="emptyState">
                <p>No saved chats yet</p>
              </div>
            ) : (
              <div className="savedList">
                {savedChats.map((chat) => (
                  <div className="savedCard" key={chat.id}>
                    <div className="savedCardMeta">
                      <div>
                        <p className="savedCardLabel">Saved Chat</p>
                        <span>{chat.createdAt}</span>
                      </div>

                      <button
                        className="deleteBtn"
                        onClick={() =>
                          setSavedChats((prev) =>
                            prev.filter((c) => c.id !== chat.id),
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>

                    <div className="savedPreview">
                      {chat.messages.slice(0, 2).map((msg) => (
                        <p key={msg.id}>
                          <strong>
                            {msg.role === "user" ? "You: " : "AI: "}
                          </strong>
                          {msg.text.slice(0, 60)}...
                        </p>
                      ))}
                    </div>

                    <button
                      className="openBtn"
                      onClick={() => {
                        setMessages(chat.messages);
                        setActivePage("home");
                      }}
                    >
                      Open Chat →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activePage === "pro" && (
          <div className="proPage">
            <div className="proCard">
              <div className="popularTag">Most Popular</div>
              <div className="planBadge">Premium</div>
              <h2>AI Mafia Pro</h2>
              <p className="proTagline">
                Supercharge your AI workflow with faster responses, priority
                support, and unlimited chat history.
              </p>

              <div className="priceRow">
                <span className="price">₹199</span>
                <span className="priceSuffix">/month</span>
              </div>
              <p className="planNote">
                Billed monthly. Upgrade or cancel anytime.
              </p>

              <div className="proHighlights">
                <div>
                  <strong>99.9%</strong>
                  <span>Uptime</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Priority support</span>
                </div>
                <div>
                  <strong>Unlimited</strong>
                  <span>Saved chats</span>
                </div>
              </div>

              <ul className="proFeatureList">
                <li>Instant replies from the fastest AI model</li>
                <li>Advanced response tuning and custom prompts</li>
                <li>Unlimited chat history, recovery, and export</li>
                <li>Secure conversations with encrypted storage</li>
              </ul>

              <button
                className="proBtn"
                onClick={() => {
                  setIsPro(true);
                }}
              >
                {isPro ? "Purchased ✔" : "Upgrade Now"}
              </button>
              <p className="trustLine">Trusted by 10,000+ users worldwide</p>
              <p className="proFooter">
                Includes a 7-day free trial and easy onboarding for new users.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
