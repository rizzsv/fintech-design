import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-sky-600 text-white hover:bg-sky-700",
        gradient:
          "bg-gradient-to-r from-[oklch(0.52_0.18_250)] to-[oklch(0.42_0.16_250)] text-white shadow-[0_8px_24px_oklch(0.52_0.18_250/0.35)] hover:shadow-[0_12px_32px_oklch(0.52_0.18_250/0.45)] hover:brightness-110",
        glass:
          "border border-white/40 bg-white/20 text-white backdrop-blur-md hover:bg-white/30",
        secondary: "bg-sky-500/10 text-sky-700 hover:bg-sky-500/15",
        outline: "border border-slate-200 bg-white hover:bg-slate-50",
        ghost: "text-slate-700 hover:bg-slate-100",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-14 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
