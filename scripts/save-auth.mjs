/**
 * Opens a real Chrome window so you can log in to venture-omnidash.vercel.app.
 * Saves the session to scripts/auth-state.json so screenshot.mjs --prod can reuse it.
 *
 * Usage: node scripts/save-auth.mjs
 * Then: log in via magic link in the browser window. Press Enter here when done.
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import * as readline from "readline";

const AUTH_FILE = "./scripts/auth-state.json";

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("https://venture-omnidash.vercel.app/login");

console.log("\n🔑 Browser opened at the login page.");
console.log("   Log in with your magic link, then come back here and press Enter.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await new Promise(resolve => rl.question("Press Enter when you are logged in... ", resolve));
rl.close();

// Save session storage state
const state = await ctx.storageState();
writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
console.log(`\n✓ Session saved → ${AUTH_FILE}`);
console.log("  Run: node scripts/screenshot.mjs --prod\n");

await browser.close();
