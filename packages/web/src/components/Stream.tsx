import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useUpdateEffect } from "ahooks";
import { getNotes } from "@/lib/api";
import { CreateNoteButton } from "@/components/CreateNoteButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StreamFooter } from "@/components/StreamFooter";
import { StreamList } from "@/components/StreamList";
import { useCreateTodayNote } from "@/hooks/useCreateTodayNote";

const DEFAULT_LIMIT = 5;

function useStreamQuery(inView: boolean) {
  const query = useInfiniteQuery({
    queryKey: ["notes"],
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    queryFn: ({ pageParam }) => getNotes(DEFAULT_LIMIT, pageParam),
    // eslint-disable-next-line no-undefined
    initialPageParam: undefined as string | undefined,
    // eslint-disable-next-line no-undefined
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  const { fetchNextPage, hasNextPage } = query;

  useUpdateEffect(() => {
    if (inView && hasNextPage) {
      // eslint-disable-next-line eslint-plugin-promise/prefer-await-to-then
      fetchNextPage().catch(console.error);
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return query;
}

export function Stream() {
  const { ref, inView } = useInView();
  const { isCreating, handleCreateToday } = useCreateTodayNote();
  // eslint-disable-next-line no-unused-vars
  const { data, hasNextPage, isFetchingNextPage, status } = useStreamQuery(inView);

  if (status === "pending") {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "error") {
    return <div className="text-center text-red-500 p-8">Failed to load notes.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen pb-32">
      <div className="mb-8 flex justify-center sticky top-4 z-10">
         {/* eslint-disable-next-line eslint-plugin-promise/prefer-await-to-then */}
         <CreateNoteButton isCreating={isCreating} onClick={() => { handleCreateToday().catch(console.error); }} />
      </div>

      <div className="space-y-4">
        {data?.pages.map((page) => (
            <StreamList key={page.nextCursor ?? "last"} notes={page.notes} />
        ))}
      </div>

      <div ref={ref} className="h-20 flex justify-center items-center text-muted-foreground">
         <StreamFooter isFetchingNextPage={isFetchingNextPage} hasNextPage={hasNextPage} />
      </div>
    </div>
  );
}
