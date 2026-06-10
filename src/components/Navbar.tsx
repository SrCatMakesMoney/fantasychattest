"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/mensajes/conversaciones");
        if (res.ok) {
          const data = await res.json();
          const total = data.conversaciones.reduce(
            (sum: number, c: { unreadCount: number }) => sum + c.unreadCount,
            0
          );
          setUnreadCount(total);
        }
      } catch {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 8000);
    return () => clearInterval(interval);
  }, []);

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
      badge: 0,
    },
    {
      href: "/reino",
      label: "Reino",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 14h14M3 14V7l3 2 3-5 3 5 3-2v7" />
        </svg>
      ),
      badge: 0,
    },
    {
      href: "/facciones",
      label: "Facciones",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 16V3h8l-2 3 2 3H5" />
        </svg>
      ),
      badge: 0,
    },
    {
      href: "/taberna",
      label: "Taberna",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 3h8v3a4 4 0 0 1-8 0V3z" />
          <path d="M13 4h2a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-1M7 10v4M11 10v4M5 15h8" />
        </svg>
      ),
      badge: 0,
    },
    {
      href: "/mercado",
      label: "Mercado",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 6h12l-1 9H4L3 6z" />
          <path d="M6 6V4a3 3 0 0 1 6 0v2" />
        </svg>
      ),
      badge: 0,
    },
    {
      href: "/mensajes",
      label: "Mensajes",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 3h14v9H5l-3 3V3z" />
        </svg>
      ),
      badge: unreadCount,
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
      badge: 0,
    },
  ];

  return (
    <nav className="castle-card border-b border-[var(--color-border-dark)] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1">
        <Link href="/muro" className="fantasy-title glow-text text-base sm:text-lg flex-shrink-0 px-1">
          <span className="hidden md:inline">Fantasy X</span>
          <span className="md:hidden">FX</span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto min-w-0 no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 flex-shrink-0 px-2.5 sm:px-3 md:px-4 py-2 text-sm transition-all fantasy-title tracking-wider ${
                pathname === item.href
                  ? "text-[var(--color-accent-gold)] bg-[var(--color-bg-hover)] border-b-2 border-[var(--color-accent-gold)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(38,24,69,0.5)]"
              }`}
            >
              <span className="md:hidden relative">
                {item.icon}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-accent-red)] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              <span className="hidden md:inline">{item.label}</span>
              {item.badge > 0 && (
                <span className="hidden md:flex bg-[var(--color-accent-red)] text-white text-[9px] w-5 h-5 items-center justify-center rounded-full font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 flex-shrink-0 px-2 sm:px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] transition-colors ml-1 text-sm"
            title="Salir del reino"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="md:hidden">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M6 8h8" />
            </svg>
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
