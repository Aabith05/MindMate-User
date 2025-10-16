import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, ProgressBar, Tabs, Tab, Button } from "react-bootstrap";
import {
  Trophy,
  TrendingUp,
  Brain,
  Heart,
  Users,
  Award
} from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { color } = useTheme();

  const [user, setUser] = useState({
    name: "",
    photo: "",
    email: "",
    level: 0,
  });

  // Profile state loaded from backend
  const [profile, setProfile] = useState({
    points: 0,
    achievements: [],
    skills: [],
    activities: [],
  });

  useEffect(() => {
    API.get("/auth/profile").then(res => {
      // Defensive: fallback to empty arrays if undefined
      const p = res.data || {};
      setProfile(prev => ({
        ...prev,
        name: p.name || "",
        photo: p.photo || "",
        email: p.email || "",
        level: p.level || 1,
        points: p.points || 0,
        achievements: Array.isArray(p.achievements) ? p.achievements : [],
        skills: Array.isArray(p.skills) ? p.skills : [],
        activities: Array.isArray(p.activities) ? p.activities : [],
      }));
    });
  }, []);

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Accent color
  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const accent = colorMap[color] || "#3b82f6";

  const totalPoints = profile.points || 0;
  const nextLevelPoints = 3000;
  const currentLevelProgress = (totalPoints / nextLevelPoints) * 100;

  return (
    <Container fluid className="py-5 min-vh-100">
      {/* Profile Header */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="d-flex align-items-center">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center"
                  style={{
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                    background: accent,
                  }}
                >
                  {user.name ? user.name[0] : "?"}
                </div>
              )}
              <div className="ms-3">
                <h3>{user.name || "Unnamed User"}</h3>
                <p className="text-muted">{user.email}</p>
                <Badge style={{ background: accent }}>Level {user.level || 1}</Badge>
                <Badge bg="success" className="ms-2">Active</Badge>
              </div>
            </Col>

            <Col md={4} className="text-center">
              <h4 style={{ color: accent }}>{totalPoints}</h4>
              <p className="text-muted">Total Points</p>
            </Col>
            <Col md={2} className="text-center">
              <h4 style={{ color: accent }}>{profile.activities.length || 0}</h4>
              <p className="text-muted">Activities</p>
            </Col>
            <Col md={2} className="text-center">
              <h4 style={{ color: accent }}>{profile.achievements.length || 0}</h4>
              <p className="text-muted">Achievements</p>
            </Col>
          </Row>

          {/* Progress bar */}
          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-between">
                <span>Progress to Level {profile.level + 1}</span>
                <span>{totalPoints}/{nextLevelPoints} points</span>
              </div>
              <ProgressBar
                now={currentLevelProgress}
                className="mt-2"
                style={{ backgroundColor: "#e9ecef" }}
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${currentLevelProgress}%`,
                    background: accent,
                  }}
                />
              </ProgressBar>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "overview")}
        className="mb-3"
        justify
      >
        {[
          { key: "overview", label: "Overview" },
          { key: "achievements", label: "Achievements" },
          { key: "skills", label: "Skills" },
          { key: "activity", label: "Activity" },
        ].map((tab) => (
          <Tab
            key={tab.key}
            eventKey={tab.key}
            title={
              <span
                style={{
                  color: activeTab === tab.key ? accent : "#6c757d",
                  fontWeight: activeTab === tab.key ? "600" : "400",
                  transition: "color 0.3s ease",
                }}
              >
                {tab.label}
              </span>
            }
          />
        ))}
      </Tabs>

      {/* Overview */}
      {activeTab === "overview" && (
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <Trophy size={18} className="me-2" style={{ color: accent }} /> Recent Achievements
              </Card.Header>
              <Card.Body>
                {profile.achievements
                  .filter(a => a.earned)
                  .slice(0, 3)
                  .map((a, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-3">
                      <Trophy className="me-3" style={{ color: accent }} />
                      <div>
                        <h6>{a.title}</h6>
                        <p className="text-muted small">{a.description}</p>
                      </div>
                      <Badge bg="secondary" className="ms-auto">{a.date}</Badge>
                    </div>
                  ))}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <TrendingUp size={18} className="me-2" style={{ color: accent }} /> Skill Development
              </Card.Header>
              <Card.Body>
                {profile.skills.map((skill, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>{skill.name}</span>
                      <small>Level {skill.level}/{skill.maxLevel}</small>
                    </div>
                    <ProgressBar
                      now={skill.progress}
                      style={{ backgroundColor: "#e9ecef" }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${skill.progress}%`,
                          background: accent,
                        }}
                      />
                    </ProgressBar>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Achievements */}
      {activeTab === "achievements" && (
        <Row>
          {profile.achievements.map((a, idx) => (
            <Col md={4} key={idx}>
              <Card className={`mb-4 ${a.earned ? "border-success" : "opacity-50"}`}>
                <Card.Body className="text-center">
                  <Trophy size={32} style={{ color: a.earned ? accent : "#aaa" }} />
                  <h6 className="mt-3">{a.title}</h6>
                  <p className="small text-muted">{a.description}</p>
                  {a.earned ? (
                    <Badge style={{ background: accent }}>
                      <Award size={14} className="me-1" /> Earned
                    </Badge>
                  ) : (
                    <>
                      <ProgressBar
                        now={a.progress}
                        className="mb-2"
                        style={{ backgroundColor: "#e9ecef" }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${a.progress}%`,
                            background: accent,
                          }}
                        />
                      </ProgressBar>
                      <Badge bg="secondary">{a.progress}% Complete</Badge>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Skills */}
      {activeTab === "skills" && (
        <Row>
          {profile.skills.map((skill, idx) => (
            <Col md={6} key={idx}>
              <Card className="mb-4">
                <Card.Body>
                  <h5>{skill.name}</h5>
                  <p>Level {skill.level} of {skill.maxLevel}</p>
                  <ProgressBar
                    now={skill.progress}
                    className="mb-3"
                    style={{ backgroundColor: "#e9ecef" }}
                  >
                    <div
                      className="progress-bar"
                      style={{
                        width: `${skill.progress}%`,
                        background: accent,
                      }}
                    />
                  </ProgressBar>
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    style={{
                      color: accent,
                      borderColor: accent,
                    }}
                  >
                    Practice {skill.name}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Activity */}
      {activeTab === "activity" && (
        <Card>
          <Card.Body>
            {profile.activities.map((a, idx) => (
              <div key={idx} className="d-flex align-items-center mb-3">
                {a.type === "game" && <Brain className="me-3" style={{ color: accent }} />}
                {a.type === "chat" && <Users className="me-3" style={{ color: accent }} />}
                {a.type === "achievement" && <Trophy className="me-3" style={{ color: accent }} />}
                {a.type === "caretaker" && <Heart className="me-3 text-danger" />}
                <div>
                  <h6>{a.title}</h6>
                  <p className="small text-muted">{a.time}</p>
                </div>
                {a.points > 0 && (
                  <Badge style={{ background: accent }} className="ms-auto">
                    +{a.points} pts
                  </Badge>
                )}
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Profile;