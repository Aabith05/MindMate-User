import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Component/Layout";
import Home from "./Pages/Home";
import Games from "./Pages/Games";
import Chat from "./Pages/Chat";
import CallCaretaker from "./Pages/Callcaretaker";
import GamePlay from "./Pages/GamePlay";
import Contact from "./Pages/Contact";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import GameDetail from "./Pages/Gamedetail";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import NotFound from "./Pages/Notfound";
import { ThemeProvider } from "./Context/ThemeContext";

function App() {
  const ClientId = import.meta.env.VITE_CLIENT_ID;
  return (
    <ThemeProvider>
      <Router>
        <GoogleOAuthProvider clientId={ClientId}>
          <ToastContainer />
          <Routes>
            {/* Login and Register NOT inside Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* All other routes inside Layout */}
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/game/:gameId" element={<GameDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/call" element={<CallCaretaker />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/play/:gameId" element={<GamePlay />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </GoogleOAuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;