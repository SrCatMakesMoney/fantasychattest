"use client";

import { useState, useRef } from "react";
import { uploadMedia, isCloudinaryConfigured, getMediaType } from "@/lib/cloudinary";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "">("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryReady = isCloudinaryConfigured();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("Archivo muy grande (max 20MB)");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const result = await uploadMedia(file);
      setMediaUrl(result.url);
      const detected = getMediaType(result.url);
      setMediaType(detected === "unknown" ? "" : detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    setMediaUrl("");
    setMediaType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mediaUrl, mediaType }),
      });

      if (res.ok) {
        setContent("");
        setMediaUrl("");
        setMediaType("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        onPostCreated();
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo publicar");
      }
    } catch {
      setError("El reino oscuro rechazo tu mensaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="castle-card p-5 mb-5 fade-in">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Proclama tu mensaje al reino..."
        className="input-fantasy resize-none h-24"
        maxLength={500}
      />

      {mediaUrl && (
        <div className="mt-3 relative inline-block">
          {mediaType === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl}
              alt="Vista previa"
              className="max-h-48 media-frame"
            />
          )}
          {mediaType === "video" && (
            <video src={mediaUrl} controls className="max-h-48 media-frame" />
          )}
          {mediaType === "audio" && (
            <div className="media-frame p-3">
              <audio src={mediaUrl} controls className="w-full" />
            </div>
          )}
          <button
            type="button"
            onClick={removeMedia}
            className="absolute -top-2 -right-2 bg-[var(--color-accent-red)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-black shadow-lg hover:scale-110 transition-transform"
          >
            X
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 gap-3">
        <div className="flex items-center gap-4">
          {cloudinaryReady && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors text-sm"
                title="Adjuntar imagen, video o audio"
              >
                {uploading ? (
                  <span className="pulse-glow">Subiendo...</span>
                ) : (
                  "Adjuntar media"
                )}
              </button>
            </>
          )}
          <span className="text-[var(--color-text-muted)] text-xs">
            {content.length}/500
          </span>
        </div>
        {error && (
          <span className="text-[var(--color-accent-red)] text-xs">{error}</span>
        )}
        <button
          type="submit"
          disabled={!content.trim() || loading || uploading}
          className="btn-fantasy"
        >
          {loading ? "Enviando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
