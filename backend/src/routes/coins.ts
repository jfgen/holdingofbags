import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireMembership } from "../middleware/membership";
import { HttpError } from "../middleware/error";

type GroupParams = { groupId: string };

export const coinsRouter = Router({ mergeParams: true });
coinsRouter.use(requireAuth, requireMembership);

const coinInt = z.number().int().min(0);
const schema = z.object({
  platinum: coinInt.optional(),
  electrum: coinInt.optional(),
  gold: coinInt.optional(),
  silver: coinInt.optional(),
  copper: coinInt.optional(),
});

coinsRouter.patch<GroupParams>("/", async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const coins = await prisma.groupCoins.update({
      where: { groupId: req.params.groupId },
      data: body,
    });
    res.json({ coins });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
