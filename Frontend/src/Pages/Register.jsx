import React, { useState } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const bgClass = theme === "dark" ? "bg-dark text-light" : "bg-light text-dark";
  const cardBg = theme === "dark" ? "bg-secondary text-light" : "bg-white text-dark";

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      if (res.data.success) {
        localStorage.setItem("registered", "true");
        toast.success("Registered successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
      }
    } catch {
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${bgClass}`}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`d-flex justify-content-center align-items-center min-vh-100 ${bgClass}`}>
      <div className={`card shadow-lg p-4 ${cardBg}`} style={{ width: "400px" }}>
        <h2 className="text-center mb-4 fw-bold">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
        <p className="text-center text-muted mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-decoration-none">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;