import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { atom, useAtom } from "jotai";
import { getNote, saveNote } from "@/lib/api";

const isCreatingAtom = atom(false);

export function useCreateTodayNote() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useAtom(isCreatingAtom);

  const createNote = async (date: string) => {
    await saveNote(date, "");
    await queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const checkAndCreateNote = async (today: string) => {
    try {
      const existing = await getNote(today);
      // eslint-disable-next-line eslint-plugin-unicorn/prefer-ternary
      if (existing.content) {
        await queryClient.invalidateQueries({ queryKey: ["notes"] });
      } else {
        await createNote(today);
      }
    } catch (error) {
      console.error("Failed to create today's note", error);
      try {
        await createNote(today);
      } catch (createError) {
        console.error("Failed to create note after check failed", createError);
      }
    }
  };

  const handleCreateToday = async () => {
    if (isCreating) { return; }
    setIsCreating(true);

    const today = format(new Date(), "yyyy-MM-dd");
    await checkAndCreateNote(today);
    setIsCreating(false);
  };

  return { isCreating, handleCreateToday };
}
