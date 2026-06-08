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

const REALMS = [
  "Fortaleza de Sombras",
  "Cripta del Silencio",
  "Torre de los Caidos",
  "Bosque Maldito",
  "Abismo Eterno",
  "Catedral de Huesos",
  "Pantano de las Almas",
  "Ciudadela del Ocaso",
  "Mazmorras del Olvido",
  "Trono de Cenizas",
];

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editRealm, setEditRealm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

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

  const startEditing = () => {
    if (!user) return;
    setEditName(user.displayName);
    setEditBio(user.bio);
    setEditRealm(user.realm);
    setEditing(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editName,
          bio: editBio,
          realm: editRealm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
        setSaveMsg("Perfil actualizado");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        const data = await res.json();
        setSaveMsg(data.error || "Error al guardar");
      }
    } catch {
      setSaveMsg("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="castle-card p-8 fade-in">
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 fantasy-avatar text-2xl flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[var(--color-accent-gold)] fantasy-title text-[10px] mb-1 tracking-wider">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-fantasy text-sm"
                      maxLength={50}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="fantasy-title glow-text text-xl">
                    {user.displayName}
                  </h1>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1">
                    @{user.username}
                  </p>
                </>
              )}
            </div>
            {!editing && (
              <button
                onClick={startEditing}
                className="btn-fantasy text-[10px] py-2 px-4"
              >
                Editar
              </button>
            )}
          </div>

          <hr className="fantasy-divider mb-6" />

          {/* Reino */}
          <div className="mb-6">
            <label className="block text-[var(--color-accent-gold)] fantasy-title text-[10px] mb-2 tracking-wider">
              Reino
            </label>
            {editing ? (
              <div className="grid grid-cols-2 gap-2">
                {REALMS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditRealm(r)}
                    className={`text-left p-3 border text-sm transition-all ${
                      editRealm === r
                        ? "border-[var(--color-accent-gold)] bg-[var(--color-bg-hover)] text-[var(--color-accent-gold)]"
                        : "border-[var(--color-border-dark)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-glow)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <input
                  type="text"
                  value={editRealm}
                  onChange={(e) => setEditRealm(e.target.value)}
                  placeholder="O escribe tu propio reino..."
                  className="input-fantasy text-sm col-span-2"
                  maxLength={50}
                />
              </div>
            ) : (
              <span className="realm-badge">{user.realm}</span>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-[var(--color-accent-gold)] fantasy-title text-[10px] mb-2 tracking-wider">
              Credo oscuro
            </label>
            {editing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="input-fantasy text-sm resize-none h-24"
                maxLength={200}
                placeholder="Escribe tu destino..."
              />
            ) : (
              <p className="text-[var(--color-text-secondary)] italic leading-relaxed">
                &ldquo;{user.bio}&rdquo;
              </p>
            )}
          </div>

          {/* Botones de edicion */}
          {editing && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-fantasy"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text-primary)] transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {saveMsg && (
            <p className={`text-sm mt-3 fade-in ${
              saveMsg.includes("Error") || saveMsg.includes("error")
                ? "text-[var(--color-accent-red)]"
                : "text-[var(--color-accent-green)]"
            }`}>
              {saveMsg}
            </p>
          )}

          {/* Stats decorativos */}
          {!editing && (
            <div className="mt-8 grid grid-cols-3 gap-4">
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
          )}
        </div>

        {/* Salir */}
        <div className="mt-6 text-center">
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
