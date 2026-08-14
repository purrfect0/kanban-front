"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKanban } from "@/store/KanbanContext";
import { isTaskOverdue, calculateProjectStats } from "@/lib/utils/taskUtils";
import { formatDateRelative } from "@/lib/utils/dateUtils";
import { MagicCard } from "@/components/ui/MagicCard";
import { BlurFade } from "@/components/ui/BlurFade";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { ProjectPulse } from "@/components/ui/ProjectPulse";
import { Logo } from "@/components/ui/Logo";
import {
  KanbanSquare,
  Globe,
  Bot,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ban,
  Clock,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  return (
    <AppLayout>
      <OverviewContent />
    </AppLayout>
  );
}

function OverviewContent() {
  const { projects, tasks, members, setIsCreateProjectOpen, setIsCreateTaskOpen } = useKanban();

  const activeProjects = projects.filter((p) => p.status !== "archived");

  // Global aggregate metrics
  const activeTasks = tasks.filter((t) => t.columnId !== "done" && !t.completedAt);
  const inProgressTasksCount = tasks.filter((t) => t.columnId === "in_progress").length;
  
  // Overdue calculation using centralized isTaskOverdue utility
  const overdueTasksCount = tasks.filter(isTaskOverdue).length;

  // Due within 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueThisWeekCount = tasks.filter((t) => {
    if (!t.dueDate || t.columnId === "done" || Boolean(t.completedAt)) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  // Average progress across active projects
  const totalProjectProgress = activeProjects.reduce((sum, proj) => {
    const projTasks = tasks.filter((t) => t.projectId === proj.id);
    const completed = projTasks.filter((t) => t.columnId === "done" || Boolean(t.completedAt)).length;
    return sum + (projTasks.length > 0 ? (completed / projTasks.length) * 100 : 0);
  }, 0);

  const avgProgressPct =
    activeProjects.length > 0 ? Math.round(totalProjectProgress / activeProjects.length) : 0;

  // Projects at risk count
  const projectsAtRiskCount = activeProjects.filter((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    const stats = calculateProjectStats(p, pTasks);
    return stats.health === "risk" || stats.health === "critical";
  }).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-ssj-purple/15 border border-ssj-purple/30 p-1 text-ssj-purple flex items-center justify-center">
                <Logo className="h-full w-full object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Обзор проектов SSJCorp
                <Sparkles className="h-4 w-4 text-ssj-purple shrink-0" />
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Центральная телеметрия проектов, распределения задач и здоровья процессов
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Новый проект</span>
            </button>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-ssj-purple px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-ssj-purple/90 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Создать задачу</span>
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Large Bento Box: Active Projects Aggregate & Progress */}
        <BlurFade delay={0.1} className="md:col-span-2">
          <div className="h-full rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm space-y-4 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Команда & Активные проекты
                </span>
                <div className="text-2xl font-bold font-mono text-foreground flex items-center gap-2">
                  <NumberTicker value={activeProjects.length} />
                  <span className="text-xs font-sans text-muted-foreground font-normal">проекта в работе</span>
                </div>
              </div>

              {projectsAtRiskCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-mono font-semibold text-amber-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{projectsAtRiskCount} под риском</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-xl bg-ssj-web/15 border border-ssj-web/30 px-2.5 py-1 text-xs font-mono font-semibold text-ssj-web">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Все в норме</span>
                </span>
              )}
            </div>

            {/* Average Progress Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Средний прогресс по компании</span>
                <span className="font-bold text-ssj-purple">{avgProgressPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 border border-border/40 overflow-hidden">
                <div
                  className="h-full bg-ssj-purple transition-all duration-700 rounded-full"
                  style={{ width: `${avgProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Bento Box 2: Tasks in Progress */}
        <BlurFade delay={0.15}>
          <div className="h-full rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm space-y-2 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">В работе</span>
              <Sparkles className="h-4 w-4 text-ssj-purple" />
            </div>
            <div className="text-3xl font-bold font-mono text-ssj-purple">
              <NumberTicker value={inProgressTasksCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">Задач в активной разработке</p>
          </div>
        </BlurFade>

        {/* Bento Box 3: Overdue */}
        <BlurFade delay={0.2}>
          <div className="h-full rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm space-y-2 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Просрочено</span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-3xl font-bold font-mono text-destructive">
              <NumberTicker value={overdueTasksCount} />
            </div>
            <p className="text-[11px] text-destructive/80 font-medium">Требуют скорейшего внимания</p>
          </div>
        </BlurFade>
      </div>

      {/* Projects Grid Section */}
      <div className="space-y-4">
        <BlurFade delay={0.25}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-ssj-purple" />
              Проекты компании ({projects.length})
            </h2>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const leadMember = members.find((m) => m.id === project.leadId);
            const teamMembers = members.filter((m) => project.memberIds.includes(m.id));
            const TypeIcon = project.type === "website" ? Globe : Bot;

            return (
              <BlurFade key={project.id} delay={0.3 + idx * 0.08}>
                <MagicCard className="h-full">
                  <div className="flex flex-col h-full justify-between space-y-5">
                    {/* Top Row: Type Badge + Health */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border",
                            project.type === "website"
                              ? "bg-ssj-web/15 text-ssj-web border-ssj-web/30"
                              : "bg-ssj-bot/15 text-ssj-bot border-ssj-bot/30"
                          )}
                        >
                          <TypeIcon className="h-3.5 w-3.5" />
                          <span>{project.type === "website" ? "Сайт" : "Telegram-бот"}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-ssj-purple transition-colors">
                        {project.name}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Project Pulse Component */}
                    <ProjectPulse project={project} tasks={tasks} compact />

                    {/* Footer Row: Lead, Team, Go to Board button */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                      {leadMember && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="text-[11px] font-mono">Lead:</span>
                          <span className="font-semibold text-foreground">{leadMember.name}</span>
                        </div>
                      )}

                      <Link
                        href={`/board/?project=${project.slug}`}
                        className="flex items-center gap-1 font-semibold text-ssj-purple hover:underline"
                      >
                        <span>На доску</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </div>
  );
}
