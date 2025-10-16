import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const GamePlay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameInfo } = location.state || {};

  if (!gameInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light">
        <p>Game info not found.</p>
        <button className="btn btn-primary ms-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="me-2" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark" style={{ zIndex: 9999 }}>
      <button
        className="btn btn-light position-absolute m-3"
        style={{ zIndex: 10000 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="me-2" /> Go Back
      </button>
      <iframe
        src={gameInfo.link}
        title={gameInfo.title}
        frameBorder="0"
        scrolling="no"
        width="100%"
        height="100%"
        style={{ border: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default GamePlay;