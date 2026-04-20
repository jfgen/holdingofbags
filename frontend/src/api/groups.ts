import { apiFetch } from "./client";
import type { Group, Invite, Coins, Member } from "../types";

export const groupsApi = {
  list: () => apiFetch<{ groups: Group[] }>("/api/groups"),
  create: (groupName: string, characterName: string, characterEmoji: string) =>
    apiFetch<{ group: Group & { members: Member[]; coins: Coins } }>("/api/groups", {
      method: "POST", body: JSON.stringify({ groupName, characterName, characterEmoji }),
    }),
  get: (groupId: string) =>
    apiFetch<{ group: Group & { members: Member[]; coins: Coins } }>(`/api/groups/${groupId}`),
  createInvite: (groupId: string) =>
    apiFetch<{ invite: Invite }>(`/api/groups/${groupId}/invites`, { method: "POST", body: "{}" }),
  getInvite: (token: string) =>
    apiFetch<{ groupId: string; groupName: string; expiresAt: string }>(`/api/invites/${token}`),
  joinWithInvite: (token: string, characterName: string, characterEmoji: string) =>
    apiFetch<{ member: Member; groupId: string }>(`/api/invites/${token}/join`, {
      method: "POST", body: JSON.stringify({ characterName, characterEmoji }),
    }),
};
