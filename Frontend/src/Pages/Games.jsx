import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Play, Info } from "lucide-react";
import { Offcanvas, Badge, Button, Collapse } from "react-bootstrap";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDetails, setShowDetails] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);

  const { color, theme } = useTheme();
  const isDark = theme === "dark";

  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const chosenColor = colorMap[color] || color || "#3b82f6";

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get("/games/all"); // backend source only
        setGames(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Unable to load games from server.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const categories = ["All", ...Array.from(new Set(games.map((g) => g.category).filter(Boolean)))];

  const handleShow = (game) => {
    setActiveGame(game);
    setShowHowTo(false);
    setShowDetails(true);
  };
  const handleClose = () => setShowDetails(false);

  const filteredGames = games.filter((game) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (game.title && game.title.toLowerCase().includes(term)) ||
      (game.description && game.description.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // parse steps strictly using '.' as separator, using backend-provided activeGame.howTo
  const parseSteps = (text) => {
    if (!text) return [];
    return text
      .split(".")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const steps = parseSteps(activeGame?.howTo);

  return (
    <div className={`min-vh-100 ${isDark ? "bg-dark" : "bg-light"}`}>
      <main className="container py-5">
        <div className="text-center mb-5">
          <h1 className={`fw-bold display-5 mb-3 ${isDark ? "text-white" : "text-dark"}`} style={{ color: chosenColor }}>
            🎮 Cognitive Development Games
          </h1>
          <p className={`fs-5 ${isDark ? "text-white-50" : "text-muted"}`}>
            Discover engaging games designed to sharpen memory, focus, and logic
          </p>
        </div>

        <div className="row justify-content-center mb-4">
          <div className="col-md-8 d-flex gap-3 align-items-center">
            <div className="flex-grow-1">
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

            <div className="d-flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm fw-semibold rounded-pill ${selectedCategory === cat ? "btn-primary text-white" : "btn-outline-primary"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" style={{ color: chosenColor }} />
            <p className="mt-3">Loading games...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-5">
            <div className="display-4 mb-3">🎮</div>
            <h5 className="fw-bold">{error}</h5>
            <p className={isDark ? "text-white-50" : "text-muted"}>Please check your backend or try again later.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredGames.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-4 mb-3">🎮</div>
                <h5 className="fw-bold">No games found</h5>
                <p className={isDark ? "text-white-50" : "text-muted"}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredGames.map((game, idx) => {
                  const id = game.id ?? game._id ?? String(idx + 1);
                  return (
                    <div key={id} className="col-md-6 col-lg-4">
                      <div
                        className={`card h-100 border-0 shadow-sm rounded-4 cursor-pointer ${isDark ? "bg-black text-light" : "bg-white text-dark"}`}
                        onClick={() => handleShow(game)}
                        style={{ transition: "all 0.3s" }}
                      >
                        <div className="card-body text-center d-flex flex-column">
                          <div className="display-3 mb-3">
                            {game.imageurl ? (
                              <img src={game.imageurl} alt={game.title} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12 }} />
                            ) : (
                              "🎮"
                            )}
                          </div>
                          <h5 className="fw-bold mb-1">{game.title}</h5>
                          <Badge style={{ backgroundColor: chosenColor }} className="mb-2">
                            {game.category || "General"}
                          </Badge>
                          <p className={`small flex-grow-1 ${isDark ? "text-white-50" : "text-muted"}`}>
                            {game.description ? `${game.description.substring(0, 80)}...` : ""}
                          </p>
                          <div className="d-flex justify-content-center align-items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={16} className={`me-1 ${i < Math.round(game.rating || 0) ? "text-warning" : "text-muted"}`} />
                            ))}
                          </div>
                          <span className={`small ${isDark ? "text-white-50" : "text-muted"}`}>{game.duration || ""}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <Offcanvas show={showDetails} onHide={handleClose} placement="end" className="shadow-lg">
          <Offcanvas.Header closeButton style={{ background: chosenColor, color: "#fff" }}>
            <Offcanvas.Title className="fw-bold">{activeGame?.title}</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className={isDark ? "bg-dark text-white" : "bg-light text-dark"}>
            {activeGame && (
              <div>
                <div className="text-center mb-3">
                  {activeGame.imageurl ? (
                    <img src={activeGame.imageurl} alt={activeGame.title} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 12 }} />
                  ) : (
                    <div style={{ fontSize: 48 }}>🎮</div>
                  )}
                </div>

                <p>{activeGame.description}</p>
                <p><strong>Category:</strong> {activeGame.category || "General"}</p>
                <p><strong>Difficulty:</strong> {activeGame.difficulty || "N/A"}</p>
                <p><strong>Duration:</strong> {activeGame.duration || "N/A"}</p>

                <div className="d-flex mb-3 align-items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={`me-1 ${i < Math.round(activeGame.rating || 0) ? "text-warning" : "text-muted"}`} />
                  ))}
                  <span className="ms-2 fw-bold">{activeGame.rating ?? "0"}</span>
                </div>

                {/* HOW TO PLAY shown inside Offcanvas, steps come from backend and are split by '.' */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">How to Play</h6>
                    <Button variant="outline-secondary" size="sm" onClick={() => setShowHowTo((s) => !s)}>
                      <Info size={14} /> {showHowTo ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <Collapse in={showHowTo}>
                    <div style={{ whiteSpace: "pre-wrap", background: isDark ? "#0b1220" : "#f8f9fa", padding: "0.75rem", borderRadius: 6 }}>
                      {steps.length === 0 ? (
                        <div className="text-muted">No how-to steps available.</div>
                      ) : (
                        <ol style={{ paddingLeft: 18, margin: 0 }}>
                          {steps.map((step, i) => (
                            <li key={i} style={{ marginBottom: 8 }}>{step}.</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </Collapse>
                </div>

                {/* Play Now navigates to GamePlay (no GameDetail) and passes gameInfo in state */}
                <Link
                  to={`/play/${activeGame.id ?? activeGame._id}`}
                  state={{ gameInfo: {...activeGame,startTime: new Date().toISOString()} }}
                  className="btn w-100 rounded-pill fw-semibold"
                  style={{ background: chosenColor, color: "#fff", border: `2px solid ${chosenColor}`, transition: "0.3s" }}
                >
                  <Play size={18} className="me-2" /> Play Now
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