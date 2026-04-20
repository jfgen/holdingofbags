export type User = { id: string; username: string; email: string; createdAt: string };

export type Member = {
  id: string;
  userId: string;
  groupId: string;
  characterName: string;
  characterEmoji: string;
  joinedAt: string;
};

export type Coins = {
  id: string;
  groupId: string;
  platinum: number;
  electrum: number;
  gold: number;
  silver: number;
  copper: number;
};

export type Group = {
  id: string;
  name: string;
  founderId: string;
  createdAt: string;
  members?: Member[];
  coins?: Coins;
};

export type Item = {
  id: string;
  groupId: string;
  memberId: string | null;
  name: string;
  description: string;
  amount: number;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type Invite = {
  id: string;
  groupId: string;
  token: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  expiresAt: string;
};

export type AuthResponse = { token: string; user: User; groupId?: string };
