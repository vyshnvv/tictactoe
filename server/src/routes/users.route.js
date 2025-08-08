import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsers, getUserStats } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsers);
router.get("/stats", protectRoute, getUserStats);

export default router;
