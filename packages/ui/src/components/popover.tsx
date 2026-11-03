"use client";

import { Popover as P } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "../cn";

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;

export function PopoverContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-lg border border-border bg-surface p-4 text-sm text-surface-foreground shadow-lg outline-none",
          className,
        )}
        {...props}
      />
    </P.Portal>
  );
}
