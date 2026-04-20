import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../lib/auth";
import { ApiError } from "../api/client";
import { FormCard } from "../components/ui/FormCard";
import { PageShell } from "../components/ui/PageShell";
import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { ErrorText } from "../components/ui/ErrorText";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await authApi.login(email, password);
      login(res.token, res.user);
      nav(sp.get("next") || "/groups");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <FormCard title="Sign in" onSubmit={onSubmit}>
        <TextField label="Email" type="email" required value={email} onChange={setEmail} />
        <TextField label="Password" type="password" required value={password} onChange={setPassword} />
        <ErrorText>{error}</ErrorText>
        <Button fullWidth busy={busy} busyLabel="Signing in…">Sign in</Button>
        <p className="text-sm text-subtext">
          No account? <Link to="/register" className="text-blue hover:underline">Register</Link>
        </p>
      </FormCard>
    </PageShell>
  );
}
