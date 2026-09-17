export type AuthMode = "login" | "register";

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
