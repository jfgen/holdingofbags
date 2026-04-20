import { RequestHandler } from "express";
import { verifyToken } from "../lib/jwt";
import { HttpError } from "./error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) {
    return next(new HttpError(401, "missing bearer token"));
  }
  try {
    const { userId } = verifyToken(header.slice(7));
    req.userId = userId;
    next();
  } catch {
    next(new HttpError(401, "invalid or expired token"));
  }
};
