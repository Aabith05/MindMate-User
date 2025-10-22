// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Layout from "./Component/Layout";
// import Home from "./Pages/Home";
// import Games from "./Pages/Games";
// import Chat from "./Pages/Chat";
// import CallCaretaker from "./Pages/Callcaretaker";
// import GamePlay from "./Pages/GamePlay";
// import Contact from "./Pages/Contact";
// import Settings from "./Pages/Settings";
// import Profile from "./Pages/Profile";
// import Login from "./Pages/Login";
// import Register from "./Pages/Register";
// import NotFound from "./Pages/Notfound";
// import ProtectedRoute from "./Pages/ProtectedRoute";
// import PublicRoute from "./Pages/PublicRoute";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import { ToastContainer } from "react-toastify";
// import { ThemeProvider } from "./Context/ThemeContext";
// import "react-toastify/dist/ReactToastify.css";
// import Carehome from "./Adminpages/CaretakerHome";
// import Carechat from "./Adminpages/CaretakerChat";
// import Carecontact from "./Adminpages/CaretakerContact";
// import Careprofile from "./Adminpages/CaretakerProfile";
// import Caresettings from "./Adminpages/CaretakerSettings";
// import CareTrackprogress from "./Adminpages/CaretakerTrackprogress";

// function App() {
//   const ClientId = import.meta.env.VITE_CLIENT_ID;

//   return (
//     <ThemeProvider>
//       <Router>
//         <GoogleOAuthProvider clientId={ClientId}>
//           <ToastContainer />
//           <Routes>

//             {/* Public routes → only accessible when NOT logged in */}
//             <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
//             <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//             <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

//             {/* Protected routes → accessible ONLY when logged in */}
//             <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//               <Route path="/home" element={<Home />} />
//               <Route path="/games" element={<Games />} />
//               <Route path="/chat" element={<Chat />} />
//               <Route path="/call" element={<CallCaretaker />} />
//               <Route path="/contact" element={<Contact />} />
//               <Route path="/settings" element={<Settings />} />
//               <Route path="/profile" element={<Profile />} />
//               <Route path="/play/:gameId" element={<GamePlay />} />



//               <Route path="/carehome" element={<Carehome />} />
//               <Route path="/careprofile" element={<Careprofile />} />
//               <Route path="/carechat" element={<Carechat/>} />
//               <Route path="/carecontact" element={<Carecontact />} />
//               <Route path="/caresettings" element={<Caresettings />} />
//               <Route path="/caretrackprogress" element={<CareTrackprogress />} />
//             </Route>

//             {/* Fallback route */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </GoogleOAuthProvider>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./Context/ThemeContext";
import "react-toastify/dist/ReactToastify.css";

// User components
import Layout from "./Component/Layout";
import Home from "./Pages/Home";
import Games from "./Pages/Games";
import Chat from "./Pages/Chat";
import CallCaretaker from "./Pages/Callcaretaker";
import GamePlay from "./Pages/GamePlay";
import Contact from "./Pages/Contact";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import NotFound from "./Pages/Notfound";
import ProtectedRoute from "./Pages/ProtectedRoute";
import PublicRoute from "./Pages/PublicRoute";

// Caretaker components
import CaretakerLayout from "./Component/CaretakerLayout";
import CaretakerLogin from "./Adminpages/CaretakerLogin";
import Carehome from "./Adminpages/CaretakerHome";
import Carechat from "./Adminpages/CaretakerChat";
import Carecontact from "./Adminpages/CaretakerContact";
import Careprofile from "./Adminpages/CaretakerProfile";
import Caresettings from "./Adminpages/CaretakerSettings";
import CareTrackprogress from "./Adminpages/CaretakerTrackprogress";

function App() {
  const ClientId = import.meta.env.VITE_CLIENT_ID;

  return (
    <ThemeProvider>
      <Router>
        <GoogleOAuthProvider clientId={ClientId}>
          <ToastContainer />
          <Routes>

            {/* ---------------------- USER ROUTES ---------------------- */}
            {/* Public routes (only when not logged in as USER) */}
            <Route
              path="/"
              element={
                <PublicRoute type="user">
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute type="user">
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute type="user">
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes (only when logged in as USER) */}
            <Route
              element={
                <ProtectedRoute type="user">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/call" element={<CallCaretaker />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/play/:gameId" element={<GamePlay />} />
            </Route>

            {/* -------------------- CARETAKER ROUTES -------------------- */}
            {/* Caretaker Public route */}
            <Route
              path="/caretaker-login"
              element={
                <PublicRoute type="caretaker">
                  <CaretakerLogin />
                </PublicRoute>
              }
            />

            {/* Caretaker Protected routes */}
            <Route
              element={
                <ProtectedRoute type="caretaker">
                  <CaretakerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/caretaker/home" element={<Carehome />} />
              <Route path="/caretaker/chat" element={<Carechat />} />
              <Route path="/caretaker/contact" element={<Carecontact />} />
              <Route path="/caretaker/profile" element={<Careprofile />} />
              <Route path="/caretaker/settings" element={<Caresettings />} />
              <Route
                path="/caretaker/trackprogress"
                element={<CareTrackprogress />}
              />
            </Route>

            {/* ---------------------- FALLBACK ---------------------- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GoogleOAuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
