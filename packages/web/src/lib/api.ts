export interface Note {
  date: string;
  content: string;
}

export interface NotesResponse {
  notes: Note[];
  nextCursor: string | null;
  hasMore: boolean;
}

const API_BASE = "/api";

export async function getNotes(limit = 5, cursor?: string): Promise<NotesResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append("cursor", cursor);

  const res = await fetch(`${API_BASE}/notes?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function getNote(date: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${date}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

export async function saveNote(date: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notes/${date}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to save note");
}
