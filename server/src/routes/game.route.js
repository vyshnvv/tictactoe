import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getGame,
  makeMove,
  getGameHistory,
} from "../controllers/game.controller.js";

const router = express.Router();


router.get("/history", protectRoute, getGameHistory);
router.get("/:gameId", protectRoute, getGame);
router.put("/:gameId/move", protectRoute, makeMove);

export default router;
