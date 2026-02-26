import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useUpdateEffect } from "ahooks";
import { getNotes, saveNote, getNote } from "@/lib/api";
import { NoteItem } from "./NoteItem";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { atom, useAtom } from "jotai";

// Jotai atom for demonstration
// This could be used for global state, e.g., "is creating note"
const isCreatingAtom = atom(false);

export function Stream() {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const [isCreating, setIsCreating] = useAtom(isCreatingAtom);

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

  useUpdateEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleCreateToday = async () => {
    if (isCreating) return;
    setIsCreating(true);

    const today = format(new Date(), "yyyy-MM-dd");
    try {
        const existing = await getNote(today);
        if (!existing.content) {
            await saveNote(today, "");
            await queryClient.invalidateQueries({ queryKey: ["notes"] });
        } else {
             await queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
    } catch (e) {
        console.error("Failed to create today's note", e);
    } finally {
        setIsCreating(false);
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
         <Button
            onClick={handleCreateToday}
            size="lg"
            className="shadow-lg"
            disabled={isCreating}
         >
            {isCreating ? <Loader2 className="animate-spin mr-2" /> : null}
            Create Today's Note
         </Button>
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
