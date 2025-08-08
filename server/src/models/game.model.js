import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    playerX: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playerO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    board: {
      type: [String],
      default: ["", "", "", "", "", "", "", "", ""],
      validate: {
        validator: function (board) {
          return board.length === 9;
        },
        message: "Board must have exactly 9 cells",
      },
    },
    currentPlayer: {
      type: String,
      enum: ["X", "O"],
      default: "X",
    },
    status: {
      type: String,
      enum: ["waiting", "in_progress", "finished", "abandoned"],
      default: "waiting",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    result: {
      type: String,
      enum: ["win", "draw", "abandoned"],
      default: null,
    },
    moves: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        position: {
          type: Number,
          required: true,
          min: 0,
          max: 8,
        },
        symbol: {
          type: String,
          enum: ["X", "O"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


gameSchema.index({ playerX: 1, playerO: 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ createdAt: -1 });

const Game = mongoose.model("Game", gameSchema);

export default Game;
