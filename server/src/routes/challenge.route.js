import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendChallenge,
  getPendingChallenges,
  acceptChallenge,
  declineChallenge,
  getChallengeHistory,
} from "../controllers/challenge.controller.js";

const router = express.Router();


router.post("/send", protectRoute, sendChallenge);


router.get("/pending", protectRoute, getPendingChallenges);


router.put("/:challengeId/accept", protectRoute, acceptChallenge);


router.put("/:challengeId/decline", protectRoute, declineChallenge);


router.get("/history", protectRoute, getChallengeHistory);

export default router;
