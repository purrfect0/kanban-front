"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useKanban } from "@/store/KanbanContext";
import { calculateProjectStats } from "@/lib/utils/taskUtils";
import { ShieldCheck, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BoardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-6 text-muted-foreground text-sm font-mono">Загрузка канбан-доски...</div>}>
        <BoardContent />
      </Suspense>
    </AppLayout>
  );
}

function BoardContent() {
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get("project");
  const {
    projects,
    tasks,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    filters,
    setFilters,
    resetFilters,
  } = useKanban();

  // Sync query parameter ?project=slug to context
  useEffect(() => {
    if (projectSlug && projects.length > 0) {
      const match = projects.find((p) => p.slug === projectSlug);
      if (match && match.id !== activeProjectId) {
        setActiveProjectId(match.id);
      }
    }
  }, [projectSlug, projects, activeProjectId, setActiveProjectId]);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.priority) ||
    Boolean(filters.assigneeId) ||
    Boolean(filters.onlyOverdue) ||
    Boolean(filters.onlyBlocked);

  // Project stats for 1-line compact subheader telemetry
  const projectTasks = activeProject
    ? tasks.filter((t) => t.projectId === activeProject.id)
    : tasks;
  const stats = activeProject
    ? calculateProjectStats(activeProject, projectTasks)
    : null;

  const healthConfig = {
    normal: {
      label: "В норме",
      icon: ShieldCheck,
      badge: "bg-ssj-web/15 text-ssj-web border-ssj-web/30",
      track: "bg-ssj-web",
    },
    risk: {
      label: "Есть риск",
      icon: AlertTriangle,
      badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      track: "bg-amber-500",
    },
    critical: {
      label: "Критично",
      icon: AlertCircle,
      badge: "bg-destructive/15 text-destructive border-destructive/30",
      track: "bg-destructive",
    },
  };

  const healthInfo = stats ? healthConfig[stats.health] : null;
  const HealthIcon = healthInfo?.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-3 sm:-m-4 md:-m-6 overflow-hidden">
      {/* Sleek Fixed Subheader Bar (Height ~48px) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-border/40 bg-card/80 backdrop-blur-md z-20">
        {/* Left: Project Title + Badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-sm font-bold text-foreground truncate">
            {activeProject ? activeProject.name : "Все проекты"}
          </h2>

          {activeProject && (
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-ssj-purple/15 text-ssj-purple border border-ssj-purple/30 shrink-0">
              {activeProject.type === "website" ? "Сайт" : "Telegram-бот"}
            </span>
          )}

          {healthInfo && HealthIcon && (
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[11px] font-semibold border shrink-0",
                healthInfo.badge
              )}
            >
              <HealthIcon className="h-3 w-3" />
              <span>{healthInfo.label}</span>
            </span>
          )}
        </div>

        {/* Center: Thin Progress Bar */}
        {stats && (
          <div className="hidden md:flex items-center gap-3 w-64 shrink-0">
            <div className="relative flex-1 h-1.5 rounded-full bg-muted/60 dark:bg-zinc-800 border border-border/40 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  healthInfo?.track || "bg-ssj-purple"
                )}
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-muted-foreground shrink-0">
              {stats.progressPercentage}% ({stats.completedTasks}/{stats.totalTasks})
            </span>
          </div>
        )}

        {/* Right: Quick Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyOverdue: !prev.onlyOverdue }))
            }
            className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all ${
              filters.onlyOverdue
                ? "bg-destructive/20 text-destructive border-destructive/50"
                : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            Просроченные
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyBlocked: !prev.onlyBlocked }))
            }
            className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all ${
              filters.onlyBlocked
                ? "bg-amber-500/20 text-amber-500 border-amber-500/50"
                : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            Заблокированные
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-semibold"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Сбросить</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Board View Container (Fills 100% of remaining viewport height) */}
      <div className="flex-1 min-h-0 p-4 overflow-x-auto overflow-y-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
