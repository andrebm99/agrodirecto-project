import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "AgroDirecto",
    template: "%s | AgroDirecto",
  },
  description: "Del campo a tu negocio, sin tantos intermediarios. Prototipo académico UTP 2026.",
  openGraph: {
    title: "AgroDirecto",
    description: "Del campo a tu negocio, sin tantos intermediarios.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AgroDirecto" }],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroDirecto",
    description: "Del campo a tu negocio, sin tantos intermediarios.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
