import { createClient } from "@/lib/supabase/server";

export default async function Parties() {
  const supabase = await createClient();
  const { data: parties } = await supabase.from("parties").select();

  return <pre>{JSON.stringify(parties, null, 2)}</pre>;
}
