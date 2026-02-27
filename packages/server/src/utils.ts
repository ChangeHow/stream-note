/* eslint-disable eslint-plugin-import/no-nodejs-modules */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATE_PADDING = 2;
const MONTH_OFFSET = 1;
// eslint-disable-next-line no-magic-numbers
const INCREMENT_STEP = 1;

export const autoCreateNotes = async (
  createDaysBack: number,
  dataDir: string
) => {
  const today = new Date();
  const creationPromises = Array.from(
    { length: createDaysBack },
    (_, i) => i + INCREMENT_STEP
  ).map(async (i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + MONTH_OFFSET).padStart(
      DATE_PADDING,
      "0"
    );
    const dd = String(date.getDate()).padStart(DATE_PADDING, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const filepath = join(dataDir, `${dateStr}.md`);
    try {
      await readFile(filepath);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      if ((error as any).code === "ENOENT") {
        console.log(`Auto-creating note: ${dateStr}`);
        await writeFile(filepath, "", "utf8");
      }
    }
  });

  await Promise.all(creationPromises);
};
