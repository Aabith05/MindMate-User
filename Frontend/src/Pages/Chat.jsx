import { useState, useRef, useEffect, memo } from "react";
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
import { BsSend } from "react-icons/bs";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";
import { io } from "socket.io-client";

// A simple, memoized component for displaying a single message bubble.
const MessageBubble = memo(({ msg, isMe, chosenColor }) => {
  return (
    <div className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
      <div
        style={{
          padding: "10px 15px",
          borderRadius: "15px",
          background: isMe ? chosenColor : "#e5e7eb",
          color: isMe ? "white" : "black",
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        <div>{msg.message}</div>
        <div
          className="text-end small mt-1"
          style={{
            color: isMe ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)",
          }}
        >
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});

// Component for the list of users and caretakers
const UserList = ({ users, activeUser, onSelectUser, chosenColor }) => {
  const userList = users.filter((u) => u.type === "user");
  const caretakerList = users.filter((u) => u.type === "caretaker");

  const renderUserItem = (user) => (
    <ListGroup.Item
      key={`${user.type}-${user._id}`}
      action
      active={activeUser?._id === user._id && activeUser?.type === user.type}
      onClick={() => onSelectUser(user)}
      className="d-flex justify-content-between align-items-center"
    >
      <div>
        <Figure.Image
          width={30}
          height={30}
          src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, "+")}&background=random`}
          roundedCircle
          className="me-2"
        />
        {user.name}
      </div>
      {user.type === "caretaker" && <Badge bg="secondary">Caretaker</Badge>}
    </ListGroup.Item>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
      <h5 style={{ color: chosenColor, marginBottom: "1rem" }}>Users</h5>
      <ListGroup variant="flush" className="mb-4">
        {userList.length > 0 ? (
          userList.map(renderUserItem)
        ) : (
          <ListGroup.Item className="text-muted">No users found</ListGroup.Item>
        )}
      </ListGroup>
      <h5 style={{ color: chosenColor, marginBottom: "1rem" }}>Caretakers</h5>
      <ListGroup variant="flush">
        {caretakerList.length > 0 ? (
          caretakerList.map(renderUserItem)
        ) : (
          <ListGroup.Item className="text-muted">No caretakers found</ListGroup.Item>
        )}
      </ListGroup>
    </div>
  );
};

// A static header for the active chat window
const ChatHeader = ({ activeUser, isDark }) => {
  if (!activeUser) return null;
  return (
    <div style={{ padding: '10px 1.5rem', borderBottom: `1px solid ${isDark ? '#333' : '#dee2e6'}`, display: 'flex', alignItems: 'center' }}>
        <Figure.Image
          width={40}
          height={40}
          src={`https://ui-avatars.com/api/?name=${activeUser.name.replace(/\s/g, "+")}&background=random`}
          roundedCircle
          className="me-3 my-0"
        />
        <h5 className="my-0">{activeUser.name}</h5>
    </div>
  )
}

// Component for the main chat window
const ChatWindow = ({ messages, currentUserId, chosenColor, isLoading, chatEndRef }) => {
  const normalizeSenderId = (msg) => {
    if (!msg) return null;
    return msg.sender?.id ? String(msg.sender.id) : String(msg.sender);
  };
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" style={{ color: chosenColor }} />
        <span className="ms-2">Loading Messages...</span>
      </div>
    );
  }

  return (
    <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "1.5rem" }}>
      {messages.map((msg, idx) => (
        <MessageBubble
          key={msg._id || `msg-${idx}`}
          msg={msg}
          isMe={normalizeSenderId(msg) === String(currentUserId)}
          chosenColor={chosenColor}
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

// Component for the message input form
const MessageInput = ({ activeUser, onSend, isDark }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSend(newMessage);
    setNewMessage("");
  };

  return (
    <div style={{ padding: "1rem", borderTop: `1px solid ${isDark ? '#333' : '#dee2e6'}`, background: 'inherit' }}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder={activeUser ? `Message ${activeUser.name}` : "Select a conversation"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!activeUser}
            autoComplete="off"
          />
          <Button type="submit" disabled={!activeUser || !newMessage.trim()}>
            <BsSend />
          </Button>
        </div>
      </Form>
    </div>
  );
};

// Main Chat Component
const Chat = () => {
  const { color, theme } = useTheme();
  const colorMap = {
    blue: "#3b82f6", purple: "#8b5cf6", green: "#22c55e",
    yellow: "#e2d137ff", red: "#ef4444", orange: "#f97316",
  };
  const chosenColor = colorMap[color] || "#3b82f6";
  const isDark = theme === "dark";

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?._id;

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const socketUrl = apiBase.replace(/\/api\/?$/, "") || "http://localhost:3000";
    const newSocket = io(socketUrl, {
      auth: { token: localStorage.getItem("token") },
    });
    setSocket(newSocket);
    newSocket.on("receive_message", (chat) => {
      setMessages((prev) => [...prev, chat]);
    });
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [usersRes, caretakersRes] = await Promise.all([
          API.get("/chat/users"), API.get("/caretaker")
        ]);
        const mappedUsers = (usersRes.data || []).map((u) => ({ ...u, type: "user" }));
        const mappedCaretakers = (caretakersRes.data || []).map((c) => ({ ...c, type: "caretaker" }));
        setUsers([...mappedUsers, ...mappedCaretakers]);
      } catch (err) {
        console.error("Failed to fetch user lists", err);
      }
    };
    fetchLists();
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    setIsLoadingMessages(true);
    setMessages([]);
    const type = activeUser.type === "caretaker" ? "caretaker" : "user";
    API.get(`/chat/messages/${activeUser._id}?type=${type}`)
      .then((res) => setMessages(res.data || []))
      .catch((err) => console.error("Failed to fetch messages", err))
      .finally(() => setIsLoadingMessages(false));
  }, [activeUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (messageContent) => {
    if (!socket || !activeUser) return;
    const payload = {
      receiver: activeUser._id,
      receiverType: activeUser.type,
      message: messageContent,
    };
    socket.emit("send_message", payload);
    // No optimistic update here to prevent doubled messages
  };

  return (
    <Container fluid style={{ height: "100vh", background: isDark ? "#0b1220" : "#f8f9fa", color: isDark ? "white" : "black" }}>
      <Row className="g-0" style={{ height: "100%" }}>
        <Col md={4} lg={3} style={{ height: "100%", borderRight: `1px solid ${isDark ? '#333' : '#dee2e6'}`, background: isDark ? '#111827' : '#fff' }}>
          <UserList users={users} activeUser={activeUser} onSelectUser={setActiveUser} chosenColor={chosenColor} />
        </Col>

        {/* This column is the flex container for the chat panel */}
        <Col md={8} lg={9} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {activeUser ? (
            <>
              {/* Static Header */}
              <ChatHeader activeUser={activeUser} isDark={isDark} />
              
              {/* Scrollable Message Area */}
              <ChatWindow
                messages={messages}
                currentUserId={currentUserId}
                chosenColor={chosenColor}
                isLoading={isLoadingMessages}
                chatEndRef={chatEndRef}
              />

              {/* Static Input Bar - MOVED BACK INSIDE */}
              <MessageInput activeUser={activeUser} onSend={handleSend} isDark={isDark} />
            </>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
              <h3>Welcome to MindMate Chat</h3>
              <p>Select a conversation from the left to start messaging.</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;