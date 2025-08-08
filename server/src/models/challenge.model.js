import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenged: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, 
    },
  },
  {
    timestamps: true,
  }
);


challengeSchema.index({ challenged: 1, status: 1 });
challengeSchema.index({ challenger: 1, status: 1 });


const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;
