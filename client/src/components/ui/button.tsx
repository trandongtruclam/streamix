import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9147ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181b] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#efeff1] text-[#18181b] hover:bg-[#dedee3]",
        destructive:
          "bg-[#eb0400] text-white hover:bg-[#eb0400]/90",
        outline:
          "border border-[#35353b] bg-transparent text-white hover:bg-[#35353b] hover:text-white",
        secondary:
          "bg-[#3d3d40] text-white hover:bg-[#53535f]",
        ghost: "text-[#dedee3] hover:bg-[#35353b] hover:text-white",
        link: "text-[#9147ff] underline-offset-4 hover:underline",
        primary: "bg-[#9147ff] text-white hover:bg-[#772ce8]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
