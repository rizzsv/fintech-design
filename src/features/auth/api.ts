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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

async function request<T>(path: string, body: object | undefined, method: "POST" | "GET" = "POST") {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as AuthApiResponse<T> | null;

  if (!response.ok) {
    const message = payload?.message || payload?.status || "Request failed";
    throw new Error(message);
  }

  return payload?.data as T;
}

export const authApi = {
  login: (payload: LoginPayload) => request<LoginResponse>("/auth/login", payload),
  register: (payload: RegisterPayload) => request<RegisterResponse>("/auth/register", payload),
  logout: (refreshToken: string) => request<null>("/auth/logout", { refreshToken }),
};
