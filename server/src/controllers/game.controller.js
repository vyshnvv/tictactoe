import Game from "../models/game.model.js";
import { emitGameUpdate } from "../lib/socket.js";

export const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
      .populate("playerX", "fullName email")
      .populate("playerO", "fullName email")
      .populate("winner", "fullName");

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }


    if (
      ![game.playerX._id.toString(), game.playerO._id.toString()].includes(
        req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ error: "You are not a player in this game" });
    }

    res.status(200).json(game);
  } catch (error) {
    console.log("Error in getGame controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const makeMove = async (req, res) => {
  try {
    const { position } = req.body;
    const gameId = req.params.gameId;
    const userId = req.user._id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }


    if (game.status !== "in_progress") {
      return res.status(400).json({ error: "Game is not in progress" });
    }


    const playerSymbol = game.playerX.equals(userId)
      ? "X"
      : game.playerO.equals(userId)
      ? "O"
      : null;
    if (!playerSymbol) {
      return res
        .status(403)
        .json({ error: "You are not a player in this game" });
    }

    if (game.currentPlayer !== playerSymbol) {
      return res.status(400).json({ error: "It's not your turn" });
    }


    if (position < 0 || position > 8 || game.board[position] !== "") {
      return res.status(400).json({ error: "Invalid move" });
    }


    const newBoard = [...game.board];
    newBoard[position] = playerSymbol;
    game.board = newBoard;


    game.moves.push({
      player: userId,
      position,
      symbol: playerSymbol,
    });


    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], 
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], 
      [0, 4, 8],
      [2, 4, 6], 
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        game.status = "finished";
        game.winner = userId;
        game.result = "win";
        game.finishedAt = new Date();
        break;
      }
    }


    if (!newBoard.includes("") && game.status === "in_progress") {
      game.status = "finished";
      game.result = "draw";
      game.finishedAt = new Date();
    }


    if (game.status === "in_progress") {
      game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
    }

    await game.save();


    await game.populate("playerX playerO winner");


    emitGameUpdate(gameId, game);

    res.status(200).json(game);
  } catch (error) {
    console.log("Error in makeMove controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGameHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const games = await Game.find({
      $or: [{ playerX: userId }, { playerO: userId }],
      status: "finished",
    })
      .populate("playerX playerO winner", "fullName email")
      .sort({ finishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Game.countDocuments({
      $or: [{ playerX: userId }, { playerO: userId }],
      status: "finished",
    });

    res.status(200).json({
      games,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.log("Error in getGameHistory controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
