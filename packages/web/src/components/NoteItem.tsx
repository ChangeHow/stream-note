import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { saveNote } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

interface NoteItemProps {
  date: string;
  initialContent: string;
}

export function NoteItem({ date, initialContent }: NoteItemProps) {
  const [content, setContent] = useState(initialContent);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    // Only save if content is different from initial or we have meaningful change
    // We compare with initialContent to avoid saving on mount if they match.
    // However, after first edit, content !== initialContent usually.
    // If we save, we might want to update "initialContent" concept or just rely on the fact that
    // subsequent saves are also fine.
    // The issue is on mount: debouncedContent = initialContent.
    if (debouncedContent !== initialContent) {
        saveNote(date, debouncedContent).catch(console.error);
    }
  }, [debouncedContent, date, initialContent]);

  return (
    <div className="flex flex-col gap-4 py-8 relative">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-mono text-primary/80">
                {format(parseISO(date), "yyyy-MM-dd")}
            </h2>
            <div className="h-px bg-border flex-1" />
        </div>
        <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] text-lg resize-none border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
            placeholder="Write something..."
        />
    </div>
  );
}
