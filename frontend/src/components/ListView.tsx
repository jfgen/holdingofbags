import { useMemo, useState } from "react";
import type { Item, Member } from "../types";

type SortKey = "name" | "amount" | "value" | "location";

function locationLabel(item: Item, members: Member[]) {
  if (!item.memberId) return "Hoard";
  const m = members.find((x) => x.id === item.memberId);
  return m ? `${m.characterEmoji} ${m.characterName}` : "Unknown";
}

export function ListView({
  items,
  members,
  onMove,
  onDelete,
}: {
  items: Item[];
  members: Member[];
  onMove: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const [sort, setSort] = useState<SortKey | null>(null);
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    if (!sort) return items;
    const dir = asc ? 1 : -1;
    return [...items].sort((a, b) => {
      switch (sort) {
        case "name": return dir * a.name.localeCompare(b.name);
        case "amount": return dir * (a.amount - b.amount);
        case "value": return dir * (Number(a.value) - Number(b.value));
        case "location": return dir * locationLabel(a, members).localeCompare(locationLabel(b, members));
      }
    });
  }, [items, sort, asc, members]);

  function toggle(k: SortKey) {
    if (sort === k) setAsc(!asc);
    else { setSort(k); setAsc(true); }
  }

  const Header = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="text-left p-2">
      <button onClick={() => toggle(k)} className="font-semibold hover:text-blue">
        {label}{sort === k ? (asc ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto bg-mantle border border-surface0 rounded-xl">
      <table className="w-full text-sm">
        <thead className="border-b border-surface0">
          <tr>
            <Header k="name" label="Name" />
            <Header k="amount" label="Amount" />
            <Header k="value" label="Value" />
            <Header k="location" label="Location" />
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((it) => (
            <tr key={it.id} className="border-t border-surface0">
              <td className="p-2 font-medium">{it.name}</td>
              <td className="p-2">{it.amount}</td>
              <td className="p-2">{it.value}</td>
              <td className="p-2">{locationLabel(it, members)}</td>
              <td className="p-2 text-right">
                <button onClick={() => onMove(it)} className="text-blue hover:underline mr-3">Move</button>
                <button onClick={() => onDelete(it)} className="text-red hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
