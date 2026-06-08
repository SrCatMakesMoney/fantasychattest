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

export default function ProfilePage() {
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
        <p className="text-[var(--color-text-muted)] font-[family-name:var(--font-family-gothic)]">
          Summoning your soul...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="castle-card rounded-lg p-8 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-[var(--color-bg-hover)] border-2 border-[var(--color-accent-gold)] flex items-center justify-center text-4xl mx-auto mb-4">
            ⚔️
          </div>

          {/* Display Name */}
          <h1 className="font-[family-name:var(--font-family-gothic)] text-2xl font-bold glow-text text-[var(--color-accent-gold)]">
            {user.displayName}
          </h1>

          {/* Username */}
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            @{user.username}
          </p>

          {/* Realm */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-bg-hover)] border border-[var(--color-border-dark)]">
            <span>🏰</span>
            <span className="text-[var(--color-accent-purple)] text-sm font-[family-name:var(--font-family-gothic)]">
              {user.realm}
            </span>
          </div>

          {/* Bio */}
          <p className="text-[var(--color-text-secondary)] mt-6 max-w-md mx-auto italic">
            &ldquo;{user.bio}&rdquo;
          </p>

          {/* Stats decoration */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-[var(--color-accent-gold)] font-[family-name:var(--font-family-gothic)] text-lg">
                ∞
              </div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Dark Power
              </div>
            </div>
            <div className="text-center">
              <div className="text-[var(--color-accent-purple)] font-[family-name:var(--font-family-gothic)] text-lg">
                🗡️
              </div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Realm Warrior
              </div>
            </div>
            <div className="text-center">
              <div className="text-[var(--color-accent-red)] font-[family-name:var(--font-family-gothic)] text-lg">
                🔮
              </div>
              <div className="text-[var(--color-text-muted)] text-xs">
                Soul Keeper
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6 text-center">
          <button
            onClick={async () => {
              await fetch("/api/auth/me", { method: "DELETE" });
              router.push("/login");
            }}
            className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-accent-red)] transition-colors"
          >
            🚪 Leave the Dark Realm
          </button>
        </div>
      </main>
    </div>
  );
}
