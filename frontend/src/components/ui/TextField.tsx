import { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label: string;
  type?: "text" | "email" | "password" | "number";
  value: string | number;
  onChange: (value: string) => void;
};

export function TextField({ label, type = "text", value, onChange, ...rest }: Props) {
  return (
    <label className="block">
      <span className="text-subtext text-sm">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none"
        {...rest}
      />
    </label>
  );
}
