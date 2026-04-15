/**
 * Takes screenshots of all key pages for visual design review.
 *
 * Modes:
 *   node scripts/screenshot.mjs              → localhost (no auth needed)
 *   node scripts/screenshot.mjs --prod       → venture-omnidash.vercel.app (needs saved auth)
 *   node scripts/screenshot.mjs --prod feed  → prod, single page
 *   node scripts/screenshot.mjs feed         → localhost, single page
 *
 * Auth: run `node scripts/save-auth.mjs` once to save your Vercel session.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const PROD = args.includes("--prod");
const BASE = PROD ? "https://venture-omnidash.vercel.app" : "http://localhost:3000";
const AUTH_FILE = "./scripts/auth-state.json";
const OUT = "./scripts/screenshots";

mkdirSync(OUT, { recursive: true });

if (PROD && !existsSync(AUTH_FILE)) {
  console.error("No auth session found. Run: node scripts/save-auth.mjs");
  process.exit(1);
}

const PAGES = [
  { name: "dashboard", path: "/dashboard" },
  { name: "feed", path: "/feed" },
  { name: "companies", path: "/companies" },
  { name: "theses", path: "/theses" },
  { name: "founders", path: "/founders" },
  { name: "deals", path: "/deals" },
  { name: "login", path: "/login" },
];

// Allow filtering by page name (skip --prod flag)
const target = args.find(a => !a.startsWith("--"));
const pages = target ? PAGES.filter(p => p.name === target) : PAGES;

const browser = await chromium.launch();
const ctxOptions = {
  // Match a typical 14" MacBook Pro at 100% zoom
  viewport: { width: 1440, height: 900 },
};
if (PROD && existsSync(AUTH_FILE)) {
  ctxOptions.storageState = AUTH_FILE;
}

const ctx = await browser.newContext(ctxOptions);
const page = await ctx.newPage();

for (const { name, path } of pages) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // If we were redirected to login (auth expired), bail with a clear message
  if (PROD && page.url().includes("/login") && path !== "/login") {
    console.warn(`⚠ ${name} → redirected to login. Re-run: node scripts/save-auth.mjs`);
    continue;
  }

  const file = join(OUT, `${name}${PROD ? "-prod" : ""}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${name} → ${file}`);
}

await browser.close();
