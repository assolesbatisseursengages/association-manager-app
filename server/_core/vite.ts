import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true as const },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(__dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // dist/index.js est compilé dans dist/
  // Les assets frontend sont dans dist/public/
  // __dirname pointe vers /opt/render/project/src/dist en prod
  const distPath = path.resolve(__dirname, "public");

  console.log("[Static] Serving from:", distPath);

  if (!fs.existsSync(distPath)) {
    // Essayer chemin alternatif
    const altPath = path.resolve(process.cwd(), "dist", "public");
    console.log("[Static] Trying alternative path:", altPath);
    if (fs.existsSync(altPath)) {
      app.use(express.static(altPath));
      app.use("*", (req, res) => {
        if (req.originalUrl.startsWith("/api/")) {
          res.status(404).json({ error: "Not found" });
          return;
        }
        res.sendFile(path.resolve(altPath, "index.html"));
      });
      return;
    }
    console.error("[Static] No build directory found!");
  }

  app.use(express.static(distPath));
  app.use("*", (req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}