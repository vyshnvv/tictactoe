import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import gameRoutes from "./routes/game.route.js";
import challengeRoutes from "./routes/challenge.route.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js"; // Import both app and server

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);


app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/challenges", challengeRoutes);

server.listen(PORT, () => {
  console.log("running on port: " + PORT);
  connectDB();
});
