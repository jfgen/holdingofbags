import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { groupsApi } from "../api/groups";
import { useAuth } from "../lib/auth";
import { ApiError } from "../api/client";
import { EmojiPicker } from "../components/EmojiPicker";
import { CHARACTER_EMOJIS } from "../lib/emojis";
import { FormCard } from "../components/ui/FormCard";
import { PageShell } from "../components/ui/PageShell";
import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { ErrorText } from "../components/ui/ErrorText";

export default function RegisterInvitePage() {
  const [sp] = useSearchParams();
  const token = sp.get("invite") ?? "";
  const { user, login } = useAuth();
  const nav = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characterEmoji, setCharacterEmoji] = useState<string>(CHARACTER_EMOJIS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setInviteError("Missing invite token"); return; }
    groupsApi.getInvite(token)
      .then((r) => setGroupName(r.groupName))
      .catch((e) => setInviteError(e instanceof ApiError ? e.message : "invalid invite"));
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (user) {
        const r = await groupsApi.joinWithInvite(token, characterName, characterEmoji);
        nav(`/groups/${r.groupId}`);
      } else {
        const r = await authApi.registerWithInvite({ token, username, email, password, characterName, characterEmoji });
        login(r.token, r.user);
        nav(`/groups/${r.groupId}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "registration failed");
    } finally {
      setBusy(false);
    }
  }

  if (inviteError) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h1 className="text-xl font-semibold">Invite unavailable</h1>
        <p className="text-red">{inviteError}</p>
        <Link to="/register" className="text-blue hover:underline">Continue to regular registration</Link>
      </div>
    );
  }

  const subtitle = user
    ? `Logged in as ${user.username}. Pick your character.`
    : "Create an account and your character.";

  return (
    <PageShell>
      <FormCard title={`Join ${groupName || "group"}`} subtitle={subtitle} onSubmit={onSubmit} width="lg">
        {!user && (
          <>
            <TextField label="Username" required minLength={2} value={username} onChange={setUsername} />
            <TextField label="Email" type="email" required value={email} onChange={setEmail} />
            <TextField label="Password" type="password" required minLength={8} value={password} onChange={setPassword} />
          </>
        )}
        <TextField label="Character name" required value={characterName} onChange={setCharacterName} />
        <EmojiPicker value={characterEmoji} onChange={setCharacterEmoji} />
        <ErrorText>{error}</ErrorText>
        <Button fullWidth busy={busy} busyLabel="Joining…">
          {user ? "Join group" : "Create account and join"}
        </Button>
      </FormCard>
    </PageShell>
  );
}
