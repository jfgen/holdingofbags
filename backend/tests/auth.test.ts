import request from "supertest";
import { createApp } from "../src/app";
import { makeUser } from "./helpers";

const app = createApp();

describe("POST /api/auth/register", () => {
  it("creates user and returns JWT", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "gandalf", email: "g@m.com", password: "youShallNotPass",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("gandalf");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/register").send({ username: "alpha", email: "dup@test.local", password: "pw12345678" });
    const res = await request(app).post("/api/auth/register").send({ username: "beta", email: "dup@test.local", password: "pw12345678" });
    expect(res.status).toBe(409);
  });

  it("rejects short password", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "carla", email: "c@test.local", password: "123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns JWT for valid creds", async () => {
    const { user, password } = await makeUser();
    const res = await request(app).post("/api/auth/login").send({ email: user.email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const { user } = await makeUser();
    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: "nope" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user", async () => {
    const { user, token } = await makeUser();
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });
  it("401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
