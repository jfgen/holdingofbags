import { useState } from "react";
import { itemsApi } from "../api/items";
import type { Item } from "../types";
import { ApiError } from "../api/client";
import { Modal } from "./ui/Modal";
import { ItemForm, type ItemFormValues } from "./ItemForm";

export function EditItemModal({
  item,
  groupId,
  onSaved,
  onClose,
}: {
  item: Item;
  groupId: string;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(values: ItemFormValues) {
    setBusy(true);
    setErr(null);
    try {
      await itemsApi.update(groupId, item.id, {
        name: values.name,
        description: values.description,
        amount: parseInt(values.amount, 10),
        value: values.value,
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal ariaLabel={`Edit ${item.name}`} onClose={onClose}>
      <ItemForm
        title={`Edit ${item.name}`}
        initialValues={{
          name: item.name,
          description: item.description,
          amount: String(item.amount),
          value: item.value,
        }}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Save Changes"
        busy={busy}
        error={err}
      />
    </Modal>
  );
}
