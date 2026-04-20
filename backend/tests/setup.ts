import { prisma } from "../src/lib/prisma";

afterEach(async () => {
  await prisma.item.deleteMany();
  await prisma.groupCoins.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
