import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
