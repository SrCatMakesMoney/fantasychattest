"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { username, displayName, password }
        : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/feed");
    } catch {
      setError("Connection failed. The dark realm is unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="castle-card rounded-lg p-8 w-full max-w-md">
        {/* Castle Tower Decoration */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏰</div>
          <h1 className="font-[family-name:var(--font-family-gothic)] text-2xl font-bold glow-text text-[var(--color-accent-gold)]">
            FantasyChat
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Enter the Dark Realm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-family-gothic)]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-fantasy"
              placeholder="dark_wanderer"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-family-gothic)]">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-fantasy"
                placeholder="The Dark Wanderer"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-1 font-[family-name:var(--font-family-gothic)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-fantasy"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-[var(--color-accent-red)] text-sm text-center">
              ⚔️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-fantasy w-full py-3"
          >
            {loading
              ? "Opening the gates..."
              : isRegister
              ? "Join the Realm"
              : "Enter the Castle"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-accent-gold)] transition-colors"
          >
            {isRegister
              ? "Already have a soul? Enter here"
              : "New to the realm? Create your soul"}
          </button>
        </div>
      </div>
    </div>
  );
}
