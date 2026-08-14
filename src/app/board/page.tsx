"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useKanban } from "@/store/KanbanContext";
import { ProjectPulse } from "@/components/ui/ProjectPulse";
import { BlurFade } from "@/components/ui/BlurFade";
import { SlidersHorizontal, X, Filter } from "lucide-react";

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

  return (
    <div className="space-y-4">
      {/* Active Project Subheader & Project Pulse Telemetry Bar */}
      <BlurFade delay={0.05} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>{activeProject ? activeProject.name : "Все проекты"}</span>
              {activeProject && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-ssj-purple/15 text-ssj-purple border border-ssj-purple/30">
                  {activeProject.type === "website" ? "Сайт" : "Telegram-бот"}
                </span>
              )}
            </h2>
            {activeProject && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeProject.description}
              </p>
            )}
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, onlyOverdue: !prev.onlyOverdue }))
              }
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                filters.onlyOverdue
                  ? "bg-destructive/20 text-destructive border-destructive/50 shadow-xs"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Просроченные
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, onlyBlocked: !prev.onlyBlocked }))
              }
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                filters.onlyBlocked
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/50 shadow-xs"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Заблокированные
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors ml-1 font-semibold"
              >
                <X className="h-3.5 w-3.5" />
                <span>Сбросить</span>
              </button>
            )}
          </div>
        </div>

        {/* Render Project Pulse Telemetry Panel if active project exists */}
        {activeProject && (
          <ProjectPulse project={activeProject} tasks={tasks} />
        )}
      </BlurFade>

      {/* Drag & Drop Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
