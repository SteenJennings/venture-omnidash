/**
 * Takes screenshots of all key pages for visual design review.
 * Usage: node scripts/screenshot.mjs [page]
 * Pages: dashboard, feed, companies, theses, founders, deals, login
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:3000";
const OUT = "./scripts/screenshots";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: "dashboard", path: "/dashboard" },
  { name: "feed", path: "/feed" },
  { name: "companies", path: "/companies" },
  { name: "theses", path: "/theses" },
  { name: "founders", path: "/founders" },
  { name: "deals", path: "/deals" },
  { name: "login", path: "/login" },
];

const target = process.argv[2];
const pages = target ? PAGES.filter(p => p.name === target) : PAGES;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

for (const { name, path } of pages) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${name} → ${file}`);
}

await browser.close();
