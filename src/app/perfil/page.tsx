"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  realm: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
          Invocando tu alma...
        </p>
      </div>
    );
  }

  const initial = user.displayName?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="castle-card p-10 text-center fade-in">
          {/* Avatar */}
          <div className="w-24 h-24 fantasy-avatar text-3xl mx-auto mb-5">
            {initial}
          </div>

          {/* Nombre */}
          <h1 className="fantasy-title glow-text text-2xl">
            {user.displayName}
          </h1>

          {/* Usuario */}
          <p className="text-[var(--color-text-muted)] text-sm mt-2">
            @{user.username}
          </p>

          {/* Reino */}
          <div className="mt-5">
            <span className="realm-badge text-xs">
              {user.realm}
            </span>
          </div>

          {/* Bio */}
          <p className="text-[var(--color-text-secondary)] mt-6 max-w-md mx-auto italic leading-relaxed">
            &ldquo;{user.bio}&rdquo;
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="text-center castle-card p-4">
              <div className="text-[var(--color-accent-gold)] fantasy-title text-lg">
                &infin;
              </div>
              <div className="text-[var(--color-text-muted)] text-xs mt-1">
                Poder
              </div>
            </div>
            <div className="text-center castle-card p-4">
              <div className="text-[var(--color-accent-purple)] fantasy-title text-lg">
                &dagger;
              </div>
              <div className="text-[var(--color-text-muted)] text-xs mt-1">
                Guerrero
              </div>
            </div>
            <div className="text-center castle-card p-4">
              <div className="text-[var(--color-accent-red)] fantasy-title text-lg">
                &sect;
              </div>
              <div className="text-[var(--color-text-muted)] text-xs mt-1">
                Guardian
              </div>
            </div>
          </div>
        </div>

        {/* Salir */}
        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              await fetch("/api/auth/me", { method: "DELETE" });
              router.push("/login");
            }}
            className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-accent-red)] transition-colors"
          >
            Abandonar el Reino Oscuro
          </button>
        </div>
      </main>
    </div>
  );
}
