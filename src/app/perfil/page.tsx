"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { uploadMedia, isCloudinaryConfigured } from "@/lib/cloudinary";
import { getBadge } from "@/lib/badges";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  realm: string;
  badges?: string[];
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryReady = isCloudinaryConfigured();

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

  const updateProfile = async (updates: Record<string, string>) => {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveMsg("");

    try {
      const ok = await updateProfile({
        displayName: editName,
        bio: editBio,
        realm: editRealm,
      });
      if (ok) {
        setEditing(false);
        setSaveMsg("Perfil actualizado");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg("Error al guardar");
      }
    } catch {
      setSaveMsg("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadMedia(file);
      await updateProfile({ avatar: result.url });
    } catch {
      setSaveMsg("Error al subir imagen");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const result = await uploadMedia(file);
      await updateProfile({ banner: result.url });
    } catch {
      setSaveMsg("Error al subir banner");
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setUploadingBanner(false);
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
        <div className="castle-card fade-in overflow-hidden">
          {/* Banner */}
          <div className="relative h-40 sm:h-52 bg-gradient-to-br from-[#1a1030] via-[#2a1845] to-[#0f0a1a] overflow-hidden">
            {user.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="120" height="60" viewBox="0 0 120 60" className="opacity-10">
                  <path d="M10 50 L20 20 L30 35 L40 15 L50 30 L60 10 L70 25 L80 18 L90 35 L100 20 L110 50 Z" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" />
                  <path d="M55 55 L60 40 L65 55" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" />
                  <rect x="57" y="40" width="6" height="3" fill="none" stroke="var(--color-accent-gold)" strokeWidth="0.5" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />

            {cloudinaryReady && (
              <>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="absolute top-3 right-3 btn-ghost text-xs bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
                >
                  {uploadingBanner ? "Subiendo..." : "Cambiar banner"}
                </button>
              </>
            )}
          </div>

          {/* Avatar + Info */}
          <div className="px-6 sm:px-8 pb-8 -mt-12 relative z-10">
            <div className="flex items-end gap-4 mb-6">
              <div className="relative">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-24 h-24 rounded-full border-4 border-[var(--color-bg-card)] object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 fantasy-avatar text-2xl border-4 border-[var(--color-bg-card)] shadow-lg">
                    {initial}
                  </div>
                )}
                {cloudinaryReady && (
                  <>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--color-accent-purple)] border-2 border-[var(--color-bg-card)] flex items-center justify-center text-white text-xs hover:bg-[var(--color-border-glow)] transition-colors shadow-lg"
                      title="Cambiar avatar"
                    >
                      {uploadingAvatar ? (
                        <span className="pulse-glow">...</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 10l8-8 3 3-8 8H1v-3z" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div>
                    <label className="block text-[var(--color-text-secondary)] fantasy-title text-[9px] mb-1 tracking-wider uppercase">
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
                ) : (
                  <>
                    <h1 className="fantasy-title glow-text text-xl truncate">
                      {user.displayName}
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-sm">
                      @{user.username}
                    </p>
                  </>
                )}
              </div>
              {!editing && (
                <button onClick={startEditing} className="btn-fantasy text-[10px] py-2 px-4 flex-shrink-0">
                  Editar
                </button>
              )}
            </div>

            <hr className="fantasy-divider mb-6" />

            {/* Reino */}
            <div className="mb-6">
              <label className="block text-[var(--color-text-secondary)] fantasy-title text-[9px] mb-2 tracking-wider uppercase">
                Reino
              </label>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  {REALMS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setEditRealm(r)}
                      className={`text-left p-2.5 border text-sm transition-all rounded ${
                        editRealm === r
                          ? "border-[var(--color-accent-gold)] bg-[var(--color-bg-hover)] text-[var(--color-accent-gold)]"
                          : "border-[var(--color-border-dark)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-glow)]"
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

            {user.badges && user.badges.length > 0 && (
              <div className="mb-6">
                <label className="block text-[var(--color-text-secondary)] fantasy-title text-[9px] mb-2 tracking-wider uppercase">
                  Insignias
                </label>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badgeId) => {
                    const badge = getBadge(badgeId);
                    if (!badge) return null;
                    return (
                      <span
                        key={badgeId}
                        title={badge.description}
                        className="realm-badge cursor-help"
                      >
                        {badge.icon} {badge.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-[var(--color-text-secondary)] fantasy-title text-[9px] mb-2 tracking-wider uppercase">
                Credo Oscuro
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

            {/* Botones edicion */}
            {editing && (
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-fantasy">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-ghost text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}

            {saveMsg && (
              <p className={`text-sm mt-3 fade-in ${
                saveMsg.toLowerCase().includes("error")
                  ? "text-[var(--color-accent-red)]"
                  : "text-[var(--color-accent-green)]"
              }`}>
                {saveMsg}
              </p>
            )}

            {/* Stats */}
            {!editing && (
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="text-center castle-card p-4">
                  <div className="text-[var(--color-accent-gold)] fantasy-title text-lg">
                    &infin;
                  </div>
                  <div className="text-[var(--color-text-muted)] text-xs mt-1">Poder</div>
                </div>
                <div className="text-center castle-card p-4">
                  <div className="text-[var(--color-accent-purple)] fantasy-title text-lg">
                    &dagger;
                  </div>
                  <div className="text-[var(--color-text-muted)] text-xs mt-1">Guerrero</div>
                </div>
                <div className="text-center castle-card p-4">
                  <div className="text-[var(--color-accent-red)] fantasy-title text-lg">
                    &sect;
                  </div>
                  <div className="text-[var(--color-text-muted)] text-xs mt-1">Guardian</div>
                </div>
              </div>
            )}
          </div>
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
