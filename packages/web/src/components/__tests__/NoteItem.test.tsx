import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { NoteItem } from "../NoteItem";
import * as api from "@/lib/api";

// Mock the API module
vi.mock("@/lib/api", () => ({
  saveNote: vi.fn().mockResolvedValue({}),
}));

describe("NoteItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with initial content", () => {
    render(<NoteItem date="2023-01-01" initialContent="Hello World" />);
    expect(screen.getByRole("textbox")).toHaveValue("Hello World");
    expect(screen.getByText("2023-01-01")).toBeInTheDocument();
  });

  it("calls saveNote when content changes (via useDebounceEffect)", async () => {
    render(<NoteItem date="2023-01-01" initialContent="" />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New Content" } });

    // ahooks useDebounceEffect uses setTimeout internally.
    // We can rely on waitFor to poll until the mock is called.
    // Default wait is usually enough for 1000ms debounce if we increase timeout or mock time.
    // However, ahooks might use internal timers.

    // Let's try real timers first with a waitFor.
    await waitFor(() => {
        expect(api.saveNote).toHaveBeenCalledWith("2023-01-01", "New Content");
    }, { timeout: 2000 });
  });
});
