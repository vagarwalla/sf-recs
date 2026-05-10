"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        onSuccess();
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-card-border rounded-2xl p-6 w-[320px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-accent" />
            <h2 className="font-bold text-foreground">Admin Login</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent"
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-3 py-2 text-sm font-bold rounded-full bg-accent text-pill-active-text hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="text-[11px] text-muted/60 mt-3 text-center">
          Stays logged in for 30 days on this device
        </p>
      </div>
    </div>
  );
}
