import type { Metadata } from "next";
import AgroDirectoApp from "@/components/AgroDirectoApp";

export const metadata: Metadata = {
  title: "AgroDirecto | Del campo a tu negocio",
  description:
    "Prototipo académico de una plataforma que conecta productores agrícolas con compradores locales.",
};

export default function Home() {
  return <AgroDirectoApp />;
}
