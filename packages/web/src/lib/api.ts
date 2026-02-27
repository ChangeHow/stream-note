const API_BASE = "/api";
const DEFAULT_LIMIT = 5;

interface Note {
  date: string;
  content: string;
}

interface NotesResponse {
  notes: Note[];
  nextCursor: string | null;
  hasMore: boolean;
}

async function getNotes(limit = DEFAULT_LIMIT, cursor?: string): Promise<NotesResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  // eslint-disable-next-line no-undefined
  if (cursor !== undefined && cursor !== "") {
    params.append("cursor", cursor);
  }

  const res = await fetch(`${API_BASE}/notes?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return (await res.json()) as NotesResponse;
}

async function getNote(date: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${date}`);
  if (!res.ok) {
    throw new Error("Failed to fetch note");
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return (await res.json()) as Note;
}

async function saveNote(date: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notes/${date}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    throw new Error("Failed to save note");
  }
}

export { getNotes, getNote, saveNote };
export type { Note, NotesResponse };
