import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { groupsApi } from "../api/groups";
import { useAuth } from "../lib/auth";
import type { Group } from "../types";
import { NewGroupModal } from "../components/NewGroupModal";
import { Button } from "../components/ui/Button";

export default function GroupsPage() {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    groupsApi.list().then((r) => setGroups(r.groups)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Your groups</h1>
        <div className="flex items-center gap-3">
          <span className="text-subtext text-sm">{user?.username}</span>
          <button onClick={logout} className="text-sm text-subtext hover:text-text underline">Sign out</button>
        </div>
      </header>

      <div className="mb-4">
        <Button onClick={() => setShowNew(true)}>+ New group</Button>
      </div>

      {loading ? (
        <p className="text-subtext">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="text-subtext">You don't belong to any groups yet. Create one, or ask a friend for an invite link.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link to={`/groups/${g.id}`} className="block bg-mantle border border-surface0 rounded-xl p-4 hover:border-blue">
                <div className="text-lg font-semibold">{g.name}</div>
                <div className="text-subtext text-sm">Created {new Date(g.createdAt).toLocaleDateString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showNew && (
        <NewGroupModal onClose={() => setShowNew(false)} onCreated={(id) => nav(`/groups/${id}`)} />
      )}
    </div>
  );
}
