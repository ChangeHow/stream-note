/* eslint-disable eslint-plugin-import/no-nodejs-modules */
import { spawn } from "node:child_process";
import { access, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { subDays } from "date-fns";
import { beforeAll, describe, expect, it } from "vitest";

const DATA_DIR = join(process.cwd(), "data");
const DATE_PADDING = 2;
const MONTH_OFFSET = 1;
const TEST_TIMEOUT = 10_000;
const SERVER_STARTUP_TIME = 3000;
const DAYS_TO_CHECK = 3;
const INCREMENT_STEP = 1;
const EMPTY_SIZE = 0;

// Helper to format date as yyyy-MM-dd
const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + MONTH_OFFSET).padStart(DATE_PADDING, "0");
  const dd = String(date.getDate()).padStart(DATE_PADDING, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const verifyNoteExists = async (date: Date) => {
  const filename = `${formatDate(date)}.md`;
  const filepath = join(DATA_DIR, filename);

  console.log(`Checking for file: ${filepath}`);

  try {
    await access(filepath);
    const fileStat = await stat(filepath);
    expect(fileStat.size).toBe(EMPTY_SIZE);
  } catch (error) {
    throw new Error(`File ${filename} was not created. Error: ${String(error)}`, { cause: error });
  }
};

describe("Server Auto Create", () => {
  // Clean up data directory before test
  beforeAll(async () => {
    try {
      await rm(DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("creates past 3 days notes when TEST_AUTO_CREATE is set", async () => {
    console.log("Starting server process with TEST_AUTO_CREATE=true");
    const serverProcess = spawn("bun", ["src/index.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, TEST_AUTO_CREATE: "true", PORT: "3002" },
      stdio: "inherit",
    });

    // Wait for server to start and process env
    // eslint-disable-next-line eslint-plugin-promise/avoid-new
    await new Promise((resolve) => { setTimeout(resolve, SERVER_STARTUP_TIME); });

    serverProcess.kill();

    const today = new Date();
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const checks = Array.from({ length: DAYS_TO_CHECK }, (_, i) => i + INCREMENT_STEP).map((i) =>
      verifyNoteExists(subDays(today, i))
    );

    await Promise.all(checks);
  }, TEST_TIMEOUT);
});
