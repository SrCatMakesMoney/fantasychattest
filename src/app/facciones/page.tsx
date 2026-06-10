"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FactionChat from "@/components/FactionChat";

interface Member {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Faccion {
  _id: string;
  name: string;
  motto: string;
  emblem: string;
  leader: Member;
  members: Member[];
  influence: number;
  enGuerraCooldown: boolean;
  createdAt: string;
}

const EMBLEMS = ["⚑", "☠", "⚔", "♛", "☽", "✠", "⚜", "♜"];

export default function FaccionesPage() {
  const router = useRouter();
  const [facciones, setFacciones] = useState<Faccion[]>([]);
  const [miFaccion, setMiFaccion] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [emblem, setEmblem] = useState(EMBLEMS[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchFacciones = useCallback(async () => {
    try {
      const res = await fetch("/api/facciones");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setFacciones(data.facciones);
        setMiFaccion(data.miFaccion);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

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
    fetchFacciones();
  }, [router, fetchFacciones]);

  const accion = async (fn: () => Promise<Response>) => {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fn();
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Algo salió mal en los reinos");
      } else if (data.resultado) {
        setMsg(
          `La guerra ha terminado: ${data.resultado.winner.name} se alza victoriosa sobre ${data.resultado.loser.name}.`
        );
      }
      await fetchFacciones();
    } finally {
      setBusy(false);
    }
  };

  const crearFaccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    accion(() =>
      fetch("/api/facciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, motto, emblem }),
      })
    ).then(() => {
      setCreating(false);
      setName("");
      setMotto("");
    });
  };

  const unirse = (factionId: string) =>
    accion(() =>
      fetch("/api/facciones/miembros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factionId }),
      })
    );

  const abandonar = () =>
    accion(() => fetch("/api/facciones/miembros", { method: "DELETE" }));

  const declararGuerra = (factionId: string) =>
    accion(() =>
      fetch("/api/facciones/guerra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factionId }),
      })
    );

  const mia = facciones.find((f) => f._id === miFaccion);
  const soyLider = mia && mia.leader && mia.leader._id === userId;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
            Reuniendo a los estandartes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="fantasy-title glow-text text-xl mb-1">
            Facciones del Reino
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm italic">
            Alza tu estandarte, jura lealtad y conquista las Crónicas Oscuras
          </p>
          <div className="ornament mt-4">
            <span className="ornament-diamond" />
          </div>
        </div>

        {msg && (
          <div className="castle-card p-4 mb-4 border-[var(--color-accent-gold)]">
            <p className="text-[var(--color-text-primary)] text-sm italic">
              {msg}
            </p>
          </div>
        )}

        {/* Crear faccion */}
        {!miFaccion && (
          <div className="castle-card p-5 mb-6">
            {!creating ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-[var(--color-text-secondary)] text-sm italic">
                  Aún no has jurado lealtad a ningún estandarte.
                </p>
                <button
                  onClick={() => setCreating(true)}
                  className="btn-fantasy text-[10px] py-2 px-4"
                >
                  Fundar facción
                </button>
              </div>
            ) : (
              <form onSubmit={crearFaccion} className="flex flex-col gap-3">
                <p className="fantasy-title text-[var(--color-accent-gold)] text-sm">
                  Fundar nueva facción
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre de la facción..."
                  className="input-fantasy text-sm"
                  maxLength={40}
                />
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Lema (opcional)..."
                  className="input-fantasy text-sm"
                  maxLength={120}
                />
                <div className="flex flex-wrap gap-2">
                  {EMBLEMS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmblem(em)}
                      className={`w-9 h-9 text-lg cursor-pointer border rounded ${
                        emblem === em
                          ? "border-[var(--color-accent-gold)] text-[var(--color-accent-gold)]"
                          : "border-[var(--color-border-dark)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="btn-ghost text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || busy}
                    className="btn-fantasy text-[10px] py-2 px-4"
                  >
                    {busy ? "..." : "Alzar estandarte"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Chat de mi faccion */}
        {mia && <FactionChat userId={userId} factionName={mia.name} />}

        {/* Lista */}
        {facciones.length === 0 ? (
          <div className="castle-card p-8 text-center">
            <p className="text-[var(--color-text-secondary)] italic">
              Ningún estandarte ondea aún sobre las tierras oscuras...
            </p>
          </div>
        ) : (
          facciones.map((f) => {
            const esMia = f._id === miFaccion;
            const maxInf = Math.max(...facciones.map((x) => x.influence), 1);
            return (
              <div
                key={f._id}
                className={`castle-card rpg-panel p-5 mb-4 fade-in ${
                  esMia ? "border-[var(--color-accent-gold)]" : ""
                }`}
              >
                <span className="rpg-corner rpg-corner-tl" />
                <span className="rpg-corner rpg-corner-tr" />
                <span className="rpg-corner rpg-corner-bl" />
                <span className="rpg-corner rpg-corner-br" />
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="min-w-0">
                    <p className="fantasy-title text-[var(--color-accent-gold)] text-base">
                      {f.emblem} {f.name}
                      {esMia && (
                        <span className="text-[var(--color-text-muted)] text-xs ml-2">
                          (tu facción)
                        </span>
                      )}
                    </p>
                    {f.motto && (
                      <p className="text-[var(--color-text-secondary)] text-sm italic mt-1">
                        &ldquo;{f.motto}&rdquo;
                      </p>
                    )}
                    <p className="text-[var(--color-text-muted)] text-xs mt-2">
                      Líder: @{f.leader?.username} · {f.members.length} miembro
                      {f.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="fantasy-title glow-text text-lg">
                      {f.influence}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-[10px] tracking-widest uppercase">
                      Influencia
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="rpg-bar">
                    <div
                      className="rpg-bar-fill rpg-bar-fill-purple"
                      style={{ width: `${Math.round((f.influence / maxInf) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {f.members.slice(0, 8).map((m) => (
                    <button
                      key={m._id}
                      onClick={() => router.push(`/usuario?id=${m._id}`)}
                      className="text-[var(--color-text-muted)] text-xs hover:text-[var(--color-accent-gold)] cursor-pointer"
                    >
                      @{m.username}
                    </button>
                  ))}
                  {f.members.length > 8 && (
                    <span className="text-[var(--color-text-muted)] text-xs">
                      y {f.members.length - 8} más...
                    </span>
                  )}
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  {!miFaccion && (
                    <button
                      onClick={() => unirse(f._id)}
                      disabled={busy}
                      className="btn-fantasy text-[10px] py-2 px-4"
                    >
                      Jurar lealtad
                    </button>
                  )}
                  {esMia && (
                    <button
                      onClick={abandonar}
                      disabled={busy}
                      className="btn-ghost text-xs"
                    >
                      Abandonar
                    </button>
                  )}
                  {soyLider && !esMia && (
                    <button
                      onClick={() => declararGuerra(f._id)}
                      disabled={busy || f.enGuerraCooldown || mia?.enGuerraCooldown}
                      className="btn-fantasy text-[10px] py-2 px-4"
                      title={
                        f.enGuerraCooldown || mia?.enGuerraCooldown
                          ? "Las huestes aún se recuperan de la última batalla"
                          : "El resultado lo decide la influencia... y el azar"
                      }
                    >
                      {f.enGuerraCooldown || mia?.enGuerraCooldown
                        ? "En tregua"
                        : "Declarar guerra"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        <p className="text-[var(--color-text-muted)] text-xs italic mt-6 text-center">
          La influencia se forja con la actividad semanal de los miembros:
          publicaciones, likes recibidos y comentarios. Las guerras se libran en
          las Crónicas Oscuras.
        </p>
      </main>
    </div>
  );
}
