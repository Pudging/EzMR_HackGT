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
  const { className, sideOffset = 4, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-black shadow-md",
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
        "relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:bg-gray-100 focus:bg-gray-100",
        className,
      )}
      {...rest}
    />
  );
};
