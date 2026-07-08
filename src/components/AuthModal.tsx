import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldAlert, Loader2, Sparkles } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, fullName: string) => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
}

export default function AuthModal({ onClose, onLogin, onRegister, onGoogleLogin }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    if (!onGoogleLogin) return;
    setError("");
    setLoading(true);
    try {
      await onGoogleLogin();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is not enabled for this Firebase project. Please enable it in the Firebase console.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !fullName)) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await onRegister(email, password, fullName);
      } else {
        await onLogin(email, password);
      }
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error(err);
      // Clean up Firebase Auth errors
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password combination.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password accounts are not enabled. To use this, go to your Firebase Console under Authentication > Sign-in method, click 'Add new provider', and enable 'Email/Password'. Alternatively, use the instant 'Continue with Google' button below!");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" id="auth-modal">
      {/* Background click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col justify-center animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? "Create Your AURA Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isSignUp
              ? "Register to save custom profiles, delivery details and orders"
              : "Access your saved shipping profiles and active order listings"}
          </p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 mb-6">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="E.g., Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0a4436] text-white hover:bg-[#073228] disabled:bg-slate-100 disabled:text-slate-400 rounded-full font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 mt-6 shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Authorization...</span>
              </>
            ) : (
              <span>{isSignUp ? "Complete Account Creation" : "Sign In Successfully"}</span>
            )}
          </button>
        </form>

        {onGoogleLogin && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white px-3 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleClick}
              disabled={loading}
              type="button"
              className="w-full h-12 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 rounded-full font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {/* Footer / Toggle Mode */}
        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            {isSignUp ? "Already have an account?" : "New to AURA?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="font-bold text-blue-600 hover:text-blue-800 focus:outline-none ml-1 transition-colors"
            >
              {isSignUp ? "Sign In" : "Register a Free Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
