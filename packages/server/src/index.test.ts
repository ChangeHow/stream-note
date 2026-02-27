import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "./index";
import { writeFile, unlink, readdir } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");

describe("Note API", () => {
  beforeAll(async () => {
    // Clean up
    try {
      const files = await readdir(DATA_DIR);
      for (const file of files) {
        if (file.endsWith(".md")) {
          await unlink(join(DATA_DIR, file));
        }
      }
    } catch {}
  });

  afterAll(async () => {
    // Clean up
    try {
        const files = await readdir(DATA_DIR);
        for (const file of files) {
          if (file.endsWith(".md")) {
            await unlink(join(DATA_DIR, file));
          }
        }
      } catch {}
  });

  it("should create a note", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/notes/2023-01-01", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Hello" }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true, date: "2023-01-01", content: "Hello" });
  });

  it("should retrieve a note", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/notes/2023-01-01")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ date: "2023-01-01", content: "Hello" });
  });

  it("should list notes", async () => {
    // Add another note
    await app.fetch(
        new Request("http://localhost/api/notes/2023-01-02", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "World" }),
        })
      );

    const res = await app.fetch(
      new Request("http://localhost/api/notes")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notes).toHaveLength(2);
    expect(data.notes[0].date).toBe("2023-01-02"); // Descending
    expect(data.notes[1].date).toBe("2023-01-01");
  });
});
