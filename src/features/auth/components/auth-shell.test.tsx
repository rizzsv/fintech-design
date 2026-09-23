import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthShell } from "./auth-shell";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderAuthShell() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthShell />
    </QueryClientProvider>,
  );
}

function stubFetch(data: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => ({ status: ok ? "success" : "error", message: "", data }),
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

/** The shell opens on the login form, so registering starts with the toggle. */
function switchToRegister() {
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
}

describe("AuthShell", () => {
  beforeEach(() => {
    pushMock.mockClear();
    localStorage.clear();
  });

  it("redirects to the dashboard after a successful login and stores the tokens", async () => {
    stubFetch({ accessToken: "access-123", refreshToken: "refresh-123" });

    renderAuthShell();

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBe("access-123");
      expect(localStorage.getItem("refreshToken")).toBe("refresh-123");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("registers an account and sends the user to the email check screen", async () => {
    const fetchMock = stubFetch({ id: "user_123", email: "user@example.com" });

    renderAuthShell();
    switchToRegister();

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "081234567890" } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByLabelText(/accept terms and conditions/i));
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        }),
      );
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/check-email?email=user%40example.com");
    });
  });

  /**
   * The terms gate lives in the mutation rather than the schema, so it is the
   * only register rule that a valid form can still fail.
   */
  it("refuses to register until the terms are accepted", async () => {
    const fetchMock = stubFetch({ id: "user_123", email: "user@example.com" });

    renderAuthShell();
    switchToRegister();

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "081234567890" } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/accept the terms and conditions/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
