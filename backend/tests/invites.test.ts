import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";
import { prisma } from "../src/lib/prisma";

const app = createApp();

describe("POST /api/groups/:id/invites", () => {
  it("founder creates an invite with a token", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(a.token)).send({});
    expect(res.status).toBe(201);
    expect(res.body.invite.token).toMatch(/.{16,}/);
    expect(res.body.invite.status).toBe("PENDING");
  });
});

describe("GET /api/invites/:token", () => {
  it("returns group name for a pending token", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id, "Sworn");
    const create = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(a.token)).send({});
    const res = await request(app).get(`/api/invites/${create.body.invite.token}`);
    expect(res.status).toBe(200);
    expect(res.body.groupName).toBe("Sworn");
  });
  it("404s unknown token", async () => {
    const res = await request(app).get("/api/invites/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/auth/register/invite", () => {
  it("creates user + member + marks invite ACCEPTED", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const create = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(a.token)).send({});
    const token = create.body.invite.token;
    const res = await request(app).post("/api/auth/register/invite").send({
      token, username: "legolas", email: "le@m.com", password: "arrowtime",
      characterName: "Legolas", characterEmoji: "🏹",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.groupId).toBe(group.id);
    const invite = await prisma.invite.findUnique({ where: { token } });
    expect(invite?.status).toBe("ACCEPTED");
  });
});
