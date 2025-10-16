import express from "express";
import gamesController from "../controllers/games.controller.js";
import auth from "../middleware/auth.js";
const gamesrouter = express.Router();

gamesrouter.get("/all",gamesController.getAllGames);
gamesrouter.get("/:id",gamesController.getGameById);
export default gamesrouter;
