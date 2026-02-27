import { Loader2 } from "lucide-react";

export function StreamFooter({
  isFetchingNextPage,
  hasNextPage,
}: {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}) {
  if (isFetchingNextPage) {
    return <Loader2 className="animate-spin" />;
  }
  if (hasNextPage) {
    return "Scroll to load more";
  }
  return "End of stream";
}
