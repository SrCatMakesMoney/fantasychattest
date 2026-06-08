"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
  };

  const navItems = [
    { href: "/muro", label: "Muro", icon: "📜" },
    { href: "/mensajes", label: "Mensajes", icon: "💀" },
    { href: "/perfil", label: "Perfil", icon: "👤" },
  ];

  return (
    <nav className="castle-card border-b-4 border-[var(--color-border-dark)] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/muro"
          className="pixel-title glow-text text-sm"
        >
          🏰 FantasyChat
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm transition-all ${
                pathname === item.href
                  ? "bg-[var(--color-bg-hover)] text-[var(--color-accent-gold)] border-b-2 border-[var(--color-accent-gold)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] transition-colors ml-2"
            title="Salir del reino"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
}
