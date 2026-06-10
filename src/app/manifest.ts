import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fantasy X - Red Social Dark Fantasy",
    short_name: "Fantasy X",
    description:
      "La red social de los reinos oscuros. Comparte proclamaciones, forja alianzas y susurra en la sombra.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0612",
    theme_color: "#0f0a1a",
    lang: "es",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
