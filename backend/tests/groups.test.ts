import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";

const app = createApp();

describe("POST /api/groups", () => {
  it("creates group + founder member + empty coins", async () => {
    const { token } = await makeUser();
    const res = await request(app).post("/api/groups").set(authHeader(token)).send({
      groupName: "The Nine", characterName: "Aragorn", characterEmoji: "⚔",
    });
    expect(res.status).toBe(201);
    expect(res.body.group.name).toBe("The Nine");
    expect(res.body.group.members).toHaveLength(1);
    expect(res.body.group.members[0].characterName).toBe("Aragorn");
    expect(res.body.group.coins).toMatchObject({ platinum: 0, gold: 0 });
  });

  it("rejects bad emoji", async () => {
    const { token } = await makeUser();
    const res = await request(app).post("/api/groups").set(authHeader(token)).send({
      groupName: "X", characterName: "Y", characterEmoji: "🙈",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/groups", () => {
  it("lists only groups the user belongs to", async () => {
    const a = await makeUser();
    const b = await makeUser();
    await makeGroup(a.user.id, "A-group");
    await makeGroup(b.user.id, "B-group");
    const res = await request(app).get("/api/groups").set(authHeader(a.token));
    expect(res.status).toBe(200);
    expect(res.body.groups).toHaveLength(1);
    expect(res.body.groups[0].name).toBe("A-group");
  });
});

describe("GET /api/groups/:id", () => {
  it("returns group details for a member", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).get(`/api/groups/${group.id}`).set(authHeader(a.token));
    expect(res.status).toBe(200);
    expect(res.body.group.id).toBe(group.id);
    expect(res.body.group.members).toHaveLength(1);
    expect(res.body.group.coins).toBeDefined();
  });
  it("403s for non-members", async () => {
    const a = await makeUser();
    const b = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).get(`/api/groups/${group.id}`).set(authHeader(b.token));
    expect(res.status).toBe(403);
  });
});
