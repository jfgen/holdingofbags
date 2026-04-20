import { Router } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error";

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
