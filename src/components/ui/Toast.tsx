"use client";

import React, { useEffect } from "react";
import { ToastMessage } from "@/types/kanban";
import { RotateCcw, X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const iconMap = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = iconMap[toast.type || "info"];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-blur-fade max-w-md w-full px-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-300 dark:border-zinc-800 bg-card text-card-foreground p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3 min-w-0">
          <Icon className="h-5 w-5 text-ssj-purple shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">{toast.title}</h4>
            {toast.description && (
              <p className="text-[11px] text-muted-foreground truncate">{toast.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              className="flex items-center gap-1 rounded-xl bg-ssj-purple/20 border border-ssj-purple/40 px-3 py-1.5 text-xs font-semibold text-ssj-purple hover:bg-ssj-purple/30 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{toast.action.label}</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
