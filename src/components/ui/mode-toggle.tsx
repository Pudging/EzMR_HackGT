"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="brutalist-button">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background space-y-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
      >
        <DropdownMenuItem
          className={cn(
            "border-2 border-transparent font-bold tracking-wider uppercase hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:border-white dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
            theme === "light" &&
              "bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
          )}
          onClick={() => setTheme("light")}
        >
          LIGHT
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "border-2 border-transparent font-bold tracking-wider uppercase hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:border-white dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
            theme === "dark" &&
              "bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
          )}
          onClick={() => setTheme("dark")}
        >
          DARK
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "border-2 border-transparent font-bold tracking-wider uppercase hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:border-white dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
            theme === "system" &&
              "bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
          )}
          onClick={() => setTheme("system")}
        >
          SYSTEM
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
