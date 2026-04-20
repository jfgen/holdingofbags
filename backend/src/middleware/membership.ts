import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "./error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      member?: { id: string; userId: string; groupId: string; characterName: string; characterEmoji: string };
    }
  }
}

export const requireMembership: RequestHandler = async (req, _res, next) => {
  try {
    const groupId = req.params.groupId;
    if (!req.userId) throw new HttpError(401, "unauthenticated");
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.userId, groupId } },
    });
    if (!member) throw new HttpError(403, "not a member of this group");
    req.member = {
      id: member.id, userId: member.userId, groupId: member.groupId,
      characterName: member.characterName, characterEmoji: member.characterEmoji,
    };
    next();
  } catch (e) {
    next(e);
  }
};
