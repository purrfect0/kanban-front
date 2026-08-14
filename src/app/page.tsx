"use client";

import React from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  Globe,
  Bot,
  UserCheck,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { MagicCard } from "@/components/ui/MagicCard";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { BlurFade } from "@/components/ui/BlurFade";
import { AnimatedGridPattern } from "@/components/ui/AnimatedGridPattern";
import { getTaskDeadlineStatus } from "@/lib/repositories/KanbanRepository";

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
    members,
    setIsCreateProjectOpen,
    setSelectedTask,
    setActiveProjectId,
  } = useKanban();

  const formattedDate = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate Metrics
  const activeProjectsCount = projects.filter((p) => p.status === "active").length;
  const tasksInProgressCount = tasks.filter((t) => t.columnId === "in_progress").length;
  const overdueTasksCount = tasks.filter(
    (t) => t.columnId !== "done" && getTaskDeadlineStatus(t.dueDate) === "overdue"
  ).length;

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const dueThisWeekCount = tasks.filter((t) => {
    if (!t.dueDate || t.columnId === "done") return false;
    const d = new Date(t.dueDate);
    return d >= today && d <= nextWeek;
  }).length;

  // Tasks requiring attention (overdue or blocked)
  const attentionTasks = tasks.filter(
    (t) => t.columnId !== "done" && (t.isBlocked || getTaskDeadlineStatus(t.dueDate) === "overdue")
  );

  // Upcoming deadlines
  const upcomingDeadlines = tasks
    .filter((t) => t.columnId !== "done" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="relative space-y-8 max-w-7xl mx-auto">
      <AnimatedGridPattern />

      {/* Greeting Header */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              Привет, команда SSJCorp! 👋
            </h1>
            <p className="text-xs font-mono text-muted-foreground capitalize mt-1">
              Сегодня {formattedDate}
            </p>
          </div>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-ssj-purple px-4 py-2 text-xs font-medium text-white shadow-md hover:bg-ssj-purple/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Создать проект</span>
          </button>
        </div>
      </BlurFade>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <BlurFade delay={0.1}>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                Активные проекты
              </span>
              <FolderKanban className="h-4 w-4 text-ssj-purple" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              <NumberTicker value={activeProjectsCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">В разработке у SSJCorp</p>
          </div>
        </BlurFade>

        {/* Metric 2 */}
        <BlurFade delay={0.15}>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                Задач в работе
              </span>
              <Clock className="h-4 w-4 text-ssj-web" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              <NumberTicker value={tasksInProgressCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">В колонке «В работе»</p>
          </div>
        </BlurFade>

        {/* Metric 3 */}
        <BlurFade delay={0.2}>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                Просрочено
              </span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-2xl font-bold font-mono text-destructive">
              <NumberTicker value={overdueTasksCount} />
            </div>
            <p className="text-[11px] text-destructive/80">Требуют внимания</p>
          </div>
        </BlurFade>

        {/* Metric 4 */}
        <BlurFade delay={0.25}>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                Сроки на неделе
              </span>
              <Calendar className="h-4 w-4 text-ssj-bot" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              <NumberTicker value={dueThisWeekCount} />
            </div>
            <p className="text-[11px] text-muted-foreground">Дедлайн в ближайшие 7 дней</p>
          </div>
        </BlurFade>
      </div>

      {/* Projects Grid Section */}
      <BlurFade delay={0.3}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-ssj-purple" />
              Проекты компании ({projects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const completedTasks = projectTasks.filter((t) => t.columnId === "done").length;
              const overdueCount = projectTasks.filter(
                (t) => t.columnId !== "done" && getTaskDeadlineStatus(t.dueDate) === "overdue"
              ).length;
              const progressPct =
                projectTasks.length > 0
                  ? Math.round((completedTasks / projectTasks.length) * 100)
                  : 0;

              const leadMember = members.find((m) => m.id === project.leadId);
              const teamMembers = members.filter((m) => project.memberIds.includes(m.id));

              const TypeIcon = project.type === "website" ? Globe : Bot;

              return (
                <MagicCard key={project.id}>
                  <div className="flex flex-col h-full justify-between space-y-4">
                    {/* Card Top */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            project.type === "website"
                              ? "bg-ssj-web/15 text-ssj-web border border-ssj-web/30"
                              : "bg-ssj-bot/15 text-ssj-bot border border-ssj-bot/30"
                          }`}
                        >
                          <TypeIcon className="h-3.5 w-3.5" />
                          <span>{project.type === "website" ? "Сайт" : "Telegram-бот"}</span>
                        </span>

                        {overdueCount > 0 && (
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-destructive/20 text-destructive border border-destructive/40 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {overdueCount} просрочено
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-ssj-purple transition-colors">
                        {project.name}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>Прогресс</span>
                        <span className="font-semibold text-foreground">
                          {progressPct}% ({completedTasks}/{projectTasks.length})
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700/60 overflow-hidden">
                        <div
                          className="h-full bg-ssj-purple transition-all duration-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer / Lead / Link */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {leadMember && (
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <span className="font-mono text-[10px] bg-ssj-purple/20 text-ssj-purple px-1.5 py-0.5 rounded">
                              Lead: {leadMember.avatar}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/board/?project=${project.slug}`}
                        onClick={() => setActiveProjectId(project.id)}
                        className="flex items-center gap-1 text-xs font-medium text-ssj-purple hover:underline"
                      >
                        <span>На доску</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </MagicCard>
              );
            })}
          </div>
        </div>
      </BlurFade>

      {/* Bottom Dual Grid: Attention Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block 1: Tasks Needing Attention */}
        <BlurFade delay={0.4}>
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Задачи, требующие внимания ({attentionTasks.length})
            </h3>

            <div className="space-y-2.5">
              {attentionTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 text-xs hover:border-ssj-purple/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="font-mono font-semibold text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded">
                      {task.id}
                    </span>
                    <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                      {task.title}
                    </span>
                  </div>

                  {task.isBlocked ? (
                    <span className="font-mono text-[10px] font-medium bg-destructive/20 text-destructive px-2 py-0.5 rounded border border-destructive/30">
                      Заблокирована
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-medium bg-destructive/20 text-destructive px-2 py-0.5 rounded border border-destructive/30">
                      Просрочено ({task.dueDate})
                    </span>
                  )}
                </div>
              ))}

              {attentionTasks.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Отлично! Нет проблемных или просроченных задач. 🎉
                </div>
              )}
            </div>
          </div>
        </BlurFade>

        {/* Block 2: Upcoming Deadlines */}
        <BlurFade delay={0.45}>
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ssj-bot" />
              Ближайшие дедлайны
            </h3>

            <div className="space-y-2.5">
              {upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 text-xs hover:border-ssj-purple/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="font-mono font-semibold text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded">
                      {task.id}
                    </span>
                    <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                      {task.title}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] font-medium text-muted-foreground">
                    {task.dueDate}
                  </span>
                </div>
              ))}

              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Нет приближающихся дедлайнов.
                </div>
              )}
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
