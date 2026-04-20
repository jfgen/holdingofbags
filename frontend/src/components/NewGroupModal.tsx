import { FormEvent, useState } from "react";
import { groupsApi } from "../api/groups";
import { EmojiPicker } from "./EmojiPicker";
import { CHARACTER_EMOJIS } from "../lib/emojis";
import { ApiError } from "../api/client";
import { Modal } from "./ui/Modal";
import { FormCard } from "./ui/FormCard";
import { TextField } from "./ui/TextField";
import { Button } from "./ui/Button";
import { ErrorText } from "./ui/ErrorText";

export function NewGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (groupId: string) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [emoji, setEmoji] = useState<string>(CHARACTER_EMOJIS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const r = await groupsApi.create(groupName, characterName, emoji);
      onCreated(r.group.id);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal ariaLabel="New group" onClose={onClose}>
      <FormCard title="New group" onSubmit={onSubmit} width="md">
        <TextField label="Group name" required value={groupName} onChange={setGroupName} />
        <TextField label="Your character's name" required value={characterName} onChange={setCharacterName} />
        <EmojiPicker label="Your character's emoji" value={emoji} onChange={setEmoji} />
        <ErrorText>{err}</ErrorText>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button busy={busy} busyLabel="Creating…">Create</Button>
        </div>
      </FormCard>
    </Modal>
  );
}
