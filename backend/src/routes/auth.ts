import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { signToken } from "../lib/jwt";
import { HttpError } from "../middleware/error";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(32),
  email: z.string().email(),
  password: z.string().min(8),
});

function publicUser(u: { id: string; username: string; email: string; createdAt: Date }) {
  return { id: u.id, username: u.username, email: u.email, createdAt: u.createdAt };
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) throw new HttpError(409, "username or email already in use");
    const user = await prisma.user.create({
      data: { username: body.username, email: body.email, passwordHash: await hashPassword(body.password) },
    });
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new HttpError(401, "invalid credentials");
    }
    res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) throw new HttpError(404, "user not found");
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
