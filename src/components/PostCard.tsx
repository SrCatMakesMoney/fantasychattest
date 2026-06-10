"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getBadge } from "@/lib/badges";

interface PostAuthor {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  realm: string;
  badges?: string[];
}

interface CommentData {
  _id: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  author: PostAuthor;
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
  likes: string[];
  eventType?: "" | "evento" | "decreto" | "coronacion";
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onMessageUser?: (userId: string) => void;
}

export default function PostCard({ post, currentUserId, onMessageUser }: PostCardProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(post.likes.includes(currentUserId));
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

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

  const fetchComments = async () => {
    const res = await fetch(`/api/publicaciones/comentarios?postId=${post._id}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comentarios);
      setCommentsLoaded(true);
    }
  };

  const toggleComments = () => {
    if (!showComments && !commentsLoaded) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      const res = await fetch("/api/publicaciones/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id, content: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        await fetchComments();
      }
    } finally {
      setCommentLoading(false);
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

  const eventLabel =
    post.eventType === "decreto"
      ? "⚜ Decreto Real"
      : post.eventType === "coronacion"
      ? "♛ Coronación"
      : post.eventType === "evento"
      ? "⚔ Suceso del Reino"
      : null;

  return (
    <div
      className={`castle-card p-5 mb-4 fade-in ${
        eventLabel ? "border-[var(--color-accent-gold)]" : ""
      }`}
    >
      {eventLabel && (
        <p className="fantasy-title text-[var(--color-accent-gold)] text-[10px] tracking-widest mb-3">
          {eventLabel}
        </p>
      )}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push(`/usuario?id=${post.author._id}`)}
          className="flex-shrink-0 cursor-pointer"
        >
          {post.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatar}
              alt={post.author.displayName}
              className="w-11 h-11 rounded-full border-2 border-[var(--color-accent-gold)] object-cover shadow-[0_0_8px_rgba(232,184,48,0.3)]"
            />
          ) : (
            <div className="w-11 h-11 fantasy-avatar text-sm">
              {initial}
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push(`/usuario?id=${post.author._id}`)}
              className="fantasy-title text-[var(--color-accent-gold)] text-sm hover:underline cursor-pointer"
            >
              {post.author.displayName}
            </button>
            <button
              onClick={() => router.push(`/usuario?id=${post.author._id}`)}
              className="text-[var(--color-text-muted)] text-xs hover:text-[var(--color-text-secondary)] cursor-pointer"
            >
              @{post.author.username}
            </button>
            <span className="text-[var(--color-text-muted)] text-xs">
              {timeAgoLabel}
            </span>
            {post.author.badges?.map((badgeId) => {
              const badge = getBadge(badgeId);
              if (!badge) return null;
              return (
                <span
                  key={badgeId}
                  title={`${badge.name}: ${badge.description}`}
                  className="text-sm cursor-help"
                >
                  {badge.icon}
                </span>
              );
            })}
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

          {/* Actions */}
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
            <button
              onClick={toggleComments}
              className={`flex items-center gap-2 text-sm transition-colors ${
                showComments
                  ? "text-[var(--color-accent-gold)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h12v8H4l-2 2V3z" />
                <path d="M5 6h6M5 8h4" strokeWidth="1" />
              </svg>
              Comentar
              {comments.length > 0 && ` (${comments.length})`}
            </button>
            {post.author._id !== currentUserId && onMessageUser && (
              <button
                onClick={() => onMessageUser(post.author._id)}
                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-purple)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 2h14v9H5l-4 3V2z" />
                </svg>
                DM
              </button>
            )}
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 border-t border-[var(--color-border-dark)] pt-4 fade-in">
              {comments.map((c) => {
                const cInitial = c.author.displayName?.[0]?.toUpperCase() || "?";
                return (
                  <div key={c._id} className="flex items-start gap-3 mb-3">
                    {c.author.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.author.avatar}
                        alt={c.author.displayName}
                        className="w-7 h-7 rounded-full border border-[var(--color-accent-gold)] object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 fantasy-avatar flex-shrink-0 text-[10px]">
                        {cInitial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="fantasy-title text-[var(--color-accent-gold)] text-xs">
                          {c.author.displayName}
                        </span>
                        <span className="text-[var(--color-text-muted)] text-[10px]">
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-primary)] text-sm mt-0.5 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              <form onSubmit={handleComment} className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="input-fantasy flex-1 text-sm py-2"
                  maxLength={300}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentLoading}
                  className="btn-fantasy text-[10px] py-2 px-3"
                >
                  {commentLoading ? "..." : "Comentar"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
