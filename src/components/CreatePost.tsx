"use client";

import { useState } from "react";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent("");
        onPostCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to cast your message into the void");
      }
    } catch {
      setError("The dark realm rejected your message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="castle-card rounded-lg p-4 mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Whisper into the dark realm..."
        className="input-fantasy resize-none h-24"
        maxLength={500}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-[var(--color-text-muted)] text-xs">
          {content.length}/500
        </span>
        {error && (
          <span className="text-[var(--color-accent-red)] text-xs">{error}</span>
        )}
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="btn-fantasy"
        >
          {loading ? "Casting..." : "⚔️ Proclaim"}
        </button>
      </div>
    </form>
  );
}
