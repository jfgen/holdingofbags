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
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      try {
        const { data, error } = await supabase.from("parties").select();
        if (error) {
          throw new Error(error.message);
        }
        setParties(data);
      } catch (error) {
        console.error("something went wrong", error.message);
      }
    };
    getData();
  }, [supabase]);

  return (
    <div>
      <h2>Parties</h2>
      {parties?.map((party) => {
        return <div key={party.id}>{party.name}</div>;
      })}
    </div>
  );
}
