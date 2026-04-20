import { useState } from "react";
import { groupsApi } from "../api/groups";
import { ApiError } from "../api/client";
import { Button } from "./ui/Button";

export function InviteButton({ groupId }: { groupId: string }) {
  const [link, setLink] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function gen() {
    setBusy(true); setErr(null);
    try {
      const r = await groupsApi.createInvite(groupId);
      setLink(`${window.location.origin}/register?invite=${r.invite.token}`);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={gen} busy={busy} busyLabel="…">
        Invite
      </Button>
      {link && (
        <input
          readOnly
          aria-label="invite link"
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="bg-base border border-surface1 rounded-md p-1 text-xs w-64"
        />
      )}
      {err && <span className="text-red text-xs">{err}</span>}
    </div>
  );
}
