"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import CreatePost from "@/components/CreatePost";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  realm: string;
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

export default function MuroPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/publicaciones");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.publicaciones);
      }
    } catch {
      // network error, keep existing posts
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setAuthChecking(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const handlePostCreated = useCallback(async () => {
    await fetchPosts();
    setTimeout(fetchPosts, 1500);
  }, [fetchPosts]);

  const handleMessageUser = (userId: string) => {
    router.push(`/mensajes?con=${userId}`);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow">
          Abriendo las puertas del castillo...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="fantasy-title glow-text text-xl mb-1">
            Muro del Reino
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm italic">
            Proclamaciones de las tierras oscuras
          </p>
          <div className="ornament mt-4">
            <span className="ornament-diamond" />
          </div>
        </div>

        <CreatePost onPostCreated={handlePostCreated} />

        {loadingPosts ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)] pulse-glow italic">
              Invocando mensajes del vacio...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="castle-card p-10 text-center">
            <p className="fantasy-title text-[var(--color-accent-gold)] text-sm mb-2">
              Silencio en el Reino
            </p>
            <p className="text-[var(--color-text-secondary)] italic">
              Se el primero en romper la oscuridad.
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.id || ""}
                onMessageUser={handleMessageUser}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
