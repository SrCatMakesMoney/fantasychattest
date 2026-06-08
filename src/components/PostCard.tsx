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
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
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

  const initial = post.author.displayName?.[0]?.toUpperCase() || "?";

  return (
    <div className="castle-card p-5 mb-4 fade-in">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 fantasy-avatar flex-shrink-0 text-sm">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="fantasy-title text-[var(--color-accent-gold)] text-sm">
              {post.author.displayName}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs">
              @{post.author.username}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs">
              {timeAgoLabel}
            </span>
          </div>
          {post.author.realm && (
            <span className="realm-badge mt-1 inline-block">
              {post.author.realm}
            </span>
          )}
          <p className="mt-3 text-[var(--color-text-primary)] whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>

          {post.mediaUrl && post.mediaType === "image" && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.mediaUrl}
                alt="Imagen"
                className="max-w-full max-h-96 media-frame"
              />
            </div>
          )}
          {post.mediaUrl && post.mediaType === "video" && (
            <div className="mt-3">
              <video src={post.mediaUrl} controls className="max-w-full max-h-96 media-frame" />
            </div>
          )}
          {post.mediaUrl && post.mediaType === "audio" && (
            <div className="mt-3 media-frame p-3">
              <audio src={post.mediaUrl} controls className="w-full" />
            </div>
          )}

          <div className="flex items-center gap-5 mt-4">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 text-sm transition-colors ${
                liked
                  ? "text-[var(--color-accent-red)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" />
              </svg>
              {likes}
            </button>
            {post.author._id !== currentUserId && onMessageUser && (
              <button
                onClick={() => onMessageUser(post.author._id)}
                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-purple)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 3h12v8H4l-2 2V3z" />
                </svg>
                Mensaje
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
