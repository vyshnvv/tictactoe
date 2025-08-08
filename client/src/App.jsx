import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import { Toaster } from "react-hot-toast";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import GamePage from "./pages/GamePage.jsx";

const LogoutPage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logout(navigate);
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
      <span className="ml-2">Logging out...</span>
    </div>
  );
};

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    console.log("Still checking auth, showing loader...");
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/logout"
          element={authUser ? <LogoutPage /> : <Navigate to="/login" />}
        />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
