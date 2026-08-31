import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getPlaceDetails } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json(
      { error: "Missing query parameter 'placeId'" },
      { status: 400 }
    );
  }

  try {
    const details = await getPlaceDetails(placeId);
    return NextResponse.json(details);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Details lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
