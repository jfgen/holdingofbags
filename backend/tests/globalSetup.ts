import "dotenv/config";

export default async function globalSetup() {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
}
