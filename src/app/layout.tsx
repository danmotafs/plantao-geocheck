import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plantão GeoCheck",
  description: "MVP para gestão de plantões com reconhecimento por geolocalização.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GeoCheck",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
