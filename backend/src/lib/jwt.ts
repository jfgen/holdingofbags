import jwt from "jsonwebtoken";

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not set");
  return s;
};

export function signToken(userId: string): string {
  return jwt.sign({ userId }, secret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  const payload = jwt.verify(token, secret()) as { userId: string };
  return { userId: payload.userId };
}
