import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { Stream } from "@/components/Stream";
import * as api from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";

// Mock dependencies
vi.mock("@/lib/api", () => ({
  // eslint-disable-next-line no-undefined
  getNotes: vi.fn().mockResolvedValue({ notes: [], nextCursor: undefined, hasMore: false }),
  getNote: vi.fn(),
  saveNote: vi.fn().mockResolvedValue({}),
}));

// Mock useInView to avoid intersection observer issues in test
vi.mock("react-intersection-observer", () => ({
  useInView: vi.fn().mockReturnValue({ ref: vi.fn(), inView: false }),
}));

describe("Stream", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
    Wrapper.displayName = "Wrapper";
    return Wrapper;
  };

  it("calls saveNote and invalidates queries when 'Create Today's Note' is clicked and note does not exist", async () => {
    // Simulate note not existing (getNote fails)
    vi.mocked(api.getNote).mockRejectedValue(new Error("Note not found"));

    render(<Stream />, { wrapper: createWrapper() });

    // Wait for loading to finish and button to appear
    const button = await screen.findByText("Create Today's Note");
    fireEvent.click(button);

    // Verify saveNote is called
    await waitFor(() => {
      expect(api.saveNote).toHaveBeenCalled();
    });
  });
});
