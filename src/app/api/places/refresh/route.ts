import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getPlaceDetails } from "@/lib/google-places";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("authorization")?.replace("Bearer ", "");
  const isAdmin = await isAuthenticated();
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (!isAdmin && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: places, error } = await supabase
    .from("places")
    .select("google_place_id")
    .not("google_place_id", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let refreshed = 0;
  let failed = 0;

  for (const place of places ?? []) {
    try {
      const details = await getPlaceDetails(place.google_place_id);
      await supabase.from("cached_metadata").upsert({
        google_place_id: place.google_place_id,
        data: details,
        fetched_at: new Date().toISOString(),
      });
      refreshed++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ refreshed, failed, total: places?.length ?? 0 });
}
