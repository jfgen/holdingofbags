import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireMembership } from "../middleware/membership";
import { HttpError } from "../middleware/error";
import { isValidEmoji } from "../lib/emojis";

export const groupsRouter = Router();
groupsRouter.use(requireAuth);

const createSchema = z.object({
  groupName: z.string().min(1).max(64),
  characterName: z.string().min(1).max(64),
  characterEmoji: z.string().refine(isValidEmoji, "invalid emoji"),
});

groupsRouter.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const group = await prisma.group.create({
      data: {
        name: body.groupName,
        founderId: req.userId!,
        members: { create: { userId: req.userId!, characterName: body.characterName, characterEmoji: body.characterEmoji } },
        coins: { create: {} },
      },
      include: { members: true, coins: true },
    });
    res.status(201).json({ group });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

groupsRouter.get("/", async (req, res, next) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.userId! },
      include: { group: true },
      orderBy: { joinedAt: "desc" },
    });
    res.json({ groups: memberships.map((m) => m.group) });
  } catch (e) {
    next(e);
  }
});

groupsRouter.get("/:groupId", requireMembership, async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.groupId },
      include: { members: true, coins: true },
    });
    if (!group) throw new HttpError(404, "group not found");
    res.json({ group });
  } catch (e) {
    next(e);
  }
});
