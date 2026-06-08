"use client";

import { useState, useMemo } from "react";

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
  image: string;
  likes: string[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onMessageUser?: (userId: string) => void;
}

export default function PostCard({ post, currentUserId, onMessageUser }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(post.likes.includes(currentUserId));
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch("/api/publicaciones/megusta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setLiked(data.liked);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const timeAgoLabel = useMemo(() => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(post.createdAt).getTime()) / 1000
    );
    if (seconds < 60) return "ahora";
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  }, [post.createdAt]);

  return (
    <div className="castle-card p-4 mb-3 pixel-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 pixel-avatar flex items-center justify-center text-lg flex-shrink-0">
          ⚔️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pixel-title text-[var(--color-accent-gold)] text-[9px]">
              {post.author.displayName}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs">
              @{post.author.username}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs">·</span>
            <span className="text-[var(--color-text-muted)] text-xs">
              {timeAgoLabel}
            </span>
          </div>
          {post.author.realm && (
            <span className="text-[var(--color-accent-purple)] text-xs">
              🏰 {post.author.realm}
            </span>
          )}
          <p className="mt-2 text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
            {post.content}
          </p>
          {post.image && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt="Imagen del post"
                className="max-w-full max-h-80 border-2 border-[var(--color-border-dark)]"
                style={{ imageRendering: "auto" }}
              />
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1 text-sm transition-colors ${
                liked
                  ? "text-[var(--color-accent-red)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
              }`}
            >
              {liked ? "🗡️" : "⚔️"} {likes}
            </button>
            {post.author._id !== currentUserId && onMessageUser && (
              <button
                onClick={() => onMessageUser(post.author._id)}
                className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-purple)] transition-colors"
              >
                💀 Mensaje
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
