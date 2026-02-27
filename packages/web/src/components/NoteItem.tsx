import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { saveNote } from "@/lib/api";
import { useDebounceEffect } from "ahooks";

interface NoteItemProps {
  date: string;
  initialContent: string;
}

export function NoteItem({ date, initialContent }: NoteItemProps) {
  const [content, setContent] = useState(initialContent);

  useDebounceEffect(
    () => {
        if (content !== initialContent) {
            // eslint-disable-next-line eslint-plugin-promise/prefer-await-to-then
            saveNote(date, content).catch(console.error);
        }
    },
    [content],
    { wait: 1000 }
  );

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
            onChange={(event) => { setContent(event.target.value); }}
            className="min-h-[150px] text-lg resize-none border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
            placeholder="Write something..."
        />
    </div>
  );
}
