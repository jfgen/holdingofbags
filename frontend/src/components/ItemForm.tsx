import { FormEvent, useState } from "react";
import { TextField } from "./ui/TextField";
import { Button } from "./ui/Button";
import { ErrorText } from "./ui/ErrorText";

export type ItemFormValues = {
  name: string;
  description: string;
  amount: string;
  value: string;
};

export function ItemForm({
  title,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  busy = false,
  error,
}: {
  title: string;
  initialValues?: ItemFormValues;
  onSubmit: (values: ItemFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
  busy?: boolean;
  error?: string | null;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [amount, setAmount] = useState(initialValues?.amount ?? "1");
  const [value, setValue] = useState(initialValues?.value ?? "0");
  const [amountError, setAmountError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (amount.trim() === "" || !Number.isInteger(parsed) || parsed < 0) {
      setAmountError("Amount must be a whole number of 0 or more");
      return;
    }
    setAmountError(null);
    onSubmit({ name, description, amount, value });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-mantle p-6 rounded-xl border border-surface0 space-y-4"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <TextField label="Name" required value={name} onChange={setName} />
      <label className="block">
        <span className="text-subtext text-sm">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none"
        />
      </label>
      <div className="flex gap-3">
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(v) => { setAmount(v); setAmountError(null); }}
        />
        <TextField
          label="Value (gp)"
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={setValue}
        />
      </div>
      {amountError && <ErrorText>{amountError}</ErrorText>}
      {error && <ErrorText>{error}</ErrorText>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button busy={busy} busyLabel="Saving…">{submitLabel}</Button>
      </div>
    </form>
  );
}
