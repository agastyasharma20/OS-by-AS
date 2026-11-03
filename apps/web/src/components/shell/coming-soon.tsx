"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@osbyas/ui/components/popover";
import type { ReactNode } from "react";

/** Wraps a control whose feature is not built yet, so it explains itself instead of doing nothing. */
export function ComingSoon({
  trigger,
  title,
  body,
}: {
  trigger: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-muted-foreground">{body}</p>
      </PopoverContent>
    </Popover>
  );
}
