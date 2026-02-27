import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as api from "@/lib/api";

// Mock the API to avoid network requests and provide test data
vi.mock("@/lib/api", () => ({
  getNotes: vi.fn().mockResolvedValue({
    notes: [],
    nextCursor: undefined,
    hasMore: false
  }),
  getNote: vi.fn(),
  saveNote: vi.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe("App", () => {
  it("renders without crashing", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // Check for the "Create Today's Note" button which appears when data loads (even if empty)
    await waitFor(() => {
        expect(screen.getByText(/Create Today's Note/i)).toBeInTheDocument();
    });
  });
});
