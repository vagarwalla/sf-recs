import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAuthCookieName(), password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
