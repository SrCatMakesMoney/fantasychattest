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
      const endpoint = isRegister ? "/api/auth/registro" : "/api/auth/login";
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
        setError(data.error || "Algo salio mal");
        return;
      }

      router.push("/muro");
    } catch {
      setError("El reino oscuro no responde...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="castle-card p-8 w-full max-w-md pixel-fade-in">
        <div className="text-center mb-8">
          <div className="castle-tower mb-4">🏰</div>
          <h1 className="pixel-title text-[var(--color-accent-gold)] glow-text text-base">
            FantasyChat
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-3">
            ─── Entra al Reino Oscuro ───
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[var(--color-accent-gold)] pixel-title text-[8px] mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-fantasy"
              placeholder="guerrero_oscuro"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[var(--color-accent-gold)] pixel-title text-[8px] mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-fantasy"
                placeholder="El Guerrero Oscuro"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[var(--color-accent-gold)] pixel-title text-[8px] mb-2">
              Contrasena
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-fantasy"
              placeholder="********"
              required
            />
          </div>

          {error && (
            <p className="text-[var(--color-accent-red)] text-sm text-center pixel-fade-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-fantasy w-full py-3"
          >
            {loading
              ? "Abriendo puertas..."
              : isRegister
              ? "Crear alma"
              : "Entrar al castillo"}
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
              ? "Ya tienes alma? Entra aqui"
              : "Nuevo en el reino? Crea tu alma"}
          </button>
        </div>
      </div>
    </div>
  );
}
