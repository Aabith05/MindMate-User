import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();

  // Allow public GET requests for listing/reading games without token,
  // but DO attach token for POST/PUT/etc (play endpoint).
  if (method === "get" && (url === "/games/all" || url.startsWith("/games/"))) {
    return config;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

export default API;