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
    <div className="min-h-screen flex items-center justify-center p-4 vignette">
      <div className="w-full max-w-md slide-up">
        {/* Ornamental header */}
        <div className="text-center mb-8">
          <div className="torch-glow inline-block">
            <h1 className="fantasy-title glow-text text-4xl tracking-wide">
              Fantasy X
            </h1>
          </div>
          <div className="ornament mt-4">
            <span className="ornament-diamond" />
          </div>
          <p className="text-[var(--color-text-secondary)] mt-3 italic text-lg">
            Las puertas del reino se abren ante ti
          </p>
        </div>

        <div className="castle-card p-8">
          <h2 className="fantasy-title text-[var(--color-accent-gold)] text-center text-sm tracking-widest mb-6">
            {isRegister ? "Forjar un Alma Nueva" : "Entrar al Castillo"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[var(--color-text-secondary)] fantasy-title text-[10px] mb-2 tracking-wider uppercase">
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
              <div className="fade-in">
                <label className="block text-[var(--color-text-secondary)] fantasy-title text-[10px] mb-2 tracking-wider uppercase">
                  Nombre de Guerrero
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-fantasy"
                  placeholder="El Caballero de las Sombras"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[var(--color-text-secondary)] fantasy-title text-[10px] mb-2 tracking-wider uppercase">
                Palabra Secreta
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
              <div className="text-[var(--color-accent-red)] text-sm text-center fade-in border border-[var(--color-accent-red)] rounded p-3 bg-[rgba(208,64,64,0.08)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-fantasy w-full py-3 text-sm"
            >
              {loading
                ? "Abriendo las puertas..."
                : isRegister
                ? "Forjar Alma"
                : "Entrar"}
            </button>
          </form>

          <div className="ornament mt-8 mb-4">
            <span className="ornament-diamond" />
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-accent-gold)] transition-colors italic"
            >
              {isRegister
                ? "Ya tienes alma? Entra al castillo"
                : "Sin alma aun? Forja una nueva"}
            </button>
          </div>
        </div>

        <p className="text-center text-[var(--color-text-muted)] text-xs mt-6 italic opacity-50">
          Solo los valientes cruzan estas puertas
        </p>
      </div>
    </div>
  );
}
