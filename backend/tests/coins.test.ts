import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";

const app = createApp();

describe("PATCH /api/groups/:id/coins", () => {
  it("updates the five coin fields", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(a.token)).send({
      platinum: 3, electrum: 1, gold: 100, silver: 12, copper: 42,
    });
    expect(res.status).toBe(200);
    expect(res.body.coins).toMatchObject({ platinum: 3, gold: 100, copper: 42 });
  });

  it("accepts partial updates", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(a.token)).send({ gold: 5 });
    expect(res.status).toBe(200);
    expect(res.body.coins.gold).toBe(5);
    expect(res.body.coins.silver).toBe(0);
  });

  it("rejects negative amounts", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(a.token)).send({ gold: -1 });
    expect(res.status).toBe(400);
  });

  it("403s non-members", async () => {
    const a = await makeUser();
    const b = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(b.token)).send({ gold: 1 });
    expect(res.status).toBe(403);
  });
});
