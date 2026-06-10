"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { getBadge } from "@/lib/badges";

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  realm: string;
  badges?: string[];
  createdAt: string;
}

interface PostAuthor {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  realm: string;
}

interface Post {
  _id: string;
  author: PostAuthor;
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
  likes: string[];
  createdAt: string;
}

function UsuarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setCurrentUserId(data.user.id);
    };
    fetchMe();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/usuarios/perfil?id=${userId}`);
        if (!res.ok) {
          setError("No se encontro el alma");
          return;
        }
        const data = await res.json();
        setProfile(data.usuario);
        setPosts(data.publicaciones);
        setTotalPosts(data.totalPublicaciones);
      } catch {
        setError("Error de conexion");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading || !currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
          Buscando alma en los reinos...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="fantasy-title text-[var(--color-accent-red)] text-lg">
            {error || "Alma no encontrada"}
          </p>
          <button onClick={() => router.back()} className="btn-ghost mt-4 text-sm">
            Volver
          </button>
        </main>
      </div>
    );
  }

  if (profile.id === currentUserId) {
    router.push("/perfil");
    return null;
  }

  const initial = profile.displayName?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="castle-card fade-in overflow-hidden">
          {/* Banner */}
          <div className="relative h-36 sm:h-48 bg-gradient-to-br from-[#1a1030] via-[#2a1845] to-[#0f0a1a] overflow-hidden">
            {profile.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="120" height="60" viewBox="0 0 120 60" className="opacity-10">
                  <path d="M10 50 L20 20 L30 35 L40 15 L50 30 L60 10 L70 25 L80 18 L90 35 L100 20 L110 50 Z" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
          </div>

          {/* Info */}
          <div className="px-6 sm:px-8 pb-8 -mt-10 relative z-10">
            <div className="flex items-end gap-4 mb-5">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-20 h-20 rounded-full border-4 border-[var(--color-bg-card)] object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 fantasy-avatar text-xl border-4 border-[var(--color-bg-card)] shadow-lg">
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="fantasy-title glow-text text-xl truncate">
                  {profile.displayName}
                </h1>
                <p className="text-[var(--color-text-muted)] text-sm">
                  @{profile.username}
                </p>
              </div>
              <button
                onClick={() => router.push(`/mensajes?con=${profile.id}`)}
                className="btn-fantasy text-[10px] py-2 px-4 flex-shrink-0"
              >
                Mensaje
              </button>
            </div>

            {profile.realm && (
              <span className="realm-badge mb-3 inline-block">{profile.realm}</span>
            )}

            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.badges.map((badgeId) => {
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
            )}

            {profile.bio && (
              <p className="text-[var(--color-text-secondary)] italic leading-relaxed mt-3">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-[var(--color-text-muted)]">
              <span>{totalPosts} publicacion{totalPosts !== 1 ? "es" : ""}</span>
            </div>
          </div>
        </div>

        {/* Posts del usuario */}
        {posts.length > 0 && (
          <div className="mt-6">
            <div className="ornament mb-4">
              <span className="ornament-diamond" />
            </div>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                onMessageUser={(id) => router.push(`/mensajes?con=${id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function UsuarioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
            Buscando alma en los reinos...
          </p>
        </div>
      }
    >
      <UsuarioContent />
    </Suspense>
  );
}
