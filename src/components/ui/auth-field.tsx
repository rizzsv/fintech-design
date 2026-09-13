"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/utils/cn";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, className, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id ?? React.useId();
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="space-y-2.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              "h-[52px] w-full rounded-2xl border border-slate-200 bg-[#f5f7fa] px-4 text-sm text-slate-900 outline-none transition-all duration-200",
              "placeholder:text-slate-400",
              "focus:border-[#2b7af8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(43,122,248,0.08)]",
              isPassword && "pr-12",
              error && "border-red-200 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

AuthField.displayName = "AuthField";
