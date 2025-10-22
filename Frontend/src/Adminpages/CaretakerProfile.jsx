import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Tabs,
  Tab,
  Pagination,
} from "react-bootstrap";
import { Trophy, TrendingUp, Users, Award, Activity } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const PAGE_SIZE = 10;

const CaretakerProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { color, theme } = useTheme();
  const isDark = theme === "dark";

  const [caretaker, setCaretaker] = useState({
    name: "",
    photo: "",
    email: "",
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalPoints: 0,
    activities: [],
  });

  const [todayCounts, setTodayCounts] = useState({
    sessions: 0,
    points: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const accent = colorMap[color] || "#3b82f6";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCaretaker(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchCaretakerStats = async () => {
      try {
        const res = await API.get("/auth/caretaker/stats");
        const data = res.data || {};
        setStats(data);
      } catch (err) {
        console.error("Error fetching caretaker stats:", err);
      }
    };
    fetchCaretakerStats();
  }, []);

  useEffect(() => {
    computeTodayCounts(stats.activities || []);
  }, [stats.activities]);

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
    let sessions = 0,
      points = 0;
    activities.forEach((a) => {
      if (!a) return;
      if (isToday(a.time)) {
        points += Number(a.points || 0);
        sessions++;
      }
    });
    setTodayCounts({ sessions, points });
  };

  const overallActivities = stats.activities ? [...stats.activities] : [];
  const todayActivities = overallActivities.filter((a) => isToday(a.time));

  const totalPages = Math.max(1, Math.ceil(overallActivities.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [overallActivities.length, totalPages, currentPage]);

  const pagedOverall = overallActivities
    .slice()
    .reverse()
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalSessions = stats.totalSessions || 0;

  const achievement =
    totalSessions >= 100
      ? {
          title: "Specialist Badge",
          emoji: "🏅",
          color: "#FFD700",
          desc: "Awarded for managing users over 100 times with dedication and consistency.",
        }
      : null;

  return (
    <Container
      fluid
      className={`py-5 min-vh-100 ${isDark ? "bg-dark text-light" : "bg-light text-dark"}`}
    >
      {/* Caretaker Header */}
      <Card
        className={`mb-4 shadow-sm ${
          isDark ? "bg-black text-light" : "bg-white text-dark"
        }`}
      >
        <Card.Body>
          <Row className="align-items-center text-center text-md-start">
            <Col
              md={4}
              className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start"
            >
              {caretaker.photo ? (
                <img
                  src={caretaker.photo}
                  alt="Caretaker"
                  className="rounded-circle mb-3 mb-md-0"
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: "cover",
                    border: `3px solid ${accent}`,
                  }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3 mb-md-0"
                  style={{
                    width: 90,
                    height: 90,
                    fontSize: "2rem",
                    background: accent,
                    color: "#fff",
                    border: `3px solid ${isDark ? "#444" : "#ddd"}`,
                  }}
                >
                  {caretaker.name ? caretaker.name[0] : "?"}
                </div>
              )}

              <div className="ms-md-3 text-center text-md-start">
                <h3 className="fw-bold mb-1">
                  {caretaker.name || "Unnamed Caretaker"}
                </h3>
                <p
                  className={`mb-1 ${
                    isDark ? "text-light-emphasis" : "text-muted"
                  }`}
                >
                  {caretaker.email}
                </p>
                <Badge bg="success">Active</Badge>
              </div>
            </Col>

            {/* Caretaker Stats */}
            {[
              { label: "Total Users Managed", value: stats.totalUsers },
              { label: "Total Sessions", value: stats.totalSessions },
              { label: "Today's Sessions", value: todayCounts.sessions },
              { label: "Today's Points", value: todayCounts.points },
            ].map((item, i) => (
              <Col xs={6} md={2} className="text-center mt-3 mt-md-0" key={i}>
                <h4 style={{ color: accent }}>{item.value || 0}</h4>
                <p
                  className="mb-1"
                  style={{
                    color: isDark ? "#cbd5e1" : "#6c757d",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </p>
              </Col>
            ))}
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
        <Tab eventKey="overview" title="Overview" />
        <Tab eventKey="activity" title="Activity" />
      </Tabs>

      {/* Overview Section */}
      {activeTab === "overview" && (
        <Row>
          <Col md={6}>
            <Card
              className={`mb-4 ${
                isDark ? "bg-secondary text-light" : "bg-white text-dark"
              } shadow-sm`}
            >
              <Card.Header
                className={`fw-bold ${
                  isDark ? "bg-dark text-light" : "bg-light text-dark"
                }`}
              >
                <Trophy
                  size={18}
                  className="me-2"
                  style={{ color: accent }}
                />{" "}
                Achievements
              </Card.Header>
              <Card.Body>
                {achievement ? (
                  <div
                    className="d-flex flex-column flex-sm-row align-items-sm-center align-items-start mb-3 p-3 rounded"
                    style={{
                      background: isDark ? "#1e293b" : "#f1f3f5",
                      color: isDark ? "#f8fafc" : "#212529",
                      gap: "0.5rem",
                    }}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <Award
                        className="me-3"
                        size={28}
                        style={{ color: achievement.color }}
                      />
                      <div>
                        <h6 className="mb-0">
                          {achievement.emoji} {achievement.title}
                        </h6>
                        <p
                          className="small mb-0"
                          style={{
                            color: isDark ? "#94a3b8" : "#6c757d",
                          }}
                        >
                          {achievement.desc}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="align-self-start align-self-sm-center"
                      style={{
                        background: achievement.color,
                        fontSize: "0.85rem",
                        padding: "0.4rem 0.6rem",
                      }}
                    >
                      {totalSessions} sessions
                    </Badge>
                  </div>
                ) : (
                  <p
                    className="text-center m-0 py-3 fw-semibold"
                    style={{
                      color: isDark ? "#9ca3af" : "#6c757d",
                    }}
                  >
                    No achievements yet. Keep managing users consistently to
                    earn badges!
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card
              className={`mb-4 ${
                isDark ? "bg-secondary text-light" : "bg-white text-dark"
              } shadow-sm`}
            >
              <Card.Header
                className={`fw-bold ${
                  isDark ? "bg-dark text-light" : "bg-light text-dark"
                }`}
              >
                <TrendingUp
                  size={18}
                  className="me-2"
                  style={{ color: accent }}
                />{" "}
                Activity Summary
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <Users size={16} className="me-2" /> Total Users Managed:{" "}
                  <strong>{stats.totalUsers}</strong>{" "}
                  <span style={{ color: accent }}>
                    ({todayCounts.sessions} today)
                  </span>
                </p>
                <p className="mb-2">
                  <Activity size={16} className="me-2" /> Total Sessions:{" "}
                  <strong>{stats.totalSessions}</strong>
                </p>
                <p className="mb-0">
                  Total Points: <strong>{stats.totalPoints}</strong>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Activity Section */}
      {activeTab === "activity" && (
        <Row>
          <Col>
            <Card
              className={`mb-4 ${
                isDark ? "bg-secondary text-light" : "bg-white text-dark"
              } shadow-sm`}
            >
              <Card.Body>
                <Tabs defaultActiveKey="today" id="activity-subtabs" className="mb-3">
                  <Tab eventKey="today" title={`Today (${todayActivities.length})`}>
                    {todayActivities.length > 0 ? (
                      todayActivities
                        .slice()
                        .reverse()
                        .map((a, idx) => (
                          <div key={idx} className="d-flex align-items-center mb-3">
                            <div style={{ width: 40 }}>👥</div>
                            <div>
                              <h6 className="mb-0">{a.title || "User Assistance Session"}</h6>
                              <p className="small text-muted mb-0">
                                {new Date(a.time).toLocaleString()}
                              </p>
                            </div>
                            {a.points > 0 && (
                              <Badge style={{ background: accent }} className="ms-auto">
                                +{a.points} pts
                              </Badge>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-muted">No sessions today.</p>
                    )}
                  </Tab>

                  <Tab eventKey="overall" title={`Overall (${overallActivities.length})`}>
                    {overallActivities.length === 0 ? (
                      <p className="text-muted">No activity yet.</p>
                    ) : (
                      <>
                        {pagedOverall.map((a, idx) => (
                          <div key={idx} className="d-flex align-items-center mb-3">
                            <div style={{ width: 40 }}>🧠</div>
                            <div>
                              <h6 className="mb-0">{a.title || "User Support Session"}</h6>
                              <p className="small text-muted mb-0">
                                {new Date(a.time).toLocaleString()}
                              </p>
                            </div>
                            {a.points > 0 && (
                              <Badge style={{ background: accent }} className="ms-auto">
                                +{a.points} pts
                              </Badge>
                            )}
                          </div>
                        ))}

                        <div className="d-flex justify-content-center mt-3">
                          <Pagination size="sm">
                            <Pagination.First
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                            />
                            <Pagination.Prev
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default CaretakerProfile;
