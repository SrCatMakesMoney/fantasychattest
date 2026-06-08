"use client";

import { useState, useRef } from "react";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Imagen muy grande (max 2MB)");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const res = await fetch("/api/subir", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        setImagePreview(data.url);
      } else {
        const data = await res.json();
        setError(data.error || "Error al subir imagen");
      }
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImagePreview("");
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
        body: JSON.stringify({ content, image: imageUrl }),
      });

      if (res.ok) {
        setContent("");
        setImageUrl("");
        setImagePreview("");
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
    <form onSubmit={handleSubmit} className="castle-card p-4 mb-4 pixel-fade-in">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Susurra al reino oscuro..."
        className="input-fantasy resize-none h-24"
        maxLength={500}
      />

      {imagePreview && (
        <div className="mt-3 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Vista previa"
            className="max-h-48 border-2 border-[var(--color-border-dark)]"
            style={{ imageRendering: "auto" }}
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-[var(--color-accent-red)] text-white w-6 h-6 flex items-center justify-center text-xs border border-black"
          >
            X
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors text-sm"
            title="Subir imagen"
          >
            {uploading ? "Subiendo..." : "🖼️ Imagen"}
          </button>
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
          {loading ? "..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
