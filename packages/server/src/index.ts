import { Hono } from "hono";
import { cors } from "hono/cors";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const app = new Hono();

app.use("/*", cors());

const DATA_DIR = join(process.cwd(), "data");

// Ensure data directory exists
await mkdir(DATA_DIR, { recursive: true });

// Helper to get notes sorted by date (descending)
async function getNotes() {
  try {
    const files = await readdir(DATA_DIR);
    const notes = files
      .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
      .map((file) => ({
        date: basename(file, ".md"),
        filename: file,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    return notes;
  } catch (error) {
    console.error("Error reading notes directory:", error);
    return [];
  }
}

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Get list of notes with content, paginated
app.get("/api/notes", async (c) => {
  const limit = Number(c.req.query("limit")) || 5;
  const cursor = c.req.query("cursor"); // Date string (YYYY-MM-DD)

  const allNotes = await getNotes();

  let startIndex = 0;
  if (cursor) {
    const cursorIndex = allNotes.findIndex((note) => note.date === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1; // Start after the cursor
    }
  }

  const slicedNotes = allNotes.slice(startIndex, startIndex + limit);

  // Read content for each note
  const notesWithContent = await Promise.all(
    slicedNotes.map(async (note) => {
      const content = await readFile(join(DATA_DIR, note.filename), "utf-8");
      return {
        date: note.date,
        content,
      };
    })
  );

  return c.json({
    notes: notesWithContent,
    nextCursor: slicedNotes.length > 0 ? slicedNotes[slicedNotes.length - 1].date : null,
    hasMore: startIndex + limit < allNotes.length,
  });
});

// Get a single note
app.get("/api/notes/:date", async (c) => {
  const date = c.req.param("date");
  // Basic validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: "Invalid date format" }, 400);
  }

  const filepath = join(DATA_DIR, `${date}.md`);
  try {
    const content = await readFile(filepath, "utf-8");
    return c.json({ date, content });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Return empty content if file doesn't exist
      return c.json({ date, content: "" });
    }
    return c.json({ error: "Failed to read note" }, 500);
  }
});

// Create or update a note
app.post("/api/notes/:date", async (c) => {
  const date = c.req.param("date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: "Invalid date format" }, 400);
  }

  const body = await c.req.json();
  const content = body.content || "";

  const filepath = join(DATA_DIR, `${date}.md`);
  try {
    await writeFile(filepath, content, "utf-8");
    return c.json({ success: true, date, content });
  } catch (error) {
    console.error("Error writing note:", error);
    return c.json({ error: "Failed to save note" }, 500);
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};
