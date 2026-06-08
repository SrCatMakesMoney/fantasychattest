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
      <div className="castle-card p-10 w-full max-w-md fade-in">
        <div className="text-center mb-10">
          <h1 className="fantasy-title glow-text text-3xl mb-2">
            Fantasy X
          </h1>
          <div className="fantasy-divider my-4" />
          <p className="text-[var(--color-text-secondary)] text-sm italic">
            Entra al Reino Oscuro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[var(--color-accent-gold)] fantasy-title text-xs mb-2 tracking-wider">
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
              <label className="block text-[var(--color-accent-gold)] fantasy-title text-xs mb-2 tracking-wider">
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
            <label className="block text-[var(--color-accent-gold)] fantasy-title text-xs mb-2 tracking-wider">
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
            <div className="text-[var(--color-accent-red)] text-sm text-center fade-in border border-[var(--color-accent-red)] rounded p-3 bg-[rgba(208,64,64,0.1)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-fantasy w-full py-3"
          >
            {loading
              ? "Abriendo las puertas..."
              : isRegister
              ? "Crear Alma"
              : "Entrar al Castillo"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="fantasy-divider mb-5" />
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
