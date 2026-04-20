import { apiFetch } from "./client";
import type { Item } from "../types";

export const itemsApi = {
  list: (groupId: string) =>
    apiFetch<{ items: Item[] }>(`/api/groups/${groupId}/items`),
  create: (groupId: string, payload: { name: string; description?: string; amount?: number; value?: string }) =>
    apiFetch<{ item: Item }>(`/api/groups/${groupId}/items`, { method: "POST", body: JSON.stringify(payload) }),
  update: (groupId: string, itemId: string, payload: Partial<{ name: string; description: string; amount: number; value: string }>) =>
    apiFetch<{ item: Item }>(`/api/groups/${groupId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  delete: (groupId: string, itemId: string) =>
    apiFetch<void>(`/api/groups/${groupId}/items/${itemId}`, { method: "DELETE" }),
  move: (groupId: string, itemId: string, quantity: number, destinationMemberId: string | null) =>
    apiFetch<{ item: Item }>(`/api/groups/${groupId}/items/${itemId}/move`, {
      method: "POST", body: JSON.stringify({ quantity, destinationMemberId }),
    }),
};
