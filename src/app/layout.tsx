import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fantasychat.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Fantasy X - Red Social Dark Fantasy",
    template: "%s | Fantasy X",
  },
  description:
    "La red social de los reinos oscuros. Comparte proclamaciones, forja alianzas y susurra en la sombra. Estilo medieval fantasy con mensajes, perfiles y mas.",
  keywords: [
    "red social",
    "dark fantasy",
    "medieval",
    "chat",
    "mensajes",
    "fantasy",
    "rpg",
    "social network",
  ],
  authors: [{ name: "Fantasy X" }],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: BASE_URL,
    siteName: "Fantasy X",
    title: "Fantasy X - Red Social Dark Fantasy",
    description:
      "La red social de los reinos oscuros. Comparte proclamaciones, forja alianzas y susurra en la sombra.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasy X - Red Social Dark Fantasy",
    description:
      "La red social de los reinos oscuros. Comparte proclamaciones, forja alianzas y susurra en la sombra.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fantasy X",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen castle-bg antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
