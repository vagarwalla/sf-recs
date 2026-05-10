import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabase } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("places")
    .select("*, cached_metadata(data)")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = (data ?? []).map((p: Record<string, unknown>) => {
    const meta = p.cached_metadata as { data: unknown } | null;
    return {
      ...p,
      cached_metadata: undefined,
      cached_data: meta?.data ?? null,
    };
  });

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
