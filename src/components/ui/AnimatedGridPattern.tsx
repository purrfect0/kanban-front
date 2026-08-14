"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const AnimatedGridPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    />
  );
};
