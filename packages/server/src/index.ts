/* eslint-disable eslint-plugin-import/no-nodejs-modules */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Hono } from "hono";
import { cors } from "hono/cors";
import handlers from "@/handlers";
import { autoCreateNotes } from "@/utils";

const app = new Hono();

app.use("/*", cors());

const DATA_DIR = join(process.cwd(), "data");

// Ensure data directory exists
await mkdir(DATA_DIR, { recursive: true });

// Auto-create notes if TEST_AUTO_CREATE is set
const CREATE_DAYS_BACK = 3;

if (process.env.TEST_AUTO_CREATE === "true") {
  await autoCreateNotes(CREATE_DAYS_BACK, DATA_DIR);
}

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Get list of notes with content, paginated
app.get("/api/notes", handlers.getNotesHandler);

// Get a single note
app.get("/api/notes/:date", handlers.getNoteHandler);

// Create or update a note
app.post("/api/notes/:date", handlers.saveNoteHandler);

export default {
  port: 3000,
  fetch: app.fetch,
};
