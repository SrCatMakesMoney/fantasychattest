import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FantasyChat - Dark Realm Social",
  description: "A dark fantasy social network from the shadows of the castle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen castle-bg antialiased">{children}</body>
    </html>
  );
}
