/**
 * One-time import: reads the Excel spreadsheet and upserts into Supabase `places` table.
 *
 * Usage:
 *   npx tsx scripts/import.ts
 *
 * Requires .env with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import * as path from "path";

const EXCEL_PATH = path.join(__dirname, "..", "data", "sf_veg_vegan_restaurants.xlsx");

function mapCategory(raw: string): "rec" | "explore" {
  if (raw === "Exploit") return "rec";
  if (raw === "Explore") return "explore";
  throw new Error(`Unknown category: ${raw}`);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  console.log(`Read ${rows.length} rows from Excel`);

  const places = rows.map((row) => ({
    name: String(row["Name"] ?? ""),
    category: mapCategory(String(row["Explore/Exploit"] ?? "")),
    place_type: "restaurant" as const,
    cuisine: row["Cuisine"] ? String(row["Cuisine"]) : null,
    neighborhood: row["Neighborhood"] ? String(row["Neighborhood"]) : null,
    dietary_options: row["Options Available"] ? String(row["Options Available"]) : null,
    notes: row["Notes"] ? String(row["Notes"]) : null,
    latitude: Number(row["Latitude"]),
    longitude: Number(row["Longitude"]),
    website: row["Website"] ? String(row["Website"]) : null,
    price_level: row["Price"] ? String(row["Price"]) : null,
    tags: [] as string[],
  }));

  const valid = places.filter((p) => p.name && !isNaN(p.latitude) && !isNaN(p.longitude));
  console.log(`${valid.length} valid places to import`);

  const { data, error } = await supabase
    .from("places")
    .upsert(valid, { onConflict: "name" })
    .select("id, name");

  if (error) {
    console.error("Import failed:", error.message);
    process.exit(1);
  }

  console.log(`Imported ${data.length} places successfully`);
}

main();
