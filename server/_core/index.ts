import "dotenv/config";

// Vérification des variables d'environnement critiques au démarrage
if (process.env.NODE_ENV === "production") {
  if (!process.env.DATABASE_URL) {
    throw new Error("[Config] DATABASE_URL manquant en production — arrêt du serveur");
  }
}

import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  seedDefaultCategories,
  seedDefaultDocuments,
  initializeGlobalSettings,
  cleanupExpiredSessions,
} from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);

    // Initialisation unique au démarrage
    try {
      await initializeGlobalSettings();
      await seedDefaultCategories();
      await seedDefaultDocuments();
      console.log("[Startup] Initialisation terminée");
    } catch (e) {
      console.error("[Startup] Erreur initialisation:", e);
    }

    // Nettoyage sessions expirées au démarrage
    try {
      await cleanupExpiredSessions();
      console.log("[Startup] Sessions expirées nettoyées");
    } catch (e) {
      console.error("[Startup] Erreur nettoyage sessions:", e);
    }

    // Nettoyage périodique toutes les 24h
    setInterval(async () => {
      try {
        await cleanupExpiredSessions();
      } catch (e) {
        console.error("[Cron] Erreur nettoyage sessions:", e);
      }
    }, 24 * 60 * 60 * 1000);
  });
}

startServer().catch(console.error);