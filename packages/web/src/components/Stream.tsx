import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { getNotes, saveNote, getNote } from "@/lib/api";
import { NoteItem } from "./NoteItem";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export function Stream() {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notes"],
    queryFn: ({ pageParam }) => getNotes(5, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleCreateToday = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    try {
        const existing = await getNote(today);
        // If content is empty string, getNote returns {date, content: ""}.
        // If content is undefined (newly created object?), check if file exists physically?
        // My backend getNote returns content: "" if ENOENT.
        // So checking if existing.content is truthy means "has content".
        // But if it's empty file, it exists.
        // The goal is to ensure it shows up in the list.
        // If it shows up in list, we are good.
        // If it doesn't show up, we need to create it.
        // We can just call saveNote with "" to touch it.
        // If it has content, we shouldn't overwrite.
        // But saveNote overwrites.
        // Wait, if content is "", saveNote writes empty string. This wipes content!

        if (!existing.content) {
            // It's empty or doesn't exist. Safe to write empty string.
            await saveNote(today, "");
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        } else {
             // It exists and has content. We just refresh list.
             // But if it's already in the list, refresh might not be needed?
             // It ensures it's at the top if sorting order changed (unlikely).
             queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
    } catch (e) {
        console.error("Failed to create today's note", e);
    }
  };

  if (status === "pending") {
      return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (status === "error") {
      return <div className="text-center text-red-500 p-8">Failed to load notes.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen pb-32">
      <div className="mb-8 flex justify-center sticky top-4 z-10">
         <Button onClick={handleCreateToday} size="lg" className="shadow-lg">Create Today's Note</Button>
      </div>

      <div className="space-y-4">
        {data?.pages.map((page) => (
            page.notes.map((note) => (
                <div key={note.date}>
                    <NoteItem date={note.date} initialContent={note.content} />
                    <div className="h-px bg-border/50 my-8" />
                </div>
            ))
        ))}
      </div>

      <div ref={ref} className="h-20 flex justify-center items-center text-muted-foreground">
         {isFetchingNextPage ? <Loader2 className="animate-spin" /> : hasNextPage ? "Scroll to load more" : "End of stream"}
      </div>
    </div>
  );
}
