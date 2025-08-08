import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { Gamepad2, X, Circle, ArrowLeft, RotateCw } from "lucide-react";
import { makeMove, getGame } from "../api/game.api.js";
import toast from "react-hot-toast";

const GamePage = () => {
  const { gameId } = useParams();
  const { authUser, socket } = useAuthStore();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await getGame(gameId);
        console.log("Game data fetched:", gameData); // Debug log
        setGame(gameData);

        // Ensure board uses empty strings to match backend
        const gameBoard = gameData.board || Array(9).fill("");
        setBoard(gameBoard);
        setCurrentPlayer(gameData.currentPlayer || "X");

        // Check game status
        if (gameData.status === "finished") {
          if (gameData.result === "draw") {
            setIsDraw(true);
            setWinner(null);
          } else if (gameData.winner) {
            setWinner(gameData.winner._id || gameData.winner);
            setIsDraw(false);
          }
        } else {
          // Game is in progress, check for winner with current board
          const winnerResult = checkWinnerLogic(gameBoard);
          if (winnerResult.winner) {
            setWinner(winnerResult.winner);
            setIsDraw(false);
          } else if (winnerResult.isDraw) {
            setIsDraw(true);
            setWinner(null);
          } else {
            setWinner(null);
            setIsDraw(false);
          }
        }
      } catch (error) {
        toast.error("Failed to load game");
        console.error(error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId, navigate]);

  useEffect(() => {
    if (!socket) return;

    const handleGameUpdate = (updatedGame) => {
      console.log("Game updated via socket:", updatedGame);
      if (updatedGame._id === gameId) {
        setGame(updatedGame);
        setBoard(updatedGame.board);
        setCurrentPlayer(updatedGame.currentPlayer);

        if (updatedGame.status === "finished") {
          if (updatedGame.result === "draw") {
            setIsDraw(true);
            setWinner(null);
          } else if (updatedGame.winner) {
            setWinner(updatedGame.winner._id || updatedGame.winner);
            setIsDraw(false);
          }
        } else {
          const winnerResult = checkWinnerLogic(updatedGame.board);
          if (winnerResult.winner) {
            setWinner(winnerResult.winner);
            setIsDraw(false);
          } else if (winnerResult.isDraw) {
            setIsDraw(true);
            setWinner(null);
          } else {
            setWinner(null);
            setIsDraw(false);
          }
        }
      }
    };

    socket.on("gameUpdate", handleGameUpdate);

    return () => {
      socket.off("gameUpdate", handleGameUpdate);
    };
  }, [socket, gameId]);

  const checkWinnerLogic = (boardState) => {
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
        boardState[a] &&
        boardState[a] !== "" &&
        boardState[a] === boardState[b] &&
        boardState[a] === boardState[c]
      ) {
        return { winner: boardState[a], isDraw: false };
      }
    }

    if (!boardState.includes("")) {
      return { winner: null, isDraw: true };
    }

    return { winner: null, isDraw: false };
  };

  const getMySymbol = () => {
    if (!game) return null;
    if (game.playerX._id === authUser._id) return "X";
    if (game.playerO._id === authUser._id) return "O";
    return null;
  };

  const handleMove = async (index) => {
    if (board[index] !== "" || winner || isDraw) return;

    const mySymbol = getMySymbol();
    if (!mySymbol) {
      toast.error("Unable to determine your player symbol");
      return;
    }

    if (currentPlayer !== mySymbol) {
      toast.error("It's not your turn");
      return;
    }

    try {
      const newBoard = [...board];
      newBoard[index] = mySymbol;
      setBoard(newBoard);

      const updatedGame = await makeMove(gameId, index);

      setBoard(updatedGame.board);
      setCurrentPlayer(updatedGame.currentPlayer);

      if (updatedGame.status === "finished") {
        if (updatedGame.result === "draw") {
          setIsDraw(true);
          setWinner(null);
        } else if (updatedGame.winner) {
          setWinner(updatedGame.winner._id || updatedGame.winner);
          setIsDraw(false);
        }
      }
    } catch (error) {
      toast.error("Failed to make move");
      console.error(error);

      const revertedBoard = [...board];
      revertedBoard[index] = "";
      setBoard(revertedBoard);
    }
  };

  const getPlayerName = (symbol) => {
    if (!game) return "";
    return symbol === "X"
      ? game.playerX._id === authUser._id
        ? "You"
        : game.playerX.fullName
      : game.playerO._id === authUser._id
      ? "You"
      : game.playerO.fullName;
  };

  const getWinnerName = () => {
    if (!winner || !game) return "";
    if (game.playerX._id === winner) {
      return game.playerX._id === authUser._id ? "You" : game.playerX.fullName;
    }
    if (game.playerO._id === winner) {
      return game.playerO._id === authUser._id ? "You" : game.playerO.fullName;
    }
    return "";
  };

  const renderCell = (index) => {
    const value = board[index];
    return (
      <button
        className={`w-24 h-24 border border-gray-300 flex items-center justify-center text-4xl font-bold transition-colors hover:bg-gray-50 ${
          value === "" && !winner && !isDraw && currentPlayer === getMySymbol()
            ? "cursor-pointer"
            : "cursor-not-allowed"
        }`}
        onClick={() => handleMove(index)}
        disabled={
          value !== "" || winner || isDraw || currentPlayer !== getMySymbol()
        }
      >
        {value === "X" && (
          <X className="w-16 h-16 text-rose-500" strokeWidth={3} />
        )}
        {value === "O" && (
          <Circle className="w-16 h-16 text-blue-500" strokeWidth={3} />
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Game not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lobby
          </button>

          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Tic-Tac-Toe</h1>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <div className="font-medium text-gray-700">Player X</div>
              <div
                className={`text-lg font-bold ${
                  game.playerX._id === authUser._id
                    ? "text-indigo-600"
                    : "text-gray-800"
                }`}
              >
                {getPlayerName("X")}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">VS</div>
              <div className="text-sm text-gray-500">Game ID: {gameId}</div>
            </div>

            <div className="text-center">
              <div className="font-medium text-gray-700">Player O</div>
              <div
                className={`text-lg font-bold ${
                  game.playerO._id === authUser._id
                    ? "text-indigo-600"
                    : "text-gray-800"
                }`}
              >
                {getPlayerName("O")}
              </div>
            </div>
          </div>

          <div
            className={`mb-6 p-3 rounded-lg text-center font-medium ${
              winner || isDraw
                ? "bg-gray-100 text-gray-800"
                : currentPlayer === getMySymbol()
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {winner ? (
              <span className="flex items-center justify-center gap-2">
                {winner === getMySymbol()
                  ? "You won!"
                  : `${getWinnerName()} wins!`}
              </span>
            ) : isDraw ? (
              "It's a draw!"
            ) : currentPlayer === getMySymbol() ? (
              "Your turn!"
            ) : (
              `${getPlayerName(currentPlayer)}'s turn`
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 w-fit mx-auto mb-6">
            {renderCell(0)}
            {renderCell(1)}
            {renderCell(2)}
            {renderCell(3)}
            {renderCell(4)}
            {renderCell(5)}
            {renderCell(6)}
            {renderCell(7)}
            {renderCell(8)}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
