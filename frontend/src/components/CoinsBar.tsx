import { useState } from "react";
import type { Coins } from "../types";

type CoinKey = "platinum" | "electrum" | "gold" | "silver" | "copper";

const FIELDS: { key: CoinKey; label: string; letter: string; color: string }[] = [
  { key: "platinum", label: "Platinum", letter: "PP", color: "text-lavender" },
  { key: "electrum", label: "Electrum", letter: "EP", color: "text-mauve" },
  { key: "gold",     label: "Gold",     letter: "GP", color: "text-yellow" },
  { key: "silver",   label: "Silver",   letter: "SP", color: "text-subtext" },
  { key: "copper",   label: "Copper",   letter: "CP", color: "text-peach" },
];

export function CoinsBar({
  coins,
  onChange,
}: {
  coins: Coins;
  onChange: (patch: Partial<Pick<Coins, CoinKey>>) => void;
}) {
  const [local, setLocal] = useState<Record<CoinKey, number>>({
    platinum: coins.platinum,
    electrum: coins.electrum,
    gold: coins.gold,
    silver: coins.silver,
    copper: coins.copper,
  });

  function commit(key: CoinKey, raw: string) {
    const parsed = Math.floor(Number(raw));
    if (!Number.isFinite(parsed) || parsed < 0) {
      setLocal((l) => ({ ...l, [key]: coins[key] }));
      return;
    }
    if (parsed === coins[key]) return;
    setLocal((l) => ({ ...l, [key]: parsed }));
    onChange({ [key]: parsed } as Partial<Pick<Coins, CoinKey>>);
  }

  return (
    <div className="bg-mantle border border-surface0 rounded-xl p-3 flex flex-wrap gap-4">
      {FIELDS.map(({ key, label, letter, color }) => (
        <label key={key} className="flex items-center gap-2">
          <span className={`font-semibold ${color}`}>{letter}</span>
          <span className="sr-only">{label}</span>
          <input
            aria-label={label.toLowerCase()}
            type="number"
            min={0}
            value={local[key]}
            onChange={(e) => setLocal({ ...local, [key]: Number(e.target.value) })}
            onBlur={(e) => commit(key, e.target.value)}
            className="w-20 bg-base border border-surface1 rounded-md p-1 text-right"
          />
        </label>
      ))}
    </div>
  );
}
