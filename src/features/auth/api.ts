import { API_BASE_URL } from "@/api/client";

export interface AuthApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
}

export interface VerifyEmailResponse {
  userId: string;
  email: string;
  isEmailVerified: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Error thrown for non-2xx responses, carrying the backend error code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, body: object | undefined, method: "POST" | "GET" = "POST") {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as
    | (Partial<AuthApiResponse<T>> & { code?: string })
    | null;

  if (!response.ok) {
    throw new ApiError(payload?.message || "Request failed", response.status, payload?.code ?? null);
  }

  return payload?.data as T;
}

export const authApi = {
  login: (payload: LoginPayload) => request<LoginResponse>("/auth/login", payload),
  register: (payload: RegisterPayload) => request<RegisterResponse>("/auth/register", payload),
  logout: (refreshToken: string) => request<null>("/auth/logout", { refreshToken }),
  verifyEmail: (token: string) => request<VerifyEmailResponse>("/auth/verify-email", { token }),
  resendVerification: (email: string) => request<null>("/auth/resend-verification", { email }),
};
