import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabase } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabase();

  const [placesResult, metadataResult] = await Promise.all([
    supabase.from("places").select("*").order("name"),
    supabase.from("cached_metadata").select("google_place_id, data"),
  ]);

  if (placesResult.error) {
    return NextResponse.json({ error: placesResult.error.message }, { status: 500 });
  }

  const metaMap = new Map<string, unknown>();
  for (const m of metadataResult.data ?? []) {
    metaMap.set(m.google_place_id, m.data);
  }

  const enriched = (placesResult.data ?? []).map((p) => ({
    ...p,
    cached_data: p.google_place_id ? (metaMap.get(p.google_place_id) ?? null) : null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("places")
    .insert({
      name: body.name,
      category: body.category || "explore",
      place_type: body.place_type || "restaurant",
      cuisine: body.cuisine || null,
      neighborhood: body.neighborhood || null,
      dietary_options: body.dietary_options || null,
      notes: body.notes || null,
      tags: body.tags || [],
      latitude: body.latitude,
      longitude: body.longitude,
      website: body.website || null,
      rating: body.rating || null,
      price_level: body.price_level || null,
      google_place_id: body.google_place_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}
