import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((config) => {
   if (
    config.url.startsWith("/games/all") ||
    config.url.startsWith("/games/")
  ) {
    // Do NOT add token for public games endpoints
    return config;
  }
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
