"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

export interface FloatingInputProps extends Omit<React.ComponentProps<"input">, "placeholder"> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, icon: Icon, error, className, id, onFocus, onBlur, onChange, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      Boolean(props.value ?? props.defaultValue),
    );
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const floated = focused || hasValue;

    return (
      <div className="space-y-1">
        <div
          className={cn(
            "group relative flex items-stretch overflow-hidden rounded-xl border transition-all duration-300",
            "bg-white/50 backdrop-blur-sm",
            focused
              ? "border-sky-400/70 bg-sky-50/30 shadow-[0_0_0_3px_oklch(0.62_0.14_250/0.15),0_4px_12px_oklch(0.52_0.18_250/0.08)]"
              : "border-slate-200/70 shadow-sm hover:border-slate-300/80",
            error && "border-red-400/80 shadow-[0_0_0_3px_oklch(0.62_0.2_25/0.12)]",
            className,
          )}
        >
          {Icon && (
            <div
              className={cn(
                "flex items-center pl-3.5 transition-colors duration-300",
                focused ? "text-sky-600" : "text-slate-400 group-hover:text-slate-500",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
          )}

          <div className="relative min-h-12 flex-1 px-3.5">
            <motion.label
              htmlFor={inputId}
              initial={false}
              animate={{
                y: floated ? -10 : 0,
                scale: floated ? 0.82 : 1,
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "pointer-events-none absolute top-1/2 left-3.5 origin-left -translate-y-1/2 font-medium transition-colors duration-300",
                floated ? "text-xs text-sky-600" : "text-sm text-slate-400",
              )}
            >
              {label}
            </motion.label>

            <input
              id={inputId}
              ref={mergeRefs(ref)}
              className="h-12 w-full bg-transparent pt-4 pb-1 text-sm font-medium text-slate-900 outline-none"
              onFocus={(event) => {
                setFocused(true);
                onFocus?.(event);
              }}
              onBlur={(event) => {
                setFocused(false);
                setHasValue(Boolean(event.target.value));
                onBlur?.(event);
              }}
              onChange={(event) => {
                setHasValue(Boolean(event.target.value));
                onChange?.(event);
              }}
              {...props}
            />
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
