import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";
import { prisma } from "../src/lib/prisma";

const app = createApp();

describe("items CRUD", () => {
  it("POST adds an item to the hoard (memberId null)", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).post(`/api/groups/${group.id}/items`).set(authHeader(a.token)).send({
      name: "Potion", description: "heals 2d4+2", amount: 3, value: "5.00",
    });
    expect(res.status).toBe(201);
    expect(res.body.item.memberId).toBeNull();
    expect(res.body.item.amount).toBe(3);
  });

  it("GET lists all items in the group", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    await prisma.item.create({ data: { groupId: group.id, name: "Rope" } });
    const res = await request(app).get(`/api/groups/${group.id}/items`).set(authHeader(a.token));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it("PATCH updates an item", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const item = await prisma.item.create({ data: { groupId: group.id, name: "Torch", amount: 2 } });
    const res = await request(app)
      .patch(`/api/groups/${group.id}/items/${item.id}`)
      .set(authHeader(a.token))
      .send({ amount: 5, description: "lit" });
    expect(res.status).toBe(200);
    expect(res.body.item.amount).toBe(5);
    expect(res.body.item.description).toBe("lit");
  });

  it("DELETE removes an item", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const item = await prisma.item.create({ data: { groupId: group.id, name: "Gone" } });
    const res = await request(app).delete(`/api/groups/${group.id}/items/${item.id}`).set(authHeader(a.token));
    expect(res.status).toBe(204);
    expect(await prisma.item.count()).toBe(0);
  });

  it("404s on item from another group", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const other = await makeGroup((await makeUser()).user.id);
    const otherItem = await prisma.item.create({ data: { groupId: other.group.id, name: "X" } });
    const res = await request(app).patch(`/api/groups/${group.id}/items/${otherItem.id}`).set(authHeader(a.token)).send({ amount: 1 });
    expect(res.status).toBe(404);
  });
});
