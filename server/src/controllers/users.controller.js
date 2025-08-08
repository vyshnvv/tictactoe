import User from "../models/user.model.js";
import Game from "../models/game.model.js";

export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;


    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsers controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;


    const gamesPlayed = await Game.countDocuments({
      $or: [{ playerX: userId }, { playerO: userId }],
      status: "finished",
    });


    const wins = await Game.countDocuments({
      winner: userId,
      status: "finished",
    });


    const draws = await Game.countDocuments({
      $or: [{ playerX: userId }, { playerO: userId }],
      status: "finished",
      result: "draw",
    });


    const losses = gamesPlayed - wins - draws;

    res.status(200).json({
      gamesPlayed,
      wins,
      draws,
      losses,
      winRate: gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : 0,
    });
  } catch (error) {
    console.log("Error in getUserStats controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
