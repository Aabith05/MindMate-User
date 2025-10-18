import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Tabs,
  Tab,
  Pagination,
} from "react-bootstrap";
import { Trophy, TrendingUp, LogIn, Gamepad, Users } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const PAGE_SIZE = 10;

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { color } = useTheme();

  const [user, setUser] = useState({
    name: "",
    photo: "",
    email: "",
    level: 1,
  });

  const [profile, setProfile] = useState({
    points: 0,
    totalLogins: 0,
    gamesPlayed: 0,
    chatMessages: 0,
    achievements: [],
    activities: [],
  });

  const [todayCounts, setTodayCounts] = useState({
    logins: 0,
    games: 0,
    chats: 0,
    points: 0,
  });

  // pagination state for overall activities
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        const p = res.data || {};
        setProfile((prev) => ({ ...prev, ...p }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    computeTodayCounts(profile.activities || []);
  }, [profile.activities]);

  const isToday = (iso) => {
    if (!iso) return false;
    const today = new Date();
    const d = new Date(iso);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const computeTodayCounts = (activities = []) => {
    let logins = 0,
      games = 0,
      chats = 0,
      points = 0;
    activities.forEach((a) => {
      if (!a) return;
      if (isToday(a.time)) {
        points += Number(a.points || 0);
        if (a.type === "login") logins++;
        if (a.type === "game") games++;
        if (a.type === "chat") chats++;
      }
    });

    setTodayCounts({ logins, games, chats, points });
  };

  // derive lists for UI
  const overallActivities = profile.activities ? [...profile.activities] : [];
  const todayActivities = overallActivities.filter((a) => isToday(a.time));

// pagination derived values
  const totalPages = Math.max(1, Math.ceil(overallActivities.length / PAGE_SIZE));
  // ensure currentPage stays in range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [overallActivities.length, totalPages, currentPage]);

  const pagedOverall = overallActivities
    .slice()
    .reverse()
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
  const progress = Math.min(
    Math.round((totalPoints / nextLevelPoints) * 100),
    100
  );

  return (
    <Container fluid className="py-5 min-vh-100">
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
                <Badge style={{ background: accent }}>Level {user.level}</Badge>
                <Badge bg="success" className="ms-2">
                  Active
                </Badge>
              </div>
            </Col>

            <Col md={2} className="text-center">
              <h4 style={{ color: accent }}>{todayCounts.logins || 0}</h4>
              <p className="text-muted mb-1">Connections</p>
            </Col>

            <Col md={2} className="text-center">
              <h4 style={{ color: accent }}>{todayCounts.games || 0}</h4>
              <p className="text-muted mb-1">Games Played</p>
            </Col>

            <Col md={2} className="text-center">
              <h4 style={{ color: accent }}>{todayCounts.chats || 0}</h4>
              <p className="text-muted mb-1">Interactions</p>
            </Col>

            <Col md={2} className="text-center">
              <h4 style={{ color: accent }}>{todayCounts.points || 0}</h4>
              <p className="text-muted mb-1">Points Earned</p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-between">
                <span>Progress to Level {user.level + 1}</span>
                <span>
                  {totalPoints}/{nextLevelPoints} points
                </span>
              </div>
              <ProgressBar
                now={progress}
                className="mt-2"
                style={{ backgroundColor: "#e9ecef" }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "overview")}
        className="mb-3"
        justify
      >
        <Tab eventKey="overview" title="Overview" />
        <Tab eventKey="activity" title="Activity" />
      </Tabs>

      {activeTab === "overview" && (
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <Trophy size={18} className="me-2" style={{ color: accent }} />{" "}
                Recent Achievements
              </Card.Header>
              <Card.Body>
                {profile.achievements?.length > 0 ? (
                  profile.achievements.slice(0, 3).map((a, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-3">
                      <Trophy className="me-3" style={{ color: accent }} />
                      <div>
                        <h6>{a.title}</h6>
                        <p className="text-muted small">{a.description}</p>
                      </div>
                      <Badge bg="secondary" className="ms-auto">
                        {a.date}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No achievements yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <TrendingUp
                  size={18}
                  className="me-2"
                  style={{ color: accent }}
                />{" "}
                Activity Summary
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <LogIn size={16} className="me-2" /> Connections:{" "}
                  <strong>{profile.totalLogins}</strong>{" "}
                  <span className="text-primary ms-2">
                    ({todayCounts.logins} today)
                  </span>
                </p>
                <p className="mb-2">
                  <Gamepad size={16} className="me-2" /> Games Played:{" "}
                  <strong>{profile.gamesPlayed}</strong>{" "}
                  <span className="text-primary ms-2">
                    ({todayCounts.games} today)
                  </span>
                </p>
                <p className="mb-0">
                  <Users size={16} className="me-2" /> Interactions:{" "}
                  <strong>{profile.chatMessages}</strong>{" "}
                  <span className="text-primary ms-2">
                    ({todayCounts.chats} today)
                  </span>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === "activity" && (
        <Row>
          <Col>
            <Card className="mb-4">
              <Card.Body>
                <Tabs
                  defaultActiveKey="today"
                  id="activity-subtabs"
                  className="mb-3"
                >
                  <Tab
                    eventKey="today"
                    title={`Today (${todayActivities.length})`}
                  >
                    {todayActivities.length > 0 ? (
                      todayActivities.slice().reverse().map((a, idx) => (
                        <div key={idx} className="d-flex align-items-center mb-3">
                          <div style={{ width: 40 }}>
                            {a.type === "game"
                              ? "🎮"
                              : a.type === "chat"
                              ? "💬"
                              : "🔑"}
                          </div>
                          <div>
                            <h6 className="mb-0">{a.title}</h6>
                            <p className="small text-muted mb-0">
                              {new Date(a.time).toLocaleString()}
                            </p>
                          </div>
                          {a.points > 0 && (
                            <Badge
                              style={{ background: accent }}
                              className="ms-auto"
                            >
                              +{a.points} pts
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No activity today.</p>
                    )}
                  </Tab>

                  <Tab
                    eventKey="overall"
                    title={`Overall (${overallActivities.length})`}
                  >
                    {overallActivities.length === 0 ? (
                      <p className="text-muted">No activity yet.</p>
                    ) : (
                      <>
                        {pagedOverall.map((a, idx) => (
                          <div key={idx} className="d-flex align-items-center mb-3">
                            <div style={{ width: 40 }}>
                              {a.type === "game"
                                ? "🎮"
                                : a.type === "chat"
                                ? "💬"
                                : "🔑"}
                            </div>
                            <div>
                              <h6 className="mb-0">{a.title}</h6>
                              <p className="small text-muted mb-0">
                                {new Date(a.time).toLocaleString()}
                              </p>
                            </div>
                            {a.points > 0 && (
                              <Badge
                                style={{ background: accent }}
                                className="ms-auto"
                              >
                                +{a.points} pts
                              </Badge>
                            )}
                          </div>
                        ))}

                        {/* Pagination controls */}
                        <div className="d-flex justify-content-center mt-3">
                          <Pagination size="sm">
                            <Pagination.First
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                            />
                            <Pagination.Prev
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                            />

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .slice(
                                Math.max(0, currentPage - 3),
                                Math.min(totalPages, currentPage + 2)
                              )
                              .map((p) => (
                                <Pagination.Item
                                  key={p}
                                  active={p === currentPage}
                                  onClick={() => setCurrentPage(p)}
                                >
                                  {p}
                                </Pagination.Item>
                              ))}

                            <Pagination.Next
                              onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                              }
                              disabled={currentPage === totalPages}
                            />
                            <Pagination.Last
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                            />
                          </Pagination>
                        </div>
                      </>
                    )}
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Profile;