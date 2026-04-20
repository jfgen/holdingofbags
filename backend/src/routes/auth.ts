import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { signToken } from "../lib/jwt";
import { HttpError } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import { isValidEmoji } from "../lib/emojis";

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

const registerInviteSchema = z.object({
  token: z.string().min(10),
  username: z.string().min(2).max(32),
  email: z.string().email(),
  password: z.string().min(8),
  characterName: z.string().min(1).max(64),
  characterEmoji: z.string().refine(isValidEmoji, "invalid emoji"),
});

authRouter.post("/register/invite", async (req, res, next) => {
  try {
    const body = registerInviteSchema.parse(req.body);
    const invite = await prisma.invite.findUnique({ where: { token: body.token } });
    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      throw new HttpError(410, "invite no longer valid");
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) throw new HttpError(409, "username or email already in use");

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { username: body.username, email: body.email, passwordHash },
      });
      await tx.groupMember.create({
        data: {
          userId: created.id, groupId: invite.groupId,
          characterName: body.characterName, characterEmoji: body.characterEmoji,
        },
      });
      await tx.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
      return created;
    });
    res.status(201).json({
      token: signToken(user.id),
      user: publicUser(user),
      groupId: invite.groupId,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
