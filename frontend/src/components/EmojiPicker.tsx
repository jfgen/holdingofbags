import { CHARACTER_EMOJIS } from "../lib/emojis";

export function EmojiPicker({
  value,
  onChange,
  label = "Character emoji",
}: {
  value: string;
  onChange: (emoji: string) => void;
  label?: string;
}) {
  return (
    <div>
      <span className="text-subtext text-sm block mb-1">{label}</span>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-10 gap-1">
        {CHARACTER_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            role="radio"
            aria-checked={e === value}
            aria-label={`emoji ${e}`}
            onClick={() => onChange(e)}
            className={`text-2xl p-1 rounded-md border ${
              e === value ? "border-blue bg-surface0" : "border-transparent hover:bg-surface0"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
