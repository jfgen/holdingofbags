import { FormEvent, ReactNode } from "react";

export function FormCard({
  title,
  subtitle,
  onSubmit,
  children,
  width = "sm",
}: {
  title: string;
  subtitle?: ReactNode;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  const widthClass = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" }[width];
  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <form
        onSubmit={onSubmit}
        className={`w-full ${widthClass} bg-mantle p-6 rounded-xl border border-surface0 space-y-4`}
      >
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <div className="text-subtext text-sm mt-1">{subtitle}</div>}
        </div>
        {children}
      </form>
    </div>
  );
}
