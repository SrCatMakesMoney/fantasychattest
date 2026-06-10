"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadPostMedia } from "@/lib/cloudinary";

interface ChatAuthor {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  cosmeticos?: { marco?: string; titulo?: string; colorNombre?: string };
}

interface ChatMsg {
  _id: string;
  author: ChatAuthor;
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "";
  createdAt: string;
}

export default function FactionChat({
  userId,
  factionName,
}: {
  userId: string;
  factionName: string;
}) {
  const router = useRouter();
  const [mensajes, setMensajes] = useState<ChatMsg[]>([]);
  const [texto, setTexto] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "">("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstLoad = useRef(true);

  const fetchMensajes = useCallback(async () => {
    try {
      const res = await fetch("/api/facciones/chat");
      if (res.ok) {
        const data = await res.json();
        setMensajes(data.mensajes);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 5000);
    return () => clearInterval(interval);
  }, [fetchMensajes]);

  useEffect(() => {
    if (mensajes.length === 0) return;
    bottomRef.current?.scrollIntoView({
      behavior: firstLoad.current ? "auto" : "smooth",
    });
    firstLoad.current = false;
  }, [mensajes.length]);

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
      const result = await uploadPostMedia(file);
      setMediaUrl(result.url);
      setMediaType(result.type);
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

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!texto.trim() && !mediaUrl) || sending || uploading) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/facciones/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: texto, mediaUrl, mediaType }),
      });
      if (res.ok) {
        setTexto("");
        removeMedia();
        await fetchMensajes();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo enviar");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="castle-card rpg-panel mb-6 fade-in">
      <span className="rpg-corner rpg-corner-tl" />
      <span className="rpg-corner rpg-corner-tr" />
      <span className="rpg-corner rpg-corner-bl" />
      <span className="rpg-corner rpg-corner-br" />

      <div className="px-4 pt-4">
        <p className="fantasy-title text-[var(--color-accent-gold)] text-sm">
          Sala de guerra de {factionName}
        </p>
        <p className="text-[var(--color-text-muted)] text-xs italic">
          Solo los miembros de tu facción pueden leer estos susurros
        </p>
      </div>

      <div className="h-[45vh] overflow-y-auto scrollbar-dark p-4">
        {loading ? (
          <p className="text-[var(--color-text-muted)] fantasy-title text-sm pulse-glow text-center mt-8">
            Descifrando los mensajes de la facción...
          </p>
        ) : mensajes.length === 0 ? (
          <p className="text-[var(--color-text-secondary)] italic text-center mt-8">
            La sala de guerra está vacía... traza el primer plan.
          </p>
        ) : (
          mensajes.map((m) => {
            const propio = m.author?._id === userId;
            const cos = m.author?.cosmeticos;
            const initial = m.author?.displayName?.[0]?.toUpperCase() || "?";
            return (
              <div key={m._id} className="flex items-start gap-3 mb-4">
                <button
                  onClick={() =>
                    m.author && router.push(`/usuario?id=${m.author._id}`)
                  }
                  className="flex-shrink-0 cursor-pointer"
                >
                  {m.author?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.author.avatar}
                      alt={m.author.displayName}
                      className={`w-9 h-9 rounded-full border-2 border-[var(--color-accent-gold)] object-cover ${cos?.marco || ""}`}
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 fantasy-avatar text-xs ${cos?.marco || ""}`}
                    >
                      {initial}
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`fantasy-title text-xs ${
                        propio
                          ? "text-[var(--color-accent-gold)]"
                          : "text-[var(--color-text-primary)]"
                      }`}
                      style={
                        cos?.colorNombre ? { color: cos.colorNombre } : undefined
                      }
                    >
                      {m.author?.displayName || "Forastero"}
                    </span>
                    {cos?.titulo && (
                      <span className="text-[var(--color-accent-purple)] text-[10px] italic">
                        {cos.titulo}
                      </span>
                    )}
                    <span className="text-[var(--color-text-muted)] text-[10px]">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {m.content && (
                    <p className="text-[var(--color-text-primary)] text-sm mt-0.5 leading-relaxed break-words">
                      {m.content}
                    </p>
                  )}
                  {m.mediaUrl && m.mediaType === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.mediaUrl}
                      alt="Imagen"
                      className="max-h-48 media-frame mt-2"
                    />
                  )}
                  {m.mediaUrl && m.mediaType === "video" && (
                    <video
                      src={m.mediaUrl}
                      controls
                      className="max-h-48 media-frame mt-2"
                    />
                  )}
                  {m.mediaUrl && m.mediaType === "audio" && (
                    <div className="media-frame p-2 mt-2">
                      <audio src={m.mediaUrl} controls className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {mediaUrl && (
        <div className="px-3 pb-1 relative inline-block">
          {mediaType === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="Vista previa" className="max-h-24 media-frame" />
          )}
          {mediaType === "video" && (
            <video src={mediaUrl} controls className="max-h-24 media-frame" />
          )}
          {mediaType === "audio" && (
            <div className="media-frame p-2">
              <audio src={mediaUrl} controls className="w-full" />
            </div>
          )}
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-0 right-1 bg-[var(--color-accent-red)] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-black shadow-lg hover:scale-110 transition-transform"
          >
            X
          </button>
        </div>
      )}

      {error && (
        <p className="text-[var(--color-accent-red)] text-xs px-3 pb-1">{error}</p>
      )}

      <form
        onSubmit={enviar}
        className="flex gap-2 items-center p-3 border-t border-[var(--color-border-dark)]"
      >
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
          className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors text-xs flex-shrink-0"
          title="Adjuntar imagen, video o audio"
        >
          {uploading ? <span className="pulse-glow">...</span> : "Adjuntar"}
        </button>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Susurra a tu facción..."
          className="input-fantasy flex-1 text-sm py-2"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={(!texto.trim() && !mediaUrl) || sending || uploading}
          className="btn-fantasy text-[10px] py-2 px-4 flex-shrink-0"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
