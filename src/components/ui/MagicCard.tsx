"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientColor?: string;
  gradientSize?: number;
}

export const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className,
  gradientColor = "rgba(124, 108, 246, 0.15)",
  gradientSize = 250,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 transition-colors duration-200 hover:border-ssj-purple/40 hover:shadow-lg hover:shadow-ssj-purple/5 group",
        className
      )}
      {...props}
    >
      {/* Permanent Cursor Spotlight Overlay (Opacity Toggled to Prevent Layout Shift) */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px transition-opacity duration-300",
          position ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: position
            ? `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 80%)`
            : undefined,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
