import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z.object({
  email: z.email("Please enter a valid email address."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits.").max(15, "Phone number is too long."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
