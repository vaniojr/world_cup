import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "World Cup Predictor | FIFA 2026",
    short_name: "WC 2026",
    description: "Acompanhe e preveja os jogos da FIFA World Cup 2026 com Inteligência Artificial",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#111827",
    theme_color: "#1e40af",
    categories: ["sports", "entertainment"],
    icons: [
      { src: "/api/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [],
  };
}
