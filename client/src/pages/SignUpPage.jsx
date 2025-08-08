import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Gamepad2,
  User,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const debounceTimer = useRef(null);
  const { signUp, isSigningUp } = useAuthStore();

  useEffect(() => {
    if (!formData.fullName.trim()) {
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [formData.fullName]);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    return true;
  };

  const isFormValid = useMemo(() => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password &&
      formData.password.length >= 6
    );
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      signUp({
        ...formData,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 text-sm font-medium">
                Join the arena
              </div>

              <h1 className="text-4xl lg:text-5xl font-light text-gray-800 leading-tight">
                Master the classic
                <span className="block text-rose-600 font-medium">
                  Tic-Tac-Toe Game
                </span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                Challenge players from around the world in the timeless game of
                strategy and quick thinking.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start gap-4 p-6 bg-white border border-gray-100">
                <div className="w-10 h-10 bg-yellow-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    Competitive Play
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Track your wins, losses, and climb the leaderboard rankings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    Global Players
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Challenge opponents from around the world in real-time
                    matches
                  </p>
                </div>
              </div>
            </div>
          </div>


          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white border border-gray-100 p-8">

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 mb-4">
                    <Gamepad2 className="w-8 h-8 text-rose-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-800 mb-1">
                    Join the Arena
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Create your player account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-300 focus:bg-white focus:outline-none text-gray-900 placeholder-gray-400"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>


                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-300 focus:bg-white focus:outline-none text-gray-900 placeholder-gray-400"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>


                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 focus:border-blue-300 focus:bg-white focus:outline-none text-gray-900 placeholder-gray-400"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    disabled={isSigningUp || !isFormValid}
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="w-5 h-5" />
                        Start Playing
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-6 mt-6 border-t border-gray-100">
                  <p className="text-gray-500 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-rose-600 hover:text-rose-700"
                    >
                      Sign in to play
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
