const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export type MediaType = "image" | "video" | "raw";

interface UploadResult {
  url: string;
  type: MediaType;
  format: string;
}

function getResourceType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "raw";
  return "raw";
}

export function isCloudinaryConfigured(): boolean {
  return CLOUD_NAME.length > 0 && UPLOAD_PRESET.length > 0;
}

const MAX_INLINE_IMAGE_BYTES = 2 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imagenes o GIF");
  }
  if (isCloudinaryConfigured()) {
    return uploadMedia(file);
  }
  if (file.size > MAX_INLINE_IMAGE_BYTES) {
    throw new Error("La imagen debe pesar menos de 2 MB");
  }
  const url = await fileToDataUrl(file);
  return { url, type: "image", format: file.type.split("/")[1] || "" };
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary no esta configurado");
  }

  const resourceType = getResourceType(file);
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error?.message || "Error al subir archivo");
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    type: resourceType,
    format: data.format,
  };
}

export function getMediaType(url: string): "image" | "video" | "audio" | "unknown" {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)/.test(lower)) return "image";
  if (/\.(mp4|webm|mov|avi|mkv)/.test(lower)) return "video";
  if (/\.(mp3|wav|ogg|flac|aac|m4a)/.test(lower)) return "audio";
  if (lower.includes("/image/upload")) return "image";
  if (lower.includes("/video/upload")) return "video";
  if (lower.includes("/raw/upload")) return "audio";
  return "unknown";
}
