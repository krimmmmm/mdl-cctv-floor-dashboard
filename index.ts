import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routers.js";
import type { TrpcContext } from "./trpc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // tRPC API endpoint
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: ({ req, res }): TrpcContext => ({ req, res }),
    })
  );

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
