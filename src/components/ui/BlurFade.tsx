"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const BlurFade: React.FC<BlurFadeProps> = ({ children, delay = 0, className }) => {
  return (
    <div
      className={cn("animate-blur-fade", className)}
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
};
