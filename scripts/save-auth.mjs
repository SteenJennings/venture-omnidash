/**
 * Opens a real Chrome window so you can log in to venture-omnidash.vercel.app.
 * Saves the session to scripts/auth-state.json for use by screenshot.mjs --prod.
 *
 * Usage: node scripts/save-auth.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import * as readline from "readline";

const AUTH_FILE = "./scripts/auth-state.json";

// Use a persistent temp profile so Chrome opens as a real Chrome window
// (not Playwright's bundled Chromium) and you can receive the magic link email.
const profileDir = join(tmpdir(), "playwright-vs-profile");
mkdirSync(profileDir, { recursive: true });

const ctx = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  channel: "chrome",       // use your system Chrome binary
  viewport: { width: 1440, height: 900 },
  args: ["--no-first-run", "--no-default-browser-check"],
});

const page = await ctx.newPage();
await page.goto("https://venture-omnidash.vercel.app/login");

console.log("\n🔑 Chrome opened at the Vercel login page.");
console.log("   Enter your email, click Send magic link, open the link from your inbox.");
console.log("   Once you see the dashboard, come back here and press Enter.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise(resolve => rl.question("Press Enter when you are on the dashboard... ", resolve));
rl.close();

// Save session cookies + localStorage
const state = await ctx.storageState();
writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
console.log(`\n✓ Session saved → ${AUTH_FILE}`);
console.log("  Now run: node scripts/screenshot.mjs --prod\n");

await ctx.close();
