import { NoteItem } from "./NoteItem";

interface StreamListProps {
  notes: { date: string; content: string }[];
}

export function StreamList({ notes }: StreamListProps) {
  return (
    <>
      {notes.map((note) => (
        <div key={note.date}>
          <NoteItem date={note.date} initialContent={note.content} />
          <div className="h-px bg-border/50 my-8" />
        </div>
      ))}
    </>
  );
}
