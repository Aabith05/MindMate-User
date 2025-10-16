import express from "express";
import authController from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";
import User from "../models/User.model.js";

const authrouter = express.Router();

authrouter.post("/register", authController.register);
authrouter.post("/login", authController.login);
authrouter.post("/googleRegister", authController.googleRegister);
authrouter.post("/changeUserName", auth, authController.changeUserName);
authrouter.post("/changePassword", auth, authController.changePassword);

// SETTINGS ENDPOINTS
authrouter.get("/settings", auth, authController.getSettings);
authrouter.put("/settings", auth, authController.updateSettings);

// Profiles
authrouter.get("/profile", auth, authController.getProfile);
authrouter.put("/profile", auth, authController.updateProfile);

export default authrouter;