import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Play } from "lucide-react";
import { Offcanvas, Badge } from "react-bootstrap";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const Games = () => {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeGame, setActiveGame] = useState(null);

  const { color, theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "text-white" : "text-dark";
  const textSecondary = isDark ? "text-white-50" : "text-muted";

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await API.get("/games/all");
        setGames(res.data);
      } catch (err) {
        setGames([]);
      }
    };
    fetchGames();
  }, []);

  const handleShow = (game) => {
    setActiveGame(game);
    setShowDetails(true);
  };

  const handleClose = () => setShowDetails(false);

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-vh-100 ${isDark ? "bg-dark" : "bg-light"}`}>
      <main className="container py-5">
        <div className="text-center mb-5">
          <h1
            className={`fw-bold display-5 mb-3 ${textPrimary}`}
            style={{ color }}
          >
            🎮 Cognitive Development Games
          </h1>
          <p className={`fs-5 ${textSecondary}`}>
            Discover engaging games designed to sharpen memory, focus, and logic
          </p>
        </div>

        {/* Search Bar */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <div className="input-group shadow-sm rounded">
              <span className="input-group-text bg-white">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="row g-4">
          {filteredGames.map((game) => (
            <div key={game.id} className="col-md-6 col-lg-4">
              <div
                className={`card h-100 border-0 shadow-sm rounded-4 cursor-pointer ${
                  isDark ? "bg-black" : "bg-white"
                }`}
                onClick={() => handleShow(game)}
                style={{ transition: "all 0.3s" }}
              >
                <div className="card-body text-center d-flex flex-column">
                  <div className="display-3 mb-3">
                    {game.imageurl ? (
                      <img
                        src={game.imageurl}
                        alt={game.title}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    ) : (
                      "🎮"
                    )}
                  </div>
                  <h5 className={`fw-bold mb-1 ${textPrimary}`}>
                    {game.title}
                  </h5>
                  <Badge style={{ backgroundColor: color }} className="mb-2">
                    {game.category || "General"}
                  </Badge>
                  <p className={`small flex-grow-1 ${textSecondary}`}>
                    {game.description?.substring(0, 80)}...
                  </p>
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`me-1 ${
                          i < Math.round(game.rating)
                            ? "text-warning"
                            : "text-muted"
                        }`}
                        fill={i < Math.round(game.rating) ? "gold" : "none"}
                      />
                    ))}
                  </div>
                  <span className={`small ${textSecondary}`}>
                    {game.duration || ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredGames.length === 0 && (
          <div className="text-center py-5">
            <div className="display-4 mb-3">🎮</div>
            <h5 className={`fw-bold ${textPrimary}`}>No games found</h5>
            <p className={textSecondary}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Offcanvas Game Details */}
        <Offcanvas
          show={showDetails}
          onHide={handleClose}
          placement="end"
          className="shadow-lg"
        >
          <Offcanvas.Header
            closeButton
            style={{ background: color, color: "#fff" }}
          >
            <Offcanvas.Title className="fw-bold">
              {activeGame?.title}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body
            className={isDark ? "bg-dark text-white" : "bg-light text-dark"}
          >
            {activeGame && (
              <div>
                <div className="display-3 text-center mb-3">
                  {activeGame.imageurl ? (
                    <img
                      src={activeGame.imageurl}
                      alt={activeGame.title}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  ) : (
                    "🎮"
                  )}
                </div>
                <p>{activeGame.description}</p>
                <p>
                  <strong>Category:</strong> {activeGame.category || "General"}
                </p>
                <p>
                  <strong>Difficulty:</strong> {activeGame.difficulty || "N/A"}
                </p>
                <p>
                  <strong>Duration:</strong> {activeGame.duration || "N/A"}
                </p>
                <div className="d-flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`me-1 ${
                        i < Math.round(activeGame.rating)
                          ? "text-warning"
                          : "text-muted"
                      }`}
                      fill={i < Math.round(activeGame.rating) ? "gold" : "none"}
                    />
                  ))}
                  <span className="ms-2 fw-bold">{activeGame.rating}</span>
                </div>
                <Link
                  to={`/game/${activeGame.id}`}
                  className="btn w-100 rounded-pill fw-semibold"
                  style={{
                    background: color,
                    color: "#fff",
                    border: `2px solid ${color}`,
                    transition: "0.3s",
                  }}
                >
                  <Play size={18} className="me-2" />
                  Play Now
                </Link>
              </div>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      </main>
    </div>
  );
};

export default Games;
