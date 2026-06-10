"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { BADGES } from "@/lib/badges";

interface RealmUser {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  realm?: string;
  badges?: string[];
}

interface Reinado {
  _id: string;
  king: RealmUser;
  weekKey: string;
  crownedAt: string;
}

interface EventPost {
  _id: string;
  author: RealmUser & { realm: string };
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
  likes: string[];
  eventType?: "" | "evento" | "decreto" | "coronacion";
  createdAt: string;
}

interface EventFaction {
  _id: string;
  name: string;
  emblem: string;
}

interface Evento {
  _id: string;
  type:
    | "coronacion"
    | "plaga"
    | "festin"
    | "batalla"
    | "profecia"
    | "decreto"
    | "guerra";
  title: string;
  description: string;
  involvedUsers: RealmUser[];
  factions?: EventFaction[];
  post?: EventPost | null;
  createdAt: string;
}

const EVENT_ICONS: Record<Evento["type"], string> = {
  coronacion: "♛",
  plaga: "☠",
  festin: "⚜",
  batalla: "⚔",
  profecia: "☽",
  decreto: "✠",
  guerra: "⛨",
};

export default function ReinoPage() {
  const router = useRouter();
  const [reinado, setReinado] = useState<Reinado | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [esRey, setEsRey] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [decreto, setDecreto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchReino = useCallback(async () => {
    try {
      const res = await fetch("/api/reino");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setReinado(data.reinado);
        setEventos(data.eventos);
        setEsRey(data.esRey);
        setUserId(data.userId || "");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReino();
  }, [fetchReino]);

  const emitirDecreto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decreto.trim() || enviando) return;
    setEnviando(true);
    setMsg("");
    try {
      const res = await fetch("/api/reino/decreto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: decreto }),
      });
      if (res.ok) {
        setDecreto("");
        setMsg("Decreto proclamado en todo el reino.");
        await fetchReino();
      } else {
        const data = await res.json();
        setMsg(data.error || "Error al emitir el decreto");
      }
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
            Desempolvando los pergaminos del reino...
          </p>
        </div>
      </div>
    );
  }

  const kingInitial = reinado?.king?.displayName?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="fantasy-title glow-text text-xl mb-1">
            Crónica del Reino
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm italic">
            La historia viva de las tierras oscuras, escrita por sus habitantes
          </p>
          <div className="ornament mt-4">
            <span className="ornament-diamond" />
          </div>
        </div>

        {/* Rey actual */}
        {reinado ? (
          <div className="castle-card p-6 mb-6 text-center border-[var(--color-accent-gold)]">
            <p className="fantasy-title text-[var(--color-accent-gold)] text-xs tracking-widest mb-3">
              ♛ SOBERANO DE LA SEMANA · {reinado.weekKey}
            </p>
            <button
              onClick={() => router.push(`/usuario?id=${reinado.king._id}`)}
              className="cursor-pointer"
            >
              {reinado.king.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reinado.king.avatar}
                  alt={reinado.king.displayName}
                  className="w-20 h-20 rounded-full border-2 border-[var(--color-accent-gold)] object-cover mx-auto shadow-[0_0_16px_rgba(232,184,48,0.5)]"
                />
              ) : (
                <div className="w-20 h-20 fantasy-avatar text-2xl mx-auto">
                  {kingInitial}
                </div>
              )}
            </button>
            <p className="fantasy-title glow-text text-lg mt-3">
              {reinado.king.displayName}
            </p>
            <p className="text-[var(--color-text-muted)] text-xs">
              @{reinado.king.username}
            </p>
            {reinado.king.realm && (
              <span className="realm-badge mt-2 inline-block">
                {reinado.king.realm}
              </span>
            )}
            <p className="text-[var(--color-text-secondary)] text-sm italic mt-3">
              Elegido entre los más activos del reino... y el favor del azar.
            </p>
          </div>
        ) : (
          <div className="castle-card p-6 mb-6 text-center">
            <p className="fantasy-title text-[var(--color-accent-gold)] text-sm">
              El trono está vacío
            </p>
            <p className="text-[var(--color-text-secondary)] italic text-sm mt-2">
              Cuando haya almas en el reino, se coronará al primer rey.
            </p>
          </div>
        )}

        {/* Decreto real */}
        {esRey && (
          <div className="castle-card p-5 mb-6 border-[var(--color-accent-gold)]">
            <p className="fantasy-title text-[var(--color-accent-gold)] text-sm mb-3">
              ⚜ Emitir Decreto Real
            </p>
            <form onSubmit={emitirDecreto} className="flex flex-col gap-3">
              <textarea
                value={decreto}
                onChange={(e) => setDecreto(e.target.value)}
                placeholder="Proclama tu voluntad ante el reino..."
                className="input-fantasy w-full text-sm py-2 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)] text-xs">
                  {msg}
                </span>
                <button
                  type="submit"
                  disabled={!decreto.trim() || enviando}
                  className="btn-fantasy text-[10px] py-2 px-4"
                >
                  {enviando ? "..." : "Proclamar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Insignias del reino */}
        <div className="castle-card p-5 mb-6">
          <p className="fantasy-title text-[var(--color-accent-gold)] text-sm mb-3">
            Insignias del Reino
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(BADGES).map((b) => (
              <span
                key={b.id}
                title={b.description}
                className="realm-badge cursor-help"
              >
                {b.icon} {b.name}
              </span>
            ))}
          </div>
          <p className="text-[var(--color-text-muted)] text-xs italic mt-3">
            Se ganan viviendo la historia del reino: coronaciones, plagas,
            batallas, festines y profecías.
          </p>
        </div>

        {/* Cronica */}
        <h3 className="fantasy-title text-[var(--color-accent-gold)] text-sm mb-3">
          Crónicas Oscuras
        </h3>
        {eventos.length === 0 ? (
          <div className="castle-card p-8 text-center">
            <p className="text-[var(--color-text-secondary)] italic">
              La historia aún no ha sido escrita...
            </p>
          </div>
        ) : (
          <div className="relative pl-5 border-l border-[var(--color-border-dark)]">
            {eventos.map((ev) => (
              <div key={ev._id} className="mb-4 fade-in relative">
                <span className="absolute -left-[30px] top-4 text-sm">
                  {EVENT_ICONS[ev.type]}
                </span>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2 px-1">
                  <p className="fantasy-title text-[var(--color-accent-gold)] text-sm">
                    {ev.title}
                  </p>
                  <span className="text-[var(--color-text-muted)] text-xs">
                    {new Date(ev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {ev.post && ev.post.author ? (
                  <PostCard post={ev.post} currentUserId={userId} />
                ) : (
                  <div className="castle-card p-4">
                    <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 px-1">
                  {(ev.factions || []).map((f) => (
                    <span key={f._id} className="realm-badge">
                      {f.emblem} {f.name}
                    </span>
                  ))}
                  {ev.involvedUsers.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => router.push(`/usuario?id=${u._id}`)}
                      className="text-[var(--color-text-muted)] text-xs hover:text-[var(--color-accent-gold)] cursor-pointer"
                    >
                      @{u.username}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
