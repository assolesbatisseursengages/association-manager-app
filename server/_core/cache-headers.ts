import express from "express";
import path from "path";

// Ajouter des headers de cache pour améliorer la performance
export function addCacheHeaders(app: express.Application) {
  // Déterminer le chemin des fichiers statiques selon l'environnement
  const staticPath = process.env.NODE_ENV === "development" 
    ? "dist/public" 
    : path.resolve(import.meta.dirname, "../..", "dist/public");

  // Cache les fichiers statiques
  app.use(express.static(staticPath, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        // Ne pas cacher les fichiers HTML
        res.setHeader("Cache-Control", "no-cache");
      } else if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
        // Cache agressif pour JS/CSS
        res.setHeader("Cache-Control", "public, max-age=31536000");
      } else if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        // Cache pour les images
        res.setHeader("Cache-Control", "public, max-age=2592000");
      }
    }
  }));
}
