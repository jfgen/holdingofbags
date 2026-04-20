import express, { Express } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { groupsRouter } from "./routes/groups";
import { invitesRouter } from "./routes/invites";
import { errorHandler } from "./middleware/error";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);
  app.use("/api/groups", groupsRouter);
  app.use("/api/invites", invitesRouter);
  app.use(errorHandler);
  return app;
}
