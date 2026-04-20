export const CHARACTER_EMOJIS = [
  "⚔", "🏹", "🧙", "🛡", "🗡", "🪄", "🌿", "🔥", "💀", "🐉",
  "🎲", "🧝", "🧛", "🧟", "🦄", "🐺", "🦉", "🐍", "🦂", "🕷",
  "🧚", "🧞", "👑", "🗝", "🏰", "⚗", "📜", "🪓", "🏺", "💎",
] as const;

export function isValidEmoji(e: string): boolean {
  return (CHARACTER_EMOJIS as readonly string[]).includes(e);
}
