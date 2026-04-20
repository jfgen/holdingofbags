import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireMembership } from "../middleware/membership";
import { HttpError } from "../middleware/error";

type GroupParams = { groupId: string };
type ItemParams = GroupParams & { itemId: string };

export const itemsRouter = Router({ mergeParams: true });
itemsRouter.use(requireAuth, requireMembership);

const createSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(1024).optional().default(""),
  amount: z.number().int().min(1).optional().default(1),
  value: z.union([z.string(), z.number()]).optional().default(0),
  memberId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(1024).optional(),
  amount: z.number().int().min(1).optional(),
  value: z.union([z.string(), z.number()]).optional(),
});

async function loadItem(groupId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.groupId !== groupId) throw new HttpError(404, "item not found");
  return item;
}

itemsRouter.get<GroupParams>("/", async (req, res, next) => {
  try {
    const items = await prisma.item.findMany({
      where: { groupId: req.params.groupId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

itemsRouter.post<GroupParams>("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    if (body.memberId) {
      const member = await prisma.groupMember.findUnique({ where: { id: body.memberId } });
      if (!member || member.groupId !== req.params.groupId) throw new HttpError(400, "invalid memberId");
    }
    const item = await prisma.item.create({
      data: {
        groupId: req.params.groupId,
        memberId: body.memberId ?? null,
        name: body.name,
        description: body.description,
        amount: body.amount,
        value: String(body.value),
      },
    });
    res.status(201).json({ item });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

itemsRouter.patch<ItemParams>("/:itemId", async (req, res, next) => {
  try {
    await loadItem(req.params.groupId, req.params.itemId);
    const body = updateSchema.parse(req.body);
    const item = await prisma.item.update({
      where: { id: req.params.itemId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.value !== undefined && { value: String(body.value) }),
      },
    });
    res.json({ item });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

itemsRouter.delete<ItemParams>("/:itemId", async (req, res, next) => {
  try {
    await loadItem(req.params.groupId, req.params.itemId);
    await prisma.item.delete({ where: { id: req.params.itemId } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
