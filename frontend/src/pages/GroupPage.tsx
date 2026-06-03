import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { groupsApi } from "../api/groups";
import { itemsApi } from "../api/items";
import { coinsApi } from "../api/coins";
import type { Group, Coins, Member, Item } from "../types";
import { CoinsBar } from "../components/CoinsBar";
import { BoardView } from "../components/BoardView";
import { ListView } from "../components/ListView";
import { AddItemForm } from "../components/AddItemForm";
import { MoveItemModal } from "../components/MoveItemModal";
import { EditItemModal } from "../components/EditItemModal";
import { InviteButton } from "../components/InviteButton";
import { Button } from "../components/ui/Button";

type ViewMode = "board" | "list";

export default function GroupPage() {
  const { user } = useAuth();
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<(Group & { members: Member[]; coins: Coins }) | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState<Item | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);

  async function refresh() {
    if (!groupId) return;
    const [g, it] = await Promise.all([groupsApi.get(groupId), itemsApi.list(groupId)]);
    setGroup(g.group);
    setItems(it.items);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));

  }, [groupId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [items, search]);

  const matchSummary = useMemo(() => {
    if (!search.trim() || !group) return "";
    const locs = new Set<string>();
    for (const i of filtered) {
      locs.add(i.memberId ? group.members.find((m) => m.id === i.memberId)?.characterName ?? "?" : "Hoard");
    }
    return locs.size === 0 ? "No matches" : `Found in ${[...locs].join(", ")}`;
  }, [filtered, search, group]);

  async function doMove(itemId: string, qty: number, destId: string | null) {
    if (!groupId) return;
    await itemsApi.move(groupId, itemId, qty, destId);
    await refresh();
    setMoving(null);
  }

  async function doDelete(item: Item) {
    if (!groupId) return;
    if (!confirm(`Delete ${item.name}?`)) return;
    await itemsApi.delete(groupId, item.id);
    await refresh();
  }

  if (loading) return <p className="p-8 text-subtext">Loading…</p>;
  if (!group) return <p className="p-8 text-red">Group not found.</p>;

  return (
    <div className="min-h-full p-6 space-y-4 max-w-[1600px] mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <Link to="/groups" className="text-subtext text-sm hover:text-text">← All groups</Link>
          <h1 className="text-2xl font-semibold">{group.name}</h1>
        </div>
        {user?.id === group.founderId && <InviteButton groupId={group.id} />}
      </header>

      <CoinsBar
        coins={group.coins}
        onChange={async (patch) => {
          const r = await coinsApi.update(group.id, patch);
          setGroup({ ...group, coins: r.coins });
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setAdding(true)}>+ Add Item to Hoard</Button>
        <input
          aria-label="search items"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-base border border-surface1 rounded-md p-2 w-64"
        />
        <div role="tablist" aria-label="View mode" className="flex rounded-md overflow-hidden border border-surface1">
          <button
            role="tab"
            aria-selected={view === "board"}
            onClick={() => setView("board")}
            className={`px-3 py-1 ${view === "board" ? "bg-surface0" : ""}`}
          >
            Board
          </button>
          <button
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={`px-3 py-1 ${view === "list" ? "bg-surface0" : ""}`}
          >
            List
          </button>
        </div>
        {search && <span className="text-subtext text-sm">{matchSummary}</span>}
      </div>

      {view === "board" ? (
        <BoardView items={items} members={group.members} search={search} onEdit={setEditing} onMove={setMoving} onDelete={doDelete} />
      ) : (
        <ListView items={filtered} members={group.members} onEdit={setEditing} onMove={setMoving} onDelete={doDelete} />
      )}

      {adding && (
        <AddItemForm groupId={group.id} onClose={() => setAdding(false)} onAdded={() => refresh()} />
      )}
      {moving && (
        <MoveItemModal
          item={moving}
          members={group.members}
          onClose={() => setMoving(null)}
          onMove={(q, dest) => doMove(moving.id, q, dest)}
        />
      )}
      {editing && (
        <EditItemModal
          item={editing}
          groupId={group.id}
          onSaved={async () => { await refresh(); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
