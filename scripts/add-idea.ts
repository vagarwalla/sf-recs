#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const idea = process.argv.slice(2).join(" ").trim();
if (!idea) {
  console.error('Usage: npm run idea "your idea here"');
  process.exit(1);
}

const file = resolve(process.cwd(), "IMPROVEMENTS.md");
const content = readFileSync(file, "utf8");

const marker = "## 📥 Inbox";
const idx = content.indexOf(marker);
if (idx === -1) {
  console.error("Could not find Inbox section in IMPROVEMENTS.md");
  process.exit(1);
}

const insertAt = content.indexOf("\n", idx) + 1;
const before = content.slice(0, insertAt);
const after = content.slice(insertAt);

const cleanIdea = idea.replace(/^[-*]\s*/, "");
const newLine = `\n- [ ] ${cleanIdea}\n`;

writeFileSync(file, before + newLine + after);
console.log(`✓ Added to Inbox: ${cleanIdea}`);
