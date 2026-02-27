import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface CreateNoteButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

export function CreateNoteButton({ isCreating, onClick }: CreateNoteButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="shadow-lg"
      disabled={isCreating}
    >
      {/* eslint-disable-next-line no-undefined */}
      {isCreating ? <LoadingSpinner /> : undefined}
      Create Today&apos;s Note
    </Button>
  );
}
