"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKanban } from "@/store/KanbanContext";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { MagicCard } from "@/components/ui/MagicCard";
import { ProjectPulse } from "@/components/ui/ProjectPulse";
import { BlurFade } from "@/components/ui/BlurFade";
import {
  KanbanSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function OverviewPage() {
  return (
    <AppLayout>
      <OverviewContent />
    </AppLayout>
  );
}

function OverviewContent() {
  const {
    projects,
    tasks,
    setActiveProjectId,
    setIsCreateTaskOpen,
    setIsCreateProjectOpen,
  } = useKanban();

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.columnId === "done").length;
  const overdueTasksCount = tasks.filter(
    (t) => t.dueDate && t.dueDate < new Date().toISOString().split("T")[0] && t.columnId !== "done"
  ).length;
  const blockedTasksCount = tasks.filter((t) => t.isBlocked).length;

  const overallProgress =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-8 w-full max-w-none pb-8">
      {/* Top Banner / Hero Welcome */}
      <BlurFade delay={0.05} className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-ssj-purple/15 via-ssj-purple/5 to-transparent p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-xl bg-ssj-purple/20 px-3 py-1 text-xs font-mono font-bold text-ssj-purple border border-ssj-purple/30">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Фирменный стиль SSJCorp</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Обзор проектов и метрики команды
            </h1>
            <p className="text-sm text-muted-foreground">
              Центральный хаб управления веб-разработкой и ботами SSJCorp. Отслеживайте дедлайны, прогресс и блокировки в реальном времени.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Новый проект</span>
            </button>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-ssj-purple px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-ssj-purple/90 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Создать задачу</span>
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Metrics Row (4 Bento Chips with Number Ticker) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks */}
        <BlurFade delay={0.1}>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Всего задач</span>
              <KanbanSquare className="h-4 w-4 text-ssj-purple" />
            </div>
            <div className="text-2xl font-extrabold text-foreground font-mono">
              <NumberTicker value={totalTasksCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">Во всех проектах</p>
          </div>
        </BlurFade>

        {/* Metric 2: Completed */}
        <BlurFade delay={0.12}>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Завершено</span>
              <CheckCircle2 className="h-4 w-4 text-ssj-web" />
            </div>
            <div className="text-2xl font-extrabold text-ssj-web font-mono">
              <NumberTicker value={completedTasksCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">Общий прогресс: {overallProgress}%</p>
          </div>
        </BlurFade>

        {/* Metric 3: Overdue */}
        <BlurFade delay={0.14}>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Просрочено</span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-2xl font-extrabold text-destructive font-mono">
              <NumberTicker value={overdueTasksCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">Требуют внимания</p>
          </div>
        </BlurFade>

        {/* Metric 4: Blocked */}
        <BlurFade delay={0.16}>
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Блокировки</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-500 font-mono">
              <NumberTicker value={blockedTasksCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">Заблокированы командами</p>
          </div>
        </BlurFade>
      </div>

      {/* Active Projects Grid (Unified Single Cards with Dividers) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Проекты команды</h2>
          <span className="text-xs font-mono text-muted-foreground">
            Активных: {projects.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <BlurFade key={project.id} delay={0.2 + idx * 0.05}>
              <MagicCard className="p-5 space-y-4">
                {/* Upper Section: Project Title, Type Badge, Description & Navigation Arrow */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{project.name}</h3>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-ssj-purple/15 text-ssj-purple border border-ssj-purple/30">
                        {project.type === "website" ? "Сайт" : "Telegram-бот"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <Link
                    href={`/board/?project=${project.slug}`}
                    onClick={() => setActiveProjectId(project.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground hover:bg-ssj-purple hover:text-white transition-all shadow-2xs shrink-0"
                    title="Открыть канбан-доску проекта"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Clean Horizontal Dividing Line */}
                <div className="border-t border-border/40 pt-4">
                  {/* Embedded Project Pulse Telemetry Panel */}
                  <ProjectPulse project={project} tasks={tasks} hideCardWrapper />
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </div>
  );
}
