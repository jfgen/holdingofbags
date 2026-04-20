import { hashPassword, verifyPassword } from "../src/lib/password";
import { signToken, verifyToken } from "../src/lib/jwt";

describe("password", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("jwt", () => {
  it("round-trips userId", () => {
    const token = signToken("user-1");
    expect(verifyToken(token)).toEqual({ userId: "user-1" });
  });
  it("rejects tampered token", () => {
    expect(() => verifyToken("not.a.jwt")).toThrow();
  });
});
