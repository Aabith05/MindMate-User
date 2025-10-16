import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api";
import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  Users,
  Trophy,
  Target,
  Heart,
  Settings,
  Info,
} from "lucide-react";
import { useTheme } from "../Context/ThemeContext";

const GameDetail = () => {
  const { gameId } = useParams();
  const { theme } = useTheme();
  const [gameInfo, setGameInfo] = useState(null);
  const navigate = useNavigate();

  const bgPage = theme === "dark" ? "bg-dark text-light" : "bg-light text-dark";
  const cardBg =
    theme === "dark" ? "bg-secondary text-light" : "bg-white text-dark";
  const mutedText = theme === "dark" ? "text-light opacity-75" : "text-muted";
  const borderClass = theme === "dark" ? "border-light" : "border";

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        const response = await API.get(`/games/${gameId}`);
        setGameInfo(response.data);
      } catch (error) {
        console.error("Error fetching game info:", error);
        setGameInfo(null);
      }
    };
    fetchGameInfo();
  }, [gameId]);

  const startGame = () => {
    navigate(`/play/${gameId}`, { state: { gameInfo } });
  };

  if (!gameInfo) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${bgPage}`}>
        <div>
          <div className="display-1 mb-4">🎮</div>
          <h2 className="fw-bold mb-3">Game Not Found</h2>
          <p className={mutedText}>Unable to load game details.</p>
          <Link to="/games" className="btn btn-outline-primary mt-3">
            <ArrowLeft size={18} className="me-2" />
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 ${bgPage}`}>
      <main className="container py-5">
        {/* Back Navigation */}
        <div className="mb-4">
          <Link
            to="/games"
            className="btn btn-outline-primary d-inline-flex align-items-center"
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Games
          </Link>
        </div>

        {/* Game Detail Card */}
        <div className={`card shadow-lg border-0 ${cardBg}`}>
          <div className="card-body text-center p-5">
            {/* Game Icon */}
            <div className="display-1 mb-4">🎮</div>

            {/* Game Title */}
            <h1 className="fw-bold text-primary mb-3">{gameInfo.title}</h1>

            <p className={`${mutedText} mb-5`}>
              {gameInfo.description}
            </p>

            {/* Features */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div
                  className={`${cardBg} ${borderClass} rounded-4 p-4 shadow-sm h-100`}
                >
                  <Target className="text-primary mb-3" size={32} />
                  <h5 className="fw-semibold">Cognitive Training</h5>
                  <p className={`${mutedText} small`}>
                    Designed by specialists to improve specific cognitive skills
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  className={`${cardBg} ${borderClass} rounded-4 p-4 shadow-sm h-100`}
                >
                  <Trophy className="text-warning mb-3" size={32} />
                  <h5 className="fw-semibold">Progress Tracking</h5>
                  <p className={`${mutedText} small`}>
                    Monitor your improvement over time with detailed analytics
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  className={`${cardBg} ${borderClass} rounded-4 p-4 shadow-sm h-100`}
                >
                  <Heart className="text-danger mb-3" size={32} />
                  <h5 className="fw-semibold">Adaptive Difficulty</h5>
                  <p className={`${mutedText} small`}>
                    Games adjust to your skill level for optimal challenge
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="d-flex justify-content-center gap-4 mb-5">
              <div className="d-flex align-items-center">
                <Star className="text-warning me-2" size={18} />
                <span className="fw-medium">{gameInfo.rating}</span>
              </div>
              <div className="d-flex align-items-center">
                <Clock className="text-secondary me-2" size={18} />
                <span className="fw-medium">{gameInfo.duration || "10–15 mins"}</span>
              </div>
              
            </div>

            {/* Buttons */}
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
              <button
                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
                onClick={startGame}
              >
                <Play size={20} className="me-2" /> Start Game
              </button>
              <button className="btn btn-outline-secondary btn-lg d-flex align-items-center justify-content-center">
                <Settings size={20} className="me-2" /> Game Settings
              </button>
              <button className="btn btn-outline-info btn-lg d-flex align-items-center justify-content-center">
                <Info size={20} className="me-2" /> How to Play
              </button>
            </div>

            {/* Coming Soon Notice */}
            <div
              className={`alert alert-warning ${borderClass} rounded-3`}
              role="alert"
            >
              <span className="badge bg-warning text-dark mb-2">
                Coming Soon
              </span>
              <p className={`${mutedText} small mb-0`}>
                This game is currently under development. Interactive gameplay
                will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetail;