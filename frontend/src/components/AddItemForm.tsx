import { FormEvent, useState } from "react";
import { itemsApi } from "../api/items";
import type { Item } from "../types";
import { ApiError } from "../api/client";
import { Modal } from "./ui/Modal";
import { FormCard } from "./ui/FormCard";
import { TextField } from "./ui/TextField";
import { Button } from "./ui/Button";
import { ErrorText } from "./ui/ErrorText";

export function AddItemForm({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: (item: Item) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(1);
  const [value, setValue] = useState("0");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const r = await itemsApi.create(groupId, { name, description, amount, value });
      onAdded(r.item);
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal ariaLabel="Add item" onClose={onClose}>
      <FormCard title="Add item to hoard" onSubmit={onSubmit} width="md">
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
            min={1}
            value={amount}
            onChange={(v) => setAmount(Number(v) || 1)}
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
        <ErrorText>{err}</ErrorText>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button busy={busy} busyLabel="Adding…">Add</Button>
        </div>
      </FormCard>
    </Modal>
  );
}
