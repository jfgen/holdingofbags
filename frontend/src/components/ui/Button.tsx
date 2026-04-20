import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const variantClass: Record<Variant, string> = {
  primary: "bg-blue text-base hover:bg-lavender",
  secondary: "border border-surface1 hover:bg-surface0",
  ghost: "hover:bg-surface0",
};
const sizeClass: Record<Size, string> = {
  sm: "text-sm px-3 py-1",
  md: "px-4 py-2",
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  busy?: boolean;
  busyLabel?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  busy = false,
  busyLabel,
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || busy}
      className={[
        "font-semibold rounded-md",
        variantClass[variant],
        sizeClass[size],
        fullWidth ? "w-full" : "",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
