import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../lib/auth";
import { ApiError } from "../api/client";
import { FormCard } from "../components/ui/FormCard";
import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { ErrorText } from "../components/ui/ErrorText";

export default function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await authApi.register({ username, email, password });
      login(res.token, res.user);
      nav("/groups");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormCard title="Create account" onSubmit={onSubmit}>
      <TextField label="Username" required minLength={2} value={username} onChange={setUsername} />
      <TextField label="Email" type="email" required value={email} onChange={setEmail} />
      <TextField label="Password" type="password" required minLength={8} value={password} onChange={setPassword} />
      <ErrorText>{error}</ErrorText>
      <Button fullWidth busy={busy} busyLabel="Creating…">Create account</Button>
      <p className="text-sm text-subtext">
        Already have one? <Link to="/login" className="text-blue hover:underline">Sign in</Link>
      </p>
    </FormCard>
  );
}
