"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = (
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
) => {
  const { className, sideOffset = 8, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden border-4 border-black p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
          className,
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

export const DropdownMenuItem = (
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
) => {
  const { className, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center border-2 border-transparent px-3 py-2 text-sm font-bold tracking-wider uppercase transition-all outline-none select-none hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:border-white dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
        className,
      )}
      {...rest}
    />
  );
};

export const DropdownMenuSeparator = (
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>,
) => {
  const { className, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-2 h-1 bg-black dark:bg-white", className)}
      {...rest}
    />
  );
};
