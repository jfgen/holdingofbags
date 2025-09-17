"use client";

import { useUserInfo } from "@/contexts/UserContext";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Party {
  id: number;
  name: string;
  description: string;
}

export default function Page() {
  const [parties, setParties] = useState<Party[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const supabase = createClient();

  const user = useUserInfo();

  useEffect(() => {
    const getParties = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.from("parties").select();
        if (error) {
          throw error;
        }
        setParties(data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    getParties();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-3xl mb-4">Parties</h1>

      {isLoading && "Loading..."}

      {!isLoading && user && (
        <p className="mb-6">
          Welcome {user}, choose the party to manage below, or create a new one!
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {parties?.map((party) => {
        return <div key={party.id}>{party.name}</div>;
      })}
    </div>
  );
}
