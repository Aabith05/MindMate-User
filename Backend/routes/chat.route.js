import express from "express";
import { getMessages, getUsers } from "../controllers/chat.controller.js";
import auth from "../middleware/auth.js";

const chatRouter = express.Router();

// Only fetching users and messages via REST
chatRouter.get("/users", auth, getUsers);
chatRouter.get("/messages/:userId", auth, getMessages);

export default chatRouter;
