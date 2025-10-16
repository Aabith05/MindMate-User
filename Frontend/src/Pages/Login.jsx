import React, { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Mosaic } from "react-loading-indicators";
import API from "../api";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // <-- Get theme

  // Theme-based classes
  const bgClass = theme === "dark" ? "bg-dark text-light" : "bg-light text-dark";
  const cardBg = theme === "dark" ? "bg-secondary text-light" : "bg-white text-dark";

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  useEffect(() => {
    if (localStorage.getItem("registered") === "true") {
      toast.success("Registered successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      localStorage.removeItem("registered");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", { name, email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/home");
      }
    } catch {
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${bgClass}`}>
        <Mosaic color="#6c757d" size="medium" text="Loading..." textColor="" />
      </div>
    );
  }

  return (
    <div className={`d-flex justify-content-center align-items-center min-vh-100 ${bgClass}`}>
      <div className={`card shadow-lg p-4 ${cardBg}`} style={{ width: "400px" }}>
        <h2 className="text-center mb-4 fw-bold">Login</h2>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
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
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted">OR</span>
          <hr className="flex-grow-1" />
        </div>

        {/* Google Login */}
        <div className="d-flex justify-content-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              const email = decoded.email;
              try {
                const res = await API.post("/auth/googleRegister", { email });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/home");
              } catch (err) {
                alert("Google Registration failed");
              }
            }}
            onError={() => alert("Google Login Failed")}
          />
        </div>

        {/* Signup link */}
        <p className="text-center text-muted mt-3">
          Don’t have an account?{" "}
          <a href="/register" onClick={handleRegister} className="text-decoration-none">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;