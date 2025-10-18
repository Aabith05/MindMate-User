import React, { useState, useRef, useEffect, memo } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Form,
  Button,
  Badge,
  Spinner,
  Figure,
} from "react-bootstrap";
import { BsSend, BsArrowLeft } from "react-icons/bs";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
};

const MessageBubble = memo(({ msg, isMe, chosenColor, isAi }) => {
  const bubbleColor = isMe ? chosenColor : "#e9ecef";
  const textColor = isMe ? "#fff" : "#000";
  const timeText =
    msg.time ||
    new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
      <div
        style={{
          background: bubbleColor,
          color: textColor,
          padding: "10px 14px",
          borderRadius: 12,
          maxWidth: "80%",
          wordBreak: "break-word",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ whiteSpace: "pre-wrap" }}>{msg.message || msg.content || ""}</div>
        <div
          className="text-end small mt-1"
          style={{ color: isMe ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.45)" }}
        >
          {timeText}
        </div>
      </div>
    </div>
  );
});

const Chat = () => {
  const { color, theme } = useTheme();
  const location = useLocation();
  const width = useWindowWidth();

  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const chosenColor = colorMap[color] || "#3b82f6";
  const isDark = theme === "dark";
  const isMobile = width < 768;

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUserId = storedUser?._id || storedUser?.id;

  const [users, setUsers] = useState([]); // combined list: users + caretakers + ai
  const [caretakers, setCaretakers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // socket connection
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const socketUrl = apiBase.replace(/\/api\/?$/, "") || "http://localhost:3000";
    const token = localStorage.getItem("token");

    const s = io(socketUrl, { auth: { token } });
    setSocket(s);

    s.on("receive_message", (chat) => {
      // if activeUser is the conversation partner, append; else ignore or could show badge
      setMessages((prev) => [...prev, chat]);
    });

    s.on("connect_error", (err) => {
      console.error("Socket connect_error:", err);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch lists (users + caretakers)
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [usersRes, caretakersRes] = await Promise.all([API.get("/chat/users"), API.get("/caretaker")]);
        const mappedUsers = (usersRes.data || []).map((u) => ({ ...u, type: "user" }));
        const mappedCaretakers = (caretakersRes.data || []).map((c) => ({ ...c, type: "caretaker" }));
        setUsers([...mappedUsers, ...mappedCaretakers]);
        setCaretakers(mappedCaretakers);

        // if navigated with caretakerId in state, preselect
        const preCaretakerId = location.state?.caretakerId;
        if (preCaretakerId) {
          const found = mappedCaretakers.find((c) => String(c._id) === String(preCaretakerId));
          if (found) setActiveUser({ ...found, type: "caretaker" });
        }
      } catch (err) {
        console.error("Failed fetching users/caretakers:", err);
      }
    };
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // fetch messages when activeUser changes
  useEffect(() => {
    let cancelled = false;
    const loadMessages = async () => {
      if (!activeUser) return;
      if (activeUser.type === "ai") {
        // AI uses local aiMessages state
        return;
      }
      setIsLoadingMessages(true);
      setMessages([]);
      try {
        const type = activeUser.type === "caretaker" ? "caretaker" : "user";
        const res = await API.get(`/chat/messages/${activeUser._id}?type=${type}`);
        if (!cancelled) setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeUser]);

  // scroll to bottom when messages or aiMessages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages]);

  const handleSendToSocket = (text) => {
    if (!socket || !activeUser) return;
    const payload = {
      receiver: activeUser._id,
      receiverType: activeUser.type,
      message: text,
    };
    // optimistic append
    const optimistic = {
      _id: `local-${Date.now()}`,
      sender: currentUserId,
      receiver: activeUser._id,
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    socket.emit("send_message", payload);
  };

  const handleAiSend = async (text) => {
    // append user message to aiMessages
    const userMsg = { message: text, role: "user", createdAt: new Date().toISOString() };
    setAiMessages((prev) => [...prev, userMsg]);

    try {
      const res = await API.post("/chat", {
        messages: [
          ...(aiMessages || []).map((m) => ({ role: m.role || "assistant", content: m.message || m.content })),
          { role: "user", content: text },
        ],
      });

      const botContent = res.data?.message?.content || res.data?.reply || "Sorry, I couldn't process that.";
      const botMsg = { message: botContent, role: "assistant", createdAt: new Date().toISOString() };
      setAiMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI chat error:", err);
      setAiMessages((prev) => [...prev, { message: "AI is unavailable right now.", role: "assistant", createdAt: new Date().toISOString() }]);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !activeUser) return;
    if (activeUser.type === "ai") {
      handleAiSend(text);
    } else {
      handleSendToSocket(text);
    }
    setNewMessage("");
  };

  const sidebarItemStyle = (isActive) => ({
    backgroundColor: isActive ? chosenColor : isDark ? "#0b1220" : "#fff",
    color: isActive ? "#fff" : isDark ? "#ddd" : "#000",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
  });

  return (
    <Container
      fluid
      className="p-0"
      style={{
        height: "100vh",
        background: isDark ? "#0b1220" : "#f8f9fa",
        color: isDark ? "#fff" : "#000",
        overflow: "hidden",
      }}
    >
      <Row className="g-0" style={{ height: "100%" }}>
        {/* Sidebar */}
        {!isMobile || !activeUser ? (
          <Col
            md={4}
            lg={3}
            style={{
              height: "100%",
              borderRight: `1px solid ${isDark ? "#1f2937" : "#dee2e6"}`,
              background: isDark ? "#0f172a" : "#fff",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: 16 }}>
              <h6 style={{ color: chosenColor }}>Users</h6>
              <ListGroup variant="flush">
                {users.filter(u => u.type === "user").map((u) => (
                  <ListGroup.Item
                    key={`user-${u._id}`}
                    action
                    onClick={() => setActiveUser({ ...u, type: "user" })}
                    active={activeUser?._id === u._id && activeUser?.type === "user"}
                    style={sidebarItemStyle(activeUser?._id === u._id && activeUser?.type === "user")}
                    className="d-flex align-items-center"
                  >
                    <Figure.Image
                      width={36}
                      height={36}
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=random`}
                      roundedCircle
                      className="me-2"
                    />
                    <div>
                      <div>{u.name}</div>
                      <div className="small text-muted">{u.email}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <h6 style={{ color: chosenColor, marginTop: 16 }}>Caretakers</h6>
              <ListGroup variant="flush">
                {caretakers.map((c) => (
                  <ListGroup.Item
                    key={`caretaker-${c._id}`}
                    action
                    onClick={() => setActiveUser({ ...c, type: "caretaker" })}
                    active={activeUser?._id === c._id && activeUser?.type === "caretaker"}
                    style={sidebarItemStyle(activeUser?._id === c._id && activeUser?.type === "caretaker")}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex align-items-center">
                      <Figure.Image
                        width={36}
                        height={36}
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || "Caretaker")}&background=random`}
                        roundedCircle
                        className="me-2"
                      />
                      <div>
                        <div>{c.name}</div>
                        <div className="small text-muted">{c.role || "Caretaker"}</div>
                      </div>
                    </div>
                    <Badge bg={isDark ? "secondary" : "light"} style={{ color: isDark ? "#ddd" : chosenColor, border: `1px solid ${chosenColor}` }}>
                      Caretaker
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <h6 style={{ color: chosenColor, marginTop: 16 }}>AI Assistant</h6>
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  onClick={() => setActiveUser({ name: "MindMate AI", type: "ai", _id: "ai" })}
                  active={activeUser?.type === "ai"}
                  style={sidebarItemStyle(activeUser?.type === "ai")}
                >
                  <div className="d-flex align-items-center">
                    <Figure.Image
                      width={36}
                      height={36}
                      src={`https://ui-avatars.com/api/?name=MindMate+AI&background=random`}
                      roundedCircle
                      className="me-2"
                    />
                    <div>
                      <div>MindMate AI</div>
                      <div className="small text-muted">Virtual assistant</div>
                    </div>
                  </div>
                  <Badge bg="info" style={{ background: chosenColor, color: "#fff" }}>
                    AI
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>
        ) : null}

        {/* Chat area */}
        <Col
          md={8}
          lg={9}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: isDark ? "#071027" : "#f1f3f5",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: `1px solid ${isDark ? "#111827" : "#e9ecef"}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {isMobile && activeUser && (
              <Button variant="link" className="p-0" onClick={() => setActiveUser(null)} style={{ color: chosenColor }}>
                <BsArrowLeft size={22} />
              </Button>
            )}
            {activeUser ? (
              <>
                <Figure.Image
                  width={40}
                  height={40}
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.name || "User")}&background=random`}
                  roundedCircle
                  className="me-2"
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{activeUser.name}</div>
                  <div className="small text-muted">{activeUser.type === "caretaker" ? activeUser.role || "Caretaker" : activeUser.email || ""}</div>
                </div>
              </>
            ) : (
              <div style={{ fontWeight: 600 }}>Select a conversation</div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {activeUser ? (
              activeUser.type === "ai" ? (
                aiMessages.length === 0 ? (
                  <div className="text-center text-muted">No conversation yet. Ask anything.</div>
                ) : (
                  aiMessages.map((m, idx) => (
                    <MessageBubble
                      key={`ai-${idx}-${m.createdAt}`}
                      msg={m}
                      isMe={m.role === "user"}
                      chosenColor={chosenColor}
                      isAi={m.role === "assistant"}
                    />
                  ))
                )
              ) : isLoadingMessages ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <Spinner animation="border" style={{ color: chosenColor }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted">No messages yet. Say hi 👋</div>
              ) : (
                messages.map((m, idx) => (
                  <MessageBubble
                    key={m._id || `msg-${idx}-${m.createdAt}`}
                    msg={m}
                    isMe={String(m.sender?.id || m.sender) === String(currentUserId)}
                    chosenColor={chosenColor}
                  />
                ))
              )
            ) : (
              <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                <div>
                  <h5>Welcome to MindMate Chat</h5>
                  <p>Select a user, caretaker or AI to start chatting</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: `1px solid ${isDark ? "#111827" : "#e9ecef"}`, background: isDark ? "#071029" : "#fff" }}>
            <Form onSubmit={handleSend}>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder={activeUser ? `Message ${activeUser.name}` : "Select a conversation"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!activeUser}
                  autoComplete="off"
                />
                <Button type="submit" disabled={!activeUser || !newMessage.trim()} style={{ background: chosenColor, borderColor: chosenColor }}>
                  <BsSend />
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
