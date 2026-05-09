import { createClient } from "@supabase/supabase-js";
import MapView from "@/components/MapView";
import type { Place } from "@/lib/types";

async function getPlaces(): Promise<Place[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("name");

  if (error) {
    console.error("Failed to fetch places:", error.message);
    return [];
  }

  return data as Place[];
}

export default async function Home() {
  const places = await getPlaces();

  return <MapView places={places} />;
}
