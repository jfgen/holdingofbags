import request from "supertest";
import { Express } from "express";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { signToken } from "../src/lib/jwt";

export async function makeUser(opts: { username?: string; email?: string; password?: string } = {}) {
  const username = opts.username ?? `u_${Math.random().toString(36).slice(2, 8)}`;
  const email = opts.email ?? `${username}@test.local`;
  const password = opts.password ?? "password123";
  const user = await prisma.user.create({
    data: { username, email, passwordHash: await hashPassword(password) },
  });
  return { user, password, token: signToken(user.id) };
}

export async function makeGroup(founderId: string, name = "Party of Heroes") {
  const group = await prisma.group.create({ data: { name, founderId } });
  const member = await prisma.groupMember.create({
    data: { userId: founderId, groupId: group.id, characterName: "Founder Hero", characterEmoji: "⚔" },
  });
  await prisma.groupCoins.create({ data: { groupId: group.id } });
  return { group, member };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function post(app: Express, path: string, body: unknown, token?: string) {
  const req = request(app).post(path).send(body);
  return token ? req.set(authHeader(token)) : req;
}
