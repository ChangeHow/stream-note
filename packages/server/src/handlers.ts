/* eslint-disable eslint-plugin-import/no-nodejs-modules */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Context } from "hono";

const DATA_DIR = join(process.cwd(), "data");
const DEFAULT_LIMIT = 5;
const NOT_FOUND_INDEX = -1;
const START_INDEX_OFFSET = 1;
const STATUS_BAD_REQUEST = 400;
const STATUS_INTERNAL_ERROR = 500;

// Helper to get notes sorted by date (descending)
const getNotes = async () => {
  try {
    const files = await readdir(DATA_DIR);
    const notes = files
      .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
      .map((file) => ({
        date: basename(file, ".md"),
        filename: file,
      }));
    // eslint-disable-next-line eslint-plugin-unicorn/no-array-sort
    return [...notes].sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("Error reading notes directory:", error);
    return [];
  }
};

// eslint-disable-next-line max-statements
const getNotesHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || DEFAULT_LIMIT;
  const cursor = c.req.query("cursor");

  const allNotes = await getNotes();

  let startIndex = 0;
  // eslint-disable-next-line no-undefined
  if (cursor !== undefined && cursor !== "") {
    const cursorIndex = allNotes.findIndex((note) => note.date === cursor);
    if (cursorIndex !== NOT_FOUND_INDEX) {
      startIndex = cursorIndex + START_INDEX_OFFSET;
    }
  }

  const slicedNotes = allNotes.slice(startIndex, startIndex + limit);

  const notesWithContent = await Promise.all(
    slicedNotes.map(async (note) => {
      const content = await readFile(join(DATA_DIR, note.filename), "utf8");
      return {
        date: note.date,
        content,
      };
    })
  );

  // eslint-disable-next-line eslint-plugin-unicorn/prefer-at, no-undefined, no-magic-numbers, eslint-plugin-unicorn/prefer-ternary, no-ternary
  const nextCursor = slicedNotes.length > 0 ? slicedNotes[slicedNotes.length - 1].date : undefined;

  return c.json({
    notes: notesWithContent,
    nextCursor,
    hasMore: startIndex + limit < allNotes.length,
  });
};

const getNoteHandler = async (c: Context) => {
  const date = c.req.param("date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: "Invalid date format" }, STATUS_BAD_REQUEST);
  }

  const filepath = join(DATA_DIR, `${date}.md`);
  try {
    const content = await readFile(filepath, "utf8");
    return c.json({ date, content });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if ((error as any).code === "ENOENT") {
      return c.json({ date, content: "" });
    }
    return c.json({ error: "Failed to read note" }, STATUS_INTERNAL_ERROR);
  }
};

// eslint-disable-next-line max-statements
const saveNoteHandler = async (c: Context) => {
  const date = c.req.param("date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: "Invalid date format" }, STATUS_BAD_REQUEST);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body: { content?: string } = await c.req.json();
  const content = body.content ?? "";

  const filepath = join(DATA_DIR, `${date}.md`);
  try {
    await writeFile(filepath, content, "utf8");
    return c.json({ success: true, date, content });
  } catch (error) {
    console.error("Error writing note:", error);
    return c.json({ error: "Failed to save note" }, STATUS_INTERNAL_ERROR);
  }
};

export default { getNotesHandler, getNoteHandler, saveNoteHandler };
