import { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center p-8">
      {children}
    </div>
  );
}
