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
    {
      href: "/muro",
      label: "Muro",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 7l7-5 7 5v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7z" />
          <path d="M7 16V10h4v6" />
        </svg>
      ),
    },
    {
      href: "/mensajes",
      label: "Mensajes",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 3h14v9H5l-3 3V3z" />
        </svg>
      ),
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="6" r="3" />
          <path d="M3 16c0-3 3-5 6-5s6 2 6 5" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="castle-card border-b border-[var(--color-border-dark)] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/muro" className="fantasy-title glow-text text-lg">
          Fantasy X
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm transition-all fantasy-title tracking-wider ${
                pathname === item.href
                  ? "text-[var(--color-accent-gold)] bg-[var(--color-bg-hover)] border-b-2 border-[var(--color-accent-gold)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(38,24,69,0.5)]"
              }`}
            >
              <span className="sm:hidden">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2 sm:px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] transition-colors ml-1 text-sm"
            title="Salir del reino"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:hidden">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M6 8h8" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
