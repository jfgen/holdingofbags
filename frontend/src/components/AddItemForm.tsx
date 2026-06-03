import { useState } from "react";
import { itemsApi } from "../api/items";
import type { Item } from "../types";
import { ApiError } from "../api/client";
import { Modal } from "./ui/Modal";
import { ItemForm, type ItemFormValues } from "./ItemForm";

export function AddItemForm({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: (item: Item) => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(values: ItemFormValues) {
    setBusy(true);
    setErr(null);
    try {
      const r = await itemsApi.create(groupId, {
        name: values.name,
        description: values.description,
        amount: Number(values.amount),
        value: values.value,
      });
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
      <ItemForm
        title="Add item to hoard"
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Add"
        busy={busy}
        error={err}
      />
    </Modal>
  );
}
