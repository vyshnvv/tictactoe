import { Server } from "socket.io";
import http from "http";
import express from "express";
import Game from "../models/game.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});


const userSocketMap = {}; 

export function getReceiverSocketId(userId) {
  return userSocketMap[userId.toString()];
}


export function emitChallengeReceived(challengedUserId, challenge) {
  const socketId = userSocketMap[challengedUserId.toString()];
  console.log(
    "Emitting challengeReceived to user:",
    challengedUserId,
    "socketId:",
    socketId
  );
  if (socketId) {
    io.to(socketId).emit("challengeReceived", challenge);
  }
}

export function emitChallengeAccepted(
  challengerId,
  challengedId,
  challenge,
  gameId
) {
  const challengerSocketId = userSocketMap[challengerId.toString()];
  const challengedSocketId = userSocketMap[challengedId.toString()];

  console.log(
    "Emitting challengeAccepted - challenger:",
    challengerId,
    "challenged:",
    challengedId,
    "gameId:",
    gameId
  );
  console.log(
    "Challenger socketId:",
    challengerSocketId,
    "Challenged socketId:",
    challengedSocketId
  );

  const gameData = {
    challenge: challenge,
    gameId: gameId,
  };

  if (challengerSocketId) {
    io.to(challengerSocketId).emit("challengeAccepted", gameData);
    console.log("Sent challengeAccepted to challenger");
  }


  if (challengerSocketId) {
    io.to(challengerSocketId).emit("gameStart", { gameId });
    console.log("Sent gameStart to challenger");
  }
  if (challengedSocketId) {
    io.to(challengedSocketId).emit("gameStart", { gameId });
    console.log("Sent gameStart to challenged user");
  }
}

export function emitChallengeDeclined(challengerId, challenge) {
  const socketId = userSocketMap[challengerId.toString()];
  console.log(
    "Emitting challengeDeclined to challenger:",
    challengerId,
    "socketId:",
    socketId
  );
  if (socketId) {
    io.to(socketId).emit("challengeDeclined", {
      challenge,
      challenged: challenge.challenged,
    });
  }
}

export function emitGameUpdate(gameId, game) {

  const playerXId = game.playerX._id || game.playerX;
  const playerOId = game.playerO._id || game.playerO;

  const playerXSocketId = userSocketMap[playerXId.toString()];
  const playerOSocketId = userSocketMap[playerOId.toString()];

  console.log("Emitting gameUpdate to players:", playerXId, playerOId);
  console.log("Socket IDs - X:", playerXSocketId, "O:", playerOSocketId);


  if (playerXSocketId) {
    io.to(playerXSocketId).emit("gameUpdate", game);
  }
  if (playerOSocketId) {
    io.to(playerOSocketId).emit("gameUpdate", game);
  }
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("User added to socket map:", userId, "->", socket.id);
    console.log("Current online users:", Object.keys(userSocketMap));
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));


  socket.on("gameMove", async (data) => {
    try {
      const { gameId, position } = data;

      const game = await Game.findById(gameId).populate("playerX playerO");
      if (game) {

        emitGameUpdate(gameId, game);
      }
    } catch (error) {
      console.error("Error handling game move:", error);
    }
  });


  socket.on("challengeDeclined", (challenge) => {
    console.log("Challenge declined via socket:", challenge);
    emitChallengeDeclined(challenge.challenger._id, challenge);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);


    for (const [uId, sId] of Object.entries(userSocketMap)) {
      if (sId === socket.id) {
        delete userSocketMap[uId];
        console.log("Removed user from socket map:", uId);
        break;
      }
    }

    console.log("Remaining online users:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
