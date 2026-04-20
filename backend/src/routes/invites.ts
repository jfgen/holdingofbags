import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error";
import { requireAuth } from "../middleware/auth";
import { isValidEmoji } from "../lib/emojis";

export const invitesRouter = Router();

invitesRouter.get("/:token", async (req, res, next) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: req.params.token },
      include: { group: true },
    });
    if (!invite) throw new HttpError(404, "invite not found");
    if (invite.status !== "PENDING") throw new HttpError(410, "invite no longer valid");
    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      throw new HttpError(410, "invite expired");
    }
    res.json({ groupId: invite.groupId, groupName: invite.group.name, expiresAt: invite.expiresAt });
  } catch (e) {
    next(e);
  }
});

const joinSchema = z.object({
  characterName: z.string().min(1).max(64),
  characterEmoji: z.string().refine(isValidEmoji, "invalid emoji"),
});

invitesRouter.post("/:token/join", requireAuth, async (req, res, next) => {
  try {
    const body = joinSchema.parse(req.body);
    const invite = await prisma.invite.findUnique({ where: { token: req.params.token } });
    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      throw new HttpError(410, "invite no longer valid");
    }
    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.userId!, groupId: invite.groupId } },
    });
    if (existing) throw new HttpError(409, "already a member of this group");
    const member = await prisma.$transaction(async (tx) => {
      const m = await tx.groupMember.create({
        data: {
          userId: req.userId!, groupId: invite.groupId,
          characterName: body.characterName, characterEmoji: body.characterEmoji,
        },
      });
      await tx.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
      return m;
    });
    res.status(201).json({ member, groupId: invite.groupId });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
