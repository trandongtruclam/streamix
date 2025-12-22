import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#35353b] bg-[#18181b] px-3 py-2 text-sm text-white ring-offset-[#18181b] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#adadb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9147ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
