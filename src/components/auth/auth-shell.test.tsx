import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthShell } from "./auth-shell";

const pushMock = vi.fn();

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("AuthShell", () => {
  beforeEach(() => {
    pushMock.mockClear();
    localStorage.clear();
  });

  it("allows creating an account with a phone number", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        message: "User registered successfully",
        data: { id: "user_123", email: "user@example.com" },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthShell />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "081234567890" } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByLabelText(/accept terms and conditions/i));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        }),
      );
    });
  });

  it("redirects to dashboard after a successful login and stores tokens", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        message: "Login Successful",
        data: { accessToken: "access-123", refreshToken: "refresh-123" },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthShell />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /login here/i }));
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBe("access-123");
      expect(localStorage.getItem("refreshToken")).toBe("refresh-123");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
