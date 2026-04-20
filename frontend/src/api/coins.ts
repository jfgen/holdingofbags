import { apiFetch } from "./client";
import type { Coins } from "../types";

export const coinsApi = {
  update: (groupId: string, patch: Partial<Pick<Coins, "platinum" | "electrum" | "gold" | "silver" | "copper">>) =>
    apiFetch<{ coins: Coins }>(`/api/groups/${groupId}/coins`, { method: "PATCH", body: JSON.stringify(patch) }),
};
