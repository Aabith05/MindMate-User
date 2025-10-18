// ...existing code...
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import { User, Bell, Palette, Eye } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const Settings = () => {
  const [activeKey, setActiveKey] = useState("profile");
  const [loading, setLoading] = useState(true);

  const {
    theme,
    setTheme,
    color,
    setColor,
    font,
    setFont,
    accessibility,
    setAccessibility,
  } = useTheme();

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    photo: "",
  });

  // Settings state (for notifications, etc.)
  const [settings, setSettings] = useState({
    theme: "light",
    color: "blue",
    font: "default",
    accessibility: { largeText: false },
    notifications: { email: true, sms: false, push: false },
  });

  // Load user profile and settings from backend
  useEffect(() => {
    const load = async () => {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          const userObj = JSON.parse(user);
          setProfile({
            name: userObj.name || "",
            email: userObj.email || "",
            photo: userObj.photo || "",
          });
        }
        // attempt load settings from API; fallback to defaults on error
        const res = await API.get("/auth/settings");
        if (res?.data) {
          setSettings(res.data);
          if (res.data.theme) setTheme(res.data.theme);
          if (res.data.color) setColor(res.data.color);
          if (res.data.font) setFont(res.data.font);
          if (res.data.accessibility) setAccessibility(res.data.accessibility);
        }
      } catch (err) {
        // ignore - keep defaults
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [setTheme, setColor, setFont, setAccessibility]);

  // Save settings to backend
  const handleSaveSettings = async () => {
    try {
      const payload = {
        theme,
        color,
        font,
        accessibility,
        notifications: settings.notifications,
      };
      await API.put("/auth/settings", payload);
      alert("Settings saved!");
    } catch (err) {
      console.error("Save settings error:", err);
      alert("Failed to save settings");
    }
  };

  const chosenColor =
    {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      green: "#22c55e",
      yellow: "#eab308",
      red: "#ef4444",
      orange: "#f97316",
    }[color] || "#3b82f6";

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <Container fluid className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={11} lg={10}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <Row className="g-0 flex-column flex-md-row">
              {/* Sidebar */}
              <Col
                md={3}
                className={`${
                  theme === "dark" ? "bg-dark text-light" : "bg-white"
                } border-end px-3 py-4`}
              >
                <h5
                  className="fw-bold mb-4 text-center"
                  style={{ color: chosenColor }}
                >
                  ⚙ Settings
                </h5>
                <Nav
                  variant="pills"
                  className="flex-md-column flex-row justify-content-around gap-2"
                  activeKey={activeKey}
                  onSelect={(k) => setActiveKey(k || "profile")}
                >
                  {[
                    {
                      key: "profile",
                      icon: <User size={18} />,
                      label: "Profile",
                    },
                    {
                      key: "notifications",
                      icon: <Bell size={18} />,
                      label: "Notifications",
                    },
                    {
                      key: "accessibility",
                      icon: <Eye size={18} />,
                      label: "Accessibility",
                    },
                    {
                      key: "appearance",
                      icon: <Palette size={18} />,
                      label: "Appearance",
                    },
                  ].map((item) => (
                    <Nav.Item key={item.key}>
                      <Nav.Link
                        eventKey={item.key}
                        className="d-flex align-items-center rounded-3 px-3 py-2"
                        style={{
                          backgroundColor:
                            activeKey === item.key ? chosenColor : "transparent",
                          color:
                            activeKey === item.key
                              ? "#fff"
                              : theme === "dark"
                              ? "#ddd"
                              : chosenColor,
                          border: `1px solid ${chosenColor}`,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {item.icon}
                        <span className="ms-2">{item.label}</span>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Col>

              {/* Content */}
              <Col
                md={9}
                className={
                  theme === "dark" ? "bg-dark text-light p-4" : "bg-light p-4"
                }
              >
                <Tab.Container activeKey={activeKey}>
                  <Tab.Content>
                    {/* Profile */}
                    <Tab.Pane eventKey="profile">
                      <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5
                          className="fw-bold mb-3"
                          style={{ color: chosenColor }}
                        >
                          👤 Profile Settings
                        </h5>
                        <Form>
                          <div className="text-center mb-3">
                            {profile.photo ? (
                              <img
                                src={profile.photo}
                                alt="Profile"
                                className="rounded-circle mb-2"
                                style={{
                                  width: 100,
                                  height: 100,
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                                style={{
                                  width: 100,
                                  height: 100,
                                  background: "#ddd",
                                  color: "#555",
                                  fontSize: "2rem",
                                }}
                              >
                                {profile.name ? profile.name[0] : "?"}
                              </div>
                            )}
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () =>
                                    setProfile({
                                      ...profile,
                                      photo: reader.result,
                                    });
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>

                          <Form.Group className="mb-3" controlId="profileName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter your name"
                              value={profile.name}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  name: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                          <Form.Group className="mb-3" controlId="profileEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              placeholder="Enter your email"
                              value={profile.email}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  email: e.target.value,
                                })
                              }
                              disabled
                            />
                          </Form.Group>
                        </Form>
                      </Card>
                    </Tab.Pane>

                    {/* Notifications */}
                    <Tab.Pane eventKey="notifications">
                      <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5
                          className="fw-bold mb-3"
                          style={{ color: chosenColor }}
                        >
                          🔔 Notification Preferences
                        </h5>
                        <Form.Check
                          type="switch"
                          id="emailSwitch"
                          label="Email Notifications"
                          checked={settings.notifications.email}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              notifications: {
                                ...s.notifications,
                                email: e.target.checked,
                              },
                            }))
                          }
                          className="mb-2"
                        />
                      </Card>
                    </Tab.Pane>

                    {/* Accessibility */}
                    <Tab.Pane eventKey="accessibility">
                      <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5
                          className="fw-bold mb-3"
                          style={{ color: chosenColor }}
                        >
                          🦾 Accessibility
                        </h5>
                        <Form.Check
                          type="switch"
                          id="largerText"
                          label="Larger Text"
                          checked={settings.accessibility.largeText}
                          onChange={(e) => {
                            setSettings((s) => ({
                              ...s,
                              accessibility: {
                                ...s.accessibility,
                                largeText: e.target.checked,
                              },
                            }));
                            setAccessibility({
                              ...settings.accessibility,
                              largeText: e.target.checked,
                            });
                          }}
                          className="mb-2"
                        />
                      </Card>
                    </Tab.Pane>

                    {/* Appearance */}
                    <Tab.Pane eventKey="appearance">
                      <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5
                          className="fw-bold mb-3"
                          style={{ color: chosenColor }}
                        >
                          🎨 Appearance
                        </h5>
                        <Form.Group className="mb-3">
                          <Form.Label>Theme</Form.Label>
                          <Form.Select
                            value={settings.theme}
                            onChange={(e) => {
                              setSettings((s) => ({
                                ...s,
                                theme: e.target.value,
                              }));
                              setTheme(e.target.value);
                            }}
                            style={{ border: `1px solid ${chosenColor}` }}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Accent Color</Form.Label>
                          <Form.Select
                            value={settings.color}
                            onChange={(e) => {
                              setSettings((s) => ({
                                ...s,
                                color: e.target.value,
                              }));
                              setColor(e.target.value);
                            }}
                            style={{ border: `1px solid ${chosenColor}` }}
                          >
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="red">Red</option>
                            <option value="orange">Orange</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Font Style</Form.Label>
                          <Form.Select
                            value={settings.font}
                            onChange={(e) => {
                              setSettings((s) => ({
                                ...s,
                                font: e.target.value,
                              }));
                              setFont(e.target.value);
                            }}
                            style={{ border: `1px solid ${chosenColor}` }}
                          >
                            <option value="default">Default</option>
                            <option value="serif">Serif</option>
                            <option value="sans-serif">Sans-serif</option>
                          </Form.Select>
                        </Form.Group>
                      </Card>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
                <div className="text-end">
                  <Button
                    style={{ background: chosenColor, border: "none" }}
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
