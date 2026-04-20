import { FormEvent, ReactNode } from "react";

const widthClass = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" } as const;

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
  width?: keyof typeof widthClass;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`w-full ${widthClass[width]} bg-mantle p-6 rounded-xl border border-surface0 space-y-4`}
    >
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <div className="text-subtext text-sm mt-1">{subtitle}</div>}
      </div>
      {children}
    </form>
  );
}
