import Challenge from "../models/challenge.model.js";
import Game from "../models/game.model.js";
import User from "../models/user.model.js";
import {
  emitChallengeReceived,
  emitChallengeAccepted,
  emitChallengeDeclined,
} from "../lib/socket.js";


export const sendChallenge = async (req, res) => {
  try {
    const { challengedUserId } = req.body;
    const challengerId = req.user._id;


    if (!challengedUserId) {
      return res.status(400).json({ error: "Challenged user ID is required" });
    }


    if (challengerId.toString() === challengedUserId) {
      return res.status(400).json({ error: "Cannot challenge yourself" });
    }


    const challengedUser = await User.findById(challengedUserId);
    if (!challengedUser) {
      return res.status(404).json({ error: "User not found" });
    }


    const existingChallenge = await Challenge.findOne({
      $or: [
        {
          challenger: challengerId,
          challenged: challengedUserId,
          status: "pending",
        },
        {
          challenger: challengedUserId,
          challenged: challengerId,
          status: "pending",
        },
      ],
    });

    if (existingChallenge) {
      return res
        .status(400)
        .json({ error: "Challenge already exists between these users" });
    }

    const newChallenge = new Challenge({
      challenger: challengerId,
      challenged: challengedUserId,
      status: "pending",
    });

    await newChallenge.save();


    await newChallenge.populate("challenger", "fullName email");
    await newChallenge.populate("challenged", "fullName email");


    emitChallengeReceived(challengedUserId, newChallenge);

    res.status(201).json({
      message: "Challenge sent successfully",
      challenge: newChallenge,
    });
  } catch (error) {
    console.error("Error sending challenge:", error);
    res.status(500).json({ error: "Failed to send challenge" });
  }
};


export const getPendingChallenges = async (req, res) => {
  try {
    const userId = req.user._id;

    const challenges = await Challenge.find({
      challenged: userId,
      status: "pending",
    }).populate("challenger", "fullName email");

    res.status(200).json(challenges);
  } catch (error) {
    console.error("Error fetching pending challenges:", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
};


export const acceptChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challengedUserId = req.user._id;


    const challenge = await Challenge.findOne({
      _id: challengeId,
      challenged: challengedUserId,
      status: "pending",
    });

    if (!challenge) {
      return res
        .status(404)
        .json({ error: "Challenge not found or already handled" });
    }


    challenge.status = "accepted";
    await challenge.save();

    const newGame = new Game({
      playerX: challenge.challenger, 
      playerO: challengedUserId, 
      status: "in_progress",
      startedAt: new Date(),
    });

    await newGame.save();


    challenge.gameId = newGame._id;
    await challenge.save();

    await challenge.populate("challenger challenged", "fullName email");

    emitChallengeAccepted(
      challenge.challenger._id,
      challengedUserId,
      challenge,
      newGame._id
    );

    res.status(200).json({
      message: "Challenge accepted",
      gameId: newGame._id,
      challenge: challenge,
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    res.status(500).json({ error: "Failed to accept challenge" });
  }
};


export const declineChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challengedUserId = req.user._id;

    const challenge = await Challenge.findOne({
      _id: challengeId,
      challenged: challengedUserId,
      status: "pending",
    });

    if (!challenge) {
      return res
        .status(404)
        .json({ error: "Challenge not found or already handled" });
    }


    challenge.status = "declined";
    await challenge.save();


    await challenge.populate("challenger challenged", "fullName email");


    emitChallengeDeclined(challenge.challenger._id, challenge);

    res.status(200).json({
      message: "Challenge declined",
      challenge: challenge,
    });
  } catch (error) {
    console.error("Error declining challenge:", error);
    res.status(500).json({ error: "Failed to decline challenge" });
  }
};


export const getChallengeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const challenges = await Challenge.find({
      $or: [{ challenger: userId }, { challenged: userId }],
      status: { $in: ["accepted", "declined", "expired"] },
    })
      .populate("challenger", "fullName email")
      .populate("challenged", "fullName email")
      .populate("gameId")
      .sort({ createdAt: -1 });

    res.status(200).json(challenges);
  } catch (error) {
    console.error("Error fetching challenge history:", error);
    res.status(500).json({ error: "Failed to fetch challenge history" });
  }
};
