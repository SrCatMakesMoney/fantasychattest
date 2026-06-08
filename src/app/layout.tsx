import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FantasyChat - Reino Oscuro",
  description: "Red social dark fantasy desde las sombras del castillo",
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
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen castle-bg antialiased">{children}</body>
    </html>
  );
}
