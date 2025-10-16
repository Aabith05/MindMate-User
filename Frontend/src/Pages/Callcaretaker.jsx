import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useTheme } from "../Context/ThemeContext"; // ✅ import theme
import "../App.css";
import API from "../api";

const CallCaretaker = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);

  const [caretakers, setCaretakers] = useState([]);
  useEffect(() => {
    API.get("/caretaker").then((res) => setCaretakers(res.data));
  }, []);

  // ✅ get accent color
  const { color } = useTheme();
  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const accent = colorMap[color] || "#3b82f6";

  const getStatusVariant = (status) => {
    switch (status) {
      case "Available":
        return "success";
      case "In Session":
        return "secondary";
      case "Offline":
        return "dark";
      default:
        return "light";
    }
  };

  const startCall = (caretakerId) => {
    setSelectedCaretaker(caretakerId);
    setIsInCall(true);
    setCallDuration(0);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    setIsInCall(false);
    setSelectedCaretaker(null);
    setCallDuration(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isInCall && selectedCaretaker) {
    const caretaker = caretakers.find((c) => c.id === selectedCaretaker);

    return (
      <Container className="mt-5 text-center">
        <h2 className="mb-4">In Call with {caretaker?.name}</h2>
        <p className="text-muted">{caretaker?.role}</p>
        <Badge bg="success" className="mb-3">
          Connected
        </Badge>
        <div className="mb-3">
          <h4>{formatTime(callDuration)}</h4>
          <p>Call in progress...</p>
        </div>
        <div className="bg-light border rounded p-5 mb-4">
          <p className="text-muted">📹 Video Area</p>
        </div>
        <Button variant="danger" size="lg" className="me-3" onClick={endCall}>
          End Call
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, #fff 60%, #fce7f3 100%)",
          position: "relative",
          padding: "80px 0",
        }}
      >
        <Container>
          <Row className="align-items-center">
            {/* Left Content */}
            <Col md={6}>
              <h1 className="fw-bold mb-3" style={{ color: "#be123c" }}>
                Connect with <br /> Your Caretaker
              </h1>
              <p className="text-muted mb-4">
                Get personalized support from our experienced team of
                specialists
              </p>
              <div className="d-flex gap-3">
                {/* 🚨 Emergency button stays red */}
                <Button
                  variant="danger"
                  size="lg"
                  style={{
                    background: "#dc2626",
                    border: "none",
                  }}
                >
                  🚨 Emergency Call
                </Button>

                {/* Cancel button stays gray */}
                <Button size="lg" className="btn-accent-light">
                  Cancel
                </Button>
              </div>
            </Col>

            {/* Right Illustration */}
            <Col md={6} className="text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2966/2966486.png"
                alt="Support Kit"
                className="img-fluid"
                style={{ maxHeight: "280px" }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Caretaker List */}
      <Container className="my-5">
        <Row>
          {caretakers.map((caretaker) => (
            <Col md={4} key={caretaker.id} className="mb-4">
              <Card className="shadow-sm h-100 rounded-4 border-0">
                <Card.Body className="text-center">
                  <div
                    className="rounded-circle text-white mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 70,
                      height: 70,
                      fontSize: 20,
                      background: accent,
                    }}
                  >
                    {caretaker.initials}
                  </div>
                  <Card.Title>{caretaker.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {caretaker.role}
                  </Card.Subtitle>
                  <Badge bg={getStatusVariant(caretaker.status)}>
                    {caretaker.status}
                  </Badge>
                  <div className="mt-3 text-start">
                    <p>
                      <strong>Experience:</strong> {caretaker.experience}
                    </p>
                    <p>
                      <strong>Rating:</strong> ⭐ {caretaker.rating}
                    </p>
                    <p>
                      <strong>Specialties:</strong>
                    </p>
                    <ul className="small">
                      {caretaker.specialties.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Buttons with accent outline + hover effect */}
                  <Button className="w-100 mt-2 btn-accent-outline">
                    📹 Video Call
                  </Button>

                  <Button className="w-100 mt-2 btn-accent-outline">
                    📞 Voice Call
                  </Button>

                  <Button className="w-100 mt-2 btn-accent-outline">
                    💬 Message
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default CallCaretaker;
