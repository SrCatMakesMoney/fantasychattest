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
  likes: string[];
  createdAt: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const handleMessageUser = (userId: string) => {
    router.push(`/messages?with=${userId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-[family-name:var(--font-family-gothic)]">
          Opening the castle gates...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="font-[family-name:var(--font-family-gothic)] text-xl font-bold glow-text text-[var(--color-accent-gold)] mb-1">
            📜 Realm Feed
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm">
            Proclamations from across the dark lands
          </p>
        </div>

        <CreatePost onPostCreated={fetchPosts} />

        {loading ? (
          <div className="text-center py-8">
            <p className="text-[var(--color-text-muted)]">
              Summoning messages from the void...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="castle-card rounded-lg p-8 text-center">
            <p className="text-[var(--color-text-muted)] text-lg">🏰</p>
            <p className="text-[var(--color-text-secondary)] mt-2">
              The realm is silent. Be the first to break the darkness.
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user.id}
                onMessageUser={handleMessageUser}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
