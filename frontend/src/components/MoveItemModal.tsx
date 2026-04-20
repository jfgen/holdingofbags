import { useState } from "react";
import type { Item, Member } from "../types";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

export function MoveItemModal({
  item,
  members,
  onClose,
  onMove,
}: {
  item: Item;
  members: Member[];
  onClose: () => void;
  onMove: (quantity: number, destinationMemberId: string | null) => void;
}) {
  const currentLabel = item.memberId
    ? members.find((m) => m.id === item.memberId)?.characterName ?? "Character"
    : "Hoard";
  const [dest, setDest] = useState<string | null | undefined>(undefined);
  const [qty, setQty] = useState(item.amount);

  const destName =
    dest === undefined ? null
      : dest === null ? "Hoard"
        : members.find((m) => m.id === dest)?.characterName ?? "";

  const canConfirm = dest !== undefined && qty >= 1 && qty <= item.amount;

  return (
    <Modal ariaLabel={`Move ${item.name}`} onClose={onClose}>
      <div className="bg-mantle p-6 rounded-xl border border-surface0 w-full max-w-md space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Move {item.name}</h2>
          <p className="text-subtext text-sm">Currently in {currentLabel}</p>
        </div>

        <div>
          <span className="text-subtext text-sm block mb-2">Destination</span>
          <div role="radiogroup" aria-label="Destination" className="grid grid-cols-2 gap-2">
            <DestinationButton
              label="🏰 Hoard"
              selected={dest === null}
              disabled={item.memberId === null}
              onClick={() => setDest(null)}
            />
            {members.map((m) => (
              <DestinationButton
                key={m.id}
                label={`${m.characterEmoji} ${m.characterName}`}
                selected={dest === m.id}
                disabled={item.memberId === m.id}
                onClick={() => setDest(m.id)}
              />
            ))}
          </div>
        </div>

        {item.amount > 1 && (
          <label className="block">
            <span className="text-subtext text-sm">Quantity (max {item.amount})</span>
            <input
              aria-label="quantity"
              type="number"
              min={1}
              max={item.amount}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(item.amount, Number(e.target.value) || 1)))}
              className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none"
            />
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!canConfirm}
            onClick={() => canConfirm && onMove(qty, dest ?? null)}
          >
            {canConfirm ? `Move ${qty} to ${destName}` : "Select destination"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DestinationButton({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`p-3 rounded-md border text-left ${
        selected ? "border-blue bg-surface0" : "border-surface1 hover:bg-surface0"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}
