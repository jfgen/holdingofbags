export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return <p className="text-red text-sm">{children}</p>;
}
