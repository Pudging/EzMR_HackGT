import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  value,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      value={value ?? ""}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input h-10 w-full min-w-0 border-4 border-black bg-transparent px-4 py-2 text-base font-bold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
        "focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
        "aria-invalid:border-destructive aria-invalid:shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
