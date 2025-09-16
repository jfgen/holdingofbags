"use client";

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
      <h1 className="text-2xl">Parties</h1>

      {isLoading && "Loading..."}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {parties?.map((party) => {
        return <div key={party.id}>{party.name}</div>;
      })}
    </div>
  );
}
