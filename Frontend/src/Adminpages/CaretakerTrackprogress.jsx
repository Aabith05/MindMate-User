import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Badge } from "react-bootstrap";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TrackProgress = () => {
  const { color, theme } = useTheme();
  const isDark = theme === "dark";
  const [users, setUsers] = useState([]);
  const [todayProgress, setTodayProgress] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchProgressData = async () => {
      try {
        // ✅ Fetch all users and their progress (reuse profile logic)
        const res = await API.get("/auth/all-users");
        const allUsers = res.data || [];

        // Sort users by total points
        const sorted = allUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
        setUsers(sorted);

        // Extract today’s progress
        const today = new Date();
        const todayData = allUsers.map((user) => {
          const activities = user.activities || [];
          const todayPoints = activities
            .filter((a) => {
              const d = new Date(a.time);
              return (
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate()
              );
            })
            .reduce((sum, a) => sum + (a.points || 0), 0);

          return { name: user.name, points: todayPoints };
        });

        setTodayProgress(todayData);
      } catch (err) {
        console.error("Error fetching caretaker progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className={`fw-bold ${isDark ? "text-light" : "text-dark"}`}>
          Track Progress
        </h2>
        <p className={`${isDark ? "text-secondary" : "text-muted"}`}>
          Monitor your users’ improvement and engagement.
        </p>
      </div>

      <Row>
        {/* Leaderboard */}
        <Col md={6} className="mb-4">
          <Card
            className={`shadow-sm h-100 ${
              isDark ? "bg-dark text-light" : "bg-white text-dark"
            }`}
          >
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Trophy size={24} className="me-2 text-warning" />
                <h5 className="mb-0">Top Performing Users</h5>
              </div>

              {users.length > 0 ? (
                <Table
                  hover
                  responsive
                  bordered
                  className={`${
                    isDark
                      ? "table-dark table-striped"
                      : "table-light table-striped"
                  }`}
                >
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Total Points</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((user, index) => (
                      <tr key={user._id}>
                        <td>🏅 {index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.points || 0}</td>
                        <td>
                          <Badge bg="info">
                            {user.points >= 3000
                              ? "Gold"
                              : user.points >= 2000
                              ? "Silver"
                              : user.points >= 1000
                              ? "Bronze"
                              : "Newbie"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No user data found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Today's Progress Chart */}
        <Col md={6} className="mb-4">
          <Card
            className={`shadow-sm h-100 ${
              isDark ? "bg-dark text-light" : "bg-white text-dark"
            }`}
          >
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <TrendingUp size={24} className="me-2 text-success" />
                <h5 className="mb-0">Today's Progress</h5>
              </div>

              {todayProgress.length > 0 ? (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={todayProgress}>
                      <XAxis dataKey="name" stroke={isDark ? "#fff" : "#000"} />
                      <YAxis stroke={isDark ? "#fff" : "#000"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#333" : "#fff",
                          color: isDark ? "#fff" : "#000",
                        }}
                      />
                      <Bar dataKey="points" fill={accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p>No progress recorded for today.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary */}
      <Row>
        <Col>
          <Card
            className={`shadow-sm mt-3 ${
              isDark ? "bg-dark text-light" : "bg-white text-dark"
            }`}
          >
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Users size={24} className="me-2 text-primary" />
                <h5 className="mb-0">User Overview</h5>
              </div>

              <p>Total Users: <strong>{users.length}</strong></p>
              <p>
                Active Today:{" "}
                <strong>
                  {todayProgress.filter((u) => u.points > 0).length}
                </strong>
              </p>
              <p>
                Total Points (All Users):{" "}
                <strong>
                  {users.reduce((sum, u) => sum + (u.points || 0), 0)}
                </strong>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TrackProgress;
