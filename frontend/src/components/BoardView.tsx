import type { Item, Member } from "../types";

function Column({
  title,
  items,
  onEdit,
  onMove,
  onDelete,
  dimNonMatching,
  matcher,
}: {
  title: string;
  items: Item[];
  onEdit: (item: Item) => void;
  onMove: (item: Item) => void;
  onDelete: (item: Item) => void;
  dimNonMatching: boolean;
  matcher: (item: Item) => boolean;
}) {
  return (
    <div className="flex flex-col bg-mantle border border-surface0 rounded-xl w-72 shrink-0 max-h-full">
      <div className="p-3 border-b border-surface0">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-subtext">
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
      </div>
      <ul className="p-2 space-y-2 overflow-y-auto">
        {items.map((it) => {
          const match = matcher(it);
          const dimmed = dimNonMatching && !match;
          const highlighted = dimNonMatching && match;
          return (
            <li
              key={it.id}
              onClick={() => onEdit(it)}
              className={`bg-base border rounded-md p-2 cursor-pointer transition-colors duration-150 ${
                dimmed
                  ? "opacity-30 border-surface1"
                  : highlighted
                  ? "border-blue"
                  : "border-surface1 hover:border-mauve"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-subtext">×{it.amount}</div>
              </div>
              {it.description && (
                <div className="text-xs text-subtext mt-1">{it.description}</div>
              )}
              <div className="mt-2 flex gap-3 text-xs">
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(it); }}
                  className="text-blue hover:underline"
                >
                  Move
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(it); }}
                  className="text-red hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BoardView({
  items,
  members,
  search,
  onEdit,
  onMove,
  onDelete,
}: {
  items: Item[];
  members: Member[];
  search: string;
  onEdit: (item: Item) => void;
  onMove: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const q = search.trim().toLowerCase();
  const matcher = (it: Item) =>
    !q || it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);

  const hoard = items.filter((i) => i.memberId === null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <Column
        title="🏰 Hoard"
        items={hoard}
        onEdit={onEdit}
        onMove={onMove}
        onDelete={onDelete}
        dimNonMatching={!!q}
        matcher={matcher}
      />
      {members.map((m) => (
        <Column
          key={m.id}
          title={`${m.characterEmoji} ${m.characterName}`}
          items={items.filter((i) => i.memberId === m.id)}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          dimNonMatching={!!q}
          matcher={matcher}
        />
      ))}
    </div>
  );
}
