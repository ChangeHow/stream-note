import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const MockStream = () => <div data-testid="stream-component">Stream Component</div>;
MockStream.displayName = "Stream";

// Mock the Stream component to isolate App rendering
vi.mock("@/components/Stream", () => ({
  Stream: MockStream,
}));

describe("App", () => {
  it("renders without crashing", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByTestId("stream-component")).toBeInTheDocument();
  });
});
