import { cookies } from "next/headers";

const COOKIE_NAME = "sf-recs-admin";

export async function isAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === password;
}

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}
