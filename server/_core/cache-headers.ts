import express from "express";

// Ajouter des headers de cache pour améliorer la performance
export function addCacheHeaders(app: express.Application) {
  // Cache les fichiers statiques pendant 1 jour
  app.use(express.static("dist/public", {
    maxAge: "1d",
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        // Ne pas cacher les fichiers HTML
        res.setHeader("Cache-Control", "no-cache");
      } else if (path.endsWith(".js") || path.endsWith(".css")) {
        // Cache agressif pour JS/CSS
        res.setHeader("Cache-Control", "public, max-age=31536000");
      } else if (path.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        // Cache pour les images
        res.setHeader("Cache-Control", "public, max-age=2592000");
      }
    }
  }));
}
