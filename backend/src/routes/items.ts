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

const moveSchema = z.object({
  quantity: z.number().int().min(1),
  destinationMemberId: z.string().uuid().nullable(),
});

itemsRouter.post<ItemParams>("/:itemId/move", async (req, res, next) => {
  try {
    const source = await loadItem(req.params.groupId, req.params.itemId);
    const body = moveSchema.parse(req.body);
    if (body.quantity > source.amount) throw new HttpError(400, "quantity exceeds stack size");
    if (body.destinationMemberId) {
      const dest = await prisma.groupMember.findUnique({ where: { id: body.destinationMemberId } });
      if (!dest || dest.groupId !== req.params.groupId) throw new HttpError(400, "invalid destinationMemberId");
    }
    if ((body.destinationMemberId ?? null) === (source.memberId ?? null)) {
      throw new HttpError(400, "source and destination are the same");
    }

    const created = await prisma.$transaction(async (tx) => {
      if (body.quantity === source.amount) {
        await tx.item.delete({ where: { id: source.id } });
      } else {
        await tx.item.update({ where: { id: source.id }, data: { amount: source.amount - body.quantity } });
      }
      return tx.item.create({
        data: {
          groupId: source.groupId,
          memberId: body.destinationMemberId,
          name: source.name,
          description: source.description,
          amount: body.quantity,
          value: source.value,
        },
      });
    });
    res.json({ item: created });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
