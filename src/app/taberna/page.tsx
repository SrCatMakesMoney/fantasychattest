"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface TavernAuthor {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  cosmeticos?: { marco?: string; titulo?: string; colorNombre?: string };
}

interface TavernMsg {
  _id: string;
  author: TavernAuthor;
  content: string;
  createdAt: string;
}

export default function TabernaPage() {
  const router = useRouter();
  const [mensajes, setMensajes] = useState<TavernMsg[]>([]);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchMe = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUserId(data.user.id);
    };
    fetchMe();
  }, [router]);

  const fetchMensajes = useCallback(async () => {
    try {
      const res = await fetch("/api/taberna");
      if (res.ok) {
        const data = await res.json();
        setMensajes(data.mensajes);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 5000);
    return () => clearInterval(interval);
  }, [fetchMensajes]);

  useEffect(() => {
    if (mensajes.length === 0) return;
    bottomRef.current?.scrollIntoView({
      behavior: firstLoad.current ? "auto" : "smooth",
    });
    firstLoad.current = false;
  }, [mensajes.length]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/taberna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: texto }),
      });
      if (res.ok) {
        setTexto("");
        await fetchMensajes();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-5 fade-in">
          <h1 className="fantasy-title glow-text text-2xl">La Taberna</h1>
          <p className="text-[var(--color-text-secondary)] italic text-sm mt-1">
            Donde las lenguas se sueltan al calor del hidromiel y los secretos
            cambian de manos
          </p>
          <div className="ornament ornament-diamond mt-3" />
        </div>

        <div className="castle-card rpg-panel fade-in">
          <span className="rpg-corner rpg-corner-tl" />
          <span className="rpg-corner rpg-corner-tr" />
          <span className="rpg-corner rpg-corner-bl" />
          <span className="rpg-corner rpg-corner-br" />

          <div className="h-[55vh] overflow-y-auto scrollbar-dark p-4">
            {loading ? (
              <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow text-center mt-8">
                Empujando la puerta de la taberna...
              </p>
            ) : mensajes.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] italic text-center mt-8">
                La taberna está en silencio... sé el primero en alzar la voz.
              </p>
            ) : (
              mensajes.map((m) => {
                const propio = m.author?._id === userId;
                const cos = m.author?.cosmeticos;
                const initial =
                  m.author?.displayName?.[0]?.toUpperCase() || "?";
                return (
                  <div key={m._id} className="flex items-start gap-3 mb-4">
                    <button
                      onClick={() =>
                        m.author && router.push(`/usuario?id=${m.author._id}`)
                      }
                      className="flex-shrink-0 cursor-pointer"
                    >
                      {m.author?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.author.avatar}
                          alt={m.author.displayName}
                          className={`w-9 h-9 rounded-full border-2 border-[var(--color-accent-gold)] object-cover ${cos?.marco || ""}`}
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 fantasy-avatar text-xs ${cos?.marco || ""}`}
                        >
                          {initial}
                        </div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`fantasy-title text-xs ${
                            propio
                              ? "text-[var(--color-accent-gold)]"
                              : "text-[var(--color-text-primary)]"
                          }`}
                          style={
                            cos?.colorNombre
                              ? { color: cos.colorNombre }
                              : undefined
                          }
                        >
                          {m.author?.displayName || "Forastero"}
                        </span>
                        {cos?.titulo && (
                          <span className="text-[var(--color-accent-purple)] text-[10px] italic">
                            {cos.titulo}
                          </span>
                        )}
                        <span className="text-[var(--color-text-muted)] text-[10px]">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-primary)] text-sm mt-0.5 leading-relaxed break-words">
                        {m.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={enviar}
            className="flex gap-2 p-3 border-t border-[var(--color-border-dark)]"
          >
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Alza tu jarra y habla..."
              className="input-fantasy flex-1 text-sm py-2"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!texto.trim() || sending}
              className="btn-fantasy text-[10px] py-2 px-4"
            >
              {sending ? "..." : "Hablar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
