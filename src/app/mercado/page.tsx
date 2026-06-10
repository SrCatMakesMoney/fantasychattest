"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CosmeticItem } from "@/lib/mercado";

interface Equipados {
  marco: string;
  titulo: string;
  colorNombre: string;
}

const TIPO_LABEL: Record<string, string> = {
  marco: "Marcos de Avatar",
  titulo: "Títulos",
  color: "Tintas de Nombre",
};

export default function MercadoPage() {
  const router = useRouter();
  const [catalogo, setCatalogo] = useState<CosmeticItem[]>([]);
  const [oro, setOro] = useState(0);
  const [desbloqueados, setDesbloqueados] = useState<string[]>([]);
  const [equipados, setEquipados] = useState<Equipados>({
    marco: "",
    titulo: "",
    colorNombre: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchMercado = async () => {
    const res = await fetch("/api/mercado");
    if (!res.ok) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setCatalogo(data.catalogo);
    setOro(data.oro);
    setDesbloqueados(data.desbloqueados);
    setEquipados(data.equipados);
    setLoading(false);
  };

  useEffect(() => {
    const cargar = async () => {
      await fetchMercado();
    };
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accion = async (body: Record<string, string>, metodo: string) => {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/mercado", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Algo salió mal en las sombras...");
      }
      await fetchMercado();
    } finally {
      setBusy(false);
    }
  };

  const estaEquipado = (item: CosmeticItem) =>
    (item.tipo === "marco" && equipados.marco === item.valor) ||
    (item.tipo === "titulo" && equipados.titulo === item.valor) ||
    (item.tipo === "color" && equipados.colorNombre === item.valor);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
          Descendiendo a los bajos fondos...
        </p>
      </div>
    );
  }

  const tipos: CosmeticItem["tipo"][] = ["marco", "titulo", "color"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-5 fade-in">
          <h1 className="fantasy-title glow-text text-2xl">El Mercado Negro</h1>
          <p className="text-[var(--color-text-secondary)] italic text-sm mt-1">
            Mercancía de dudoso origen para almas con oro de sobra. Nadie hace
            preguntas.
          </p>
          <div className="ornament ornament-diamond mt-3" />
        </div>

        <div className="castle-card rpg-panel p-4 mb-6 text-center fade-in">
          <span className="rpg-corner rpg-corner-tl" />
          <span className="rpg-corner rpg-corner-tr" />
          <span className="rpg-corner rpg-corner-bl" />
          <span className="rpg-corner rpg-corner-br" />
          <p className="rpg-stat-value text-2xl">{oro}</p>
          <p className="rpg-stat-label">Oro disponible</p>
          <p className="text-[var(--color-text-muted)] text-xs mt-2 italic">
            El oro se gana con tu actividad: proclamas, tributos recibidos,
            ecos e insignias.
          </p>
        </div>

        {msg && (
          <p className="text-[var(--color-accent-red)] text-sm text-center mb-4 fade-in">
            {msg}
          </p>
        )}

        {tipos.map((tipo) => (
          <div key={tipo} className="mb-6">
            <div className="ornament ornament-diamond mb-3">
              <span className="fantasy-title text-[var(--color-text-secondary)] text-xs tracking-widest uppercase">
                {TIPO_LABEL[tipo]}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {catalogo
                .filter((c) => c.tipo === tipo)
                .map((item) => {
                  const comprado = desbloqueados.includes(item.id);
                  const equipado = estaEquipado(item);
                  return (
                    <div key={item.id} className="castle-card p-4 fade-in">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="fantasy-title text-sm text-[var(--color-accent-gold)]"
                          style={
                            item.tipo === "color"
                              ? { color: item.valor }
                              : undefined
                          }
                        >
                          {item.nombre}
                        </p>
                        {item.tipo === "marco" && (
                          <span
                            className={`w-6 h-6 rounded-full border-2 inline-block ${item.valor}`}
                          />
                        )}
                      </div>
                      <p className="text-[var(--color-text-secondary)] text-xs italic mt-1">
                        {item.descripcion}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="rpg-stat-value text-sm">
                          {item.precio} oro
                        </span>
                        {!comprado ? (
                          <button
                            onClick={() => accion({ itemId: item.id }, "POST")}
                            disabled={busy || oro < item.precio}
                            className="btn-fantasy text-[9px] py-1.5 px-3"
                          >
                            Comprar
                          </button>
                        ) : equipado ? (
                          <button
                            onClick={() =>
                              accion({ desequipar: item.tipo }, "PATCH")
                            }
                            disabled={busy}
                            className="btn-ghost text-xs"
                          >
                            Equipado · Quitar
                          </button>
                        ) : (
                          <button
                            onClick={() => accion({ itemId: item.id }, "PATCH")}
                            disabled={busy}
                            className="btn-ghost text-xs"
                          >
                            Equipar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
