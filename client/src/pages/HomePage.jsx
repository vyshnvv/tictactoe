import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  LogOut,
  User,
  Gamepad2,
  Trophy,
  Users,
  Circle,
  Send,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  sendChallenge,
  acceptChallenge,
  declineChallenge,
  getPendingChallenges,
} from "../api/challenge.api.js";
import { getUserStats } from "../api/users.api.js";

const HomePage = () => {
  const {
    authUser,
    onlineUsers = [],
    users,
    isLoadingUsers,
    getUsers,
    socket,
  } = useAuthStore();

  const navigate = useNavigate();

  const [sentChallenges, setSentChallenges] = useState(new Set());
  const [receivedChallenges, setReceivedChallenges] = useState([]);

  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    winRate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    getUsers();
    loadPendingChallenges();
    loadUserStats();
  }, [getUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleChallengeReceived = (challenge) => {
      console.log("Challenge received:", challenge);
      setReceivedChallenges((prev) => [...prev, challenge]);
      toast.success(`${challenge.challenger.fullName} challenged you!`);
    };

    const handleChallengeAccepted = ({ challenge, gameId }) => {
      console.log("Challenge accepted:", challenge, "gameId:", gameId);

      setSentChallenges((prev) => {
        const newSet = new Set(prev);
        newSet.delete(challenge.challenged.toString());
        return newSet;
      });
      toast.success("Challenge accepted! Starting game...");
      if (gameId) {
        navigate(`/game/${gameId}`);
      }
    };

    const handleChallengeDeclined = (data) => {
      console.log("Challenge declined:", data);

      setSentChallenges((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.challenged._id || data.challenged);
        return newSet;
      });
      toast.error("Challenge declined");
    };

    const handleGameStart = ({ gameId }) => {
      console.log("Game starting with ID:", gameId);
      toast.success("Game starting!");
      if (gameId) {
        navigate(`/game/${gameId}`);
      }
    };

    const handleGameUpdate = (gameData) => {
      if (gameData.status === "finished") {
        loadUserStats();
      }
    };

    socket.on("challengeReceived", handleChallengeReceived);
    socket.on("challengeAccepted", handleChallengeAccepted);
    socket.on("challengeDeclined", handleChallengeDeclined);
    socket.on("gameStart", handleGameStart);
    socket.on("gameUpdate", handleGameUpdate);

    return () => {
      socket.off("challengeReceived", handleChallengeReceived);
      socket.off("challengeAccepted", handleChallengeAccepted);
      socket.off("challengeDeclined", handleChallengeDeclined);
      socket.off("gameStart", handleGameStart);
      socket.off("gameUpdate", handleGameUpdate);
    };
  }, [socket, navigate]);

  const loadPendingChallenges = async () => {
    try {
      const challenges = await getPendingChallenges();
      console.log("Received challenges:", challenges);
      setReceivedChallenges(Array.isArray(challenges) ? challenges : []);
    } catch (error) {
      console.error("Failed to load pending challenges:", error);
      setReceivedChallenges([]);
    }
  };

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Failed to load user stats:", error);
      toast.error("Failed to load game statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleChallenge = async (user) => {
    try {
      setSentChallenges((prev) => new Set([...prev, user._id]));

      await sendChallenge(user._id);
      toast.success(`Challenge sent to ${user.fullName}!`);
    } catch (error) {
      console.error("Failed to send challenge:", error);
      toast.error(
        error.message || "Failed to send challenge. Please try again."
      );

      setSentChallenges((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user._id);
        return newSet;
      });
    }
  };

  const handleAcceptChallenge = async (challenge) => {
    try {
      const response = await acceptChallenge(challenge._id);
      toast.success("Challenge accepted! Starting game...");

      setReceivedChallenges((prev) =>
        prev.filter((c) => c._id !== challenge._id)
      );

      navigate(`/game/${response.gameId}`);
    } catch (error) {
      console.error("Failed to accept challenge:", error);
      toast.error(
        error.message || "Failed to accept challenge. Please try again."
      );
    }
  };

  const handleDeclineChallenge = async (challenge) => {
    try {
      await declineChallenge(challenge._id);
      setReceivedChallenges((prev) =>
        prev.filter((c) => c._id !== challenge._id)
      );
      toast.success("Challenge declined");

      if (socket) {
        socket.emit("challengeDeclined", challenge);
      }
    } catch (error) {
      console.error("Failed to decline challenge:", error);
      toast.error(error.message || "Failed to decline challenge.");
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const onlineCount = users.filter((user) => isUserOnline(user._id)).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-200 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-800">
                Tic-Tac-Toe Arena
              </h1>
              <p className="text-gray-500 text-sm">
                Ready to play, {authUser?.fullName}?
              </p>
            </div>
          </div>

          <Link
            to="/logout"
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
        </header>

        {Array.isArray(receivedChallenges) && receivedChallenges.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Incoming Challenges
            </h3>
            <div className="space-y-3">
              {receivedChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="bg-yellow-50 border border-yellow-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {challenge.challenger?.fullName || "Unknown"} challenged
                        you!
                      </p>
                      <p className="text-sm text-gray-500">
                        Ready to play Tic-Tac-Toe?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptChallenge(challenge)}
                      className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineChallenge(challenge)}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Online Players</span>
            </div>
            <p className="text-2xl font-light text-gray-800">{onlineCount}</p>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Games Played</span>
            </div>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : (
              <p className="text-2xl font-light text-gray-800">
                {userStats.gamesPlayed}
              </p>
            )}
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Wins</span>
            </div>
            {isLoadingStats ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-200 border-t-yellow-400 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-light text-gray-800">
                  {userStats.wins}
                </p>
                {userStats.gamesPlayed > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {userStats.winRate}% win rate
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">
                Players to Challenge
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{onlineCount} ready to play</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-16">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading players...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-gray-600 font-medium">
                      No players available
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Invite friends to join!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  const isOnline = isUserOnline(user._id);
                  return (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-4 ${
                        isOnline ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div
                            className={`w-10 h-10 flex items-center justify-center ${
                              isOnline ? "bg-green-200" : "bg-gray-200"
                            }`}
                          >
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white ${
                              isOnline ? "bg-green-400" : "bg-gray-300"
                            }`}
                          ></div>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-800">
                            {user.fullName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {isOnline ? "Ready to play" : "Offline"} •{" "}
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isOnline && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs">
                            <Circle className="w-1.5 h-1.5 fill-current" />
                            Ready
                          </div>
                        )}

                        <button
                          onClick={() => handleChallenge(user)}
                          disabled={!isOnline || sentChallenges.has(user._id)}
                          className={`px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                            !isOnline
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : sentChallenges.has(user._id)
                              ? "bg-yellow-100 text-yellow-700 cursor-not-allowed"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {!isOnline ? (
                            "Offline"
                          ) : sentChallenges.has(user._id) ? (
                            <>
                              <Clock className="w-4 h-4" />
                              Challenge Sent
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Play Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
