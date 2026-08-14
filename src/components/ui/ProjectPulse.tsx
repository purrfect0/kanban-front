"use client";

import React from "react";
import { Project, Task } from "@/types/kanban";
import { calculateProjectStats } from "@/lib/utils/taskUtils";
import { formatDateRelative } from "@/lib/utils/dateUtils";
import { Logo } from "@/components/ui/Logo";
import { AlertTriangle, ShieldCheck, AlertCircle, Clock, CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectPulseProps {
  project: Project;
  tasks: Task[];
  compact?: boolean;
  hideCardWrapper?: boolean;
  className?: string;
}

export const ProjectPulse: React.FC<ProjectPulseProps> = ({
  project,
  tasks,
  compact = false,
  hideCardWrapper = false,
  className,
}) => {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const stats = calculateProjectStats(project, projectTasks);

  // Find next upcoming deadline
  const unfinishedWithDueDate = projectTasks
    .filter((t) => t.dueDate && t.columnId !== "done" && !t.completedAt)
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1));

  const nextTaskDueDate = unfinishedWithDueDate[0]?.dueDate || project.dueDate;

  const healthConfig = {
    normal: {
      label: "В норме",
      icon: ShieldCheck,
      badge: "bg-ssj-web/15 text-ssj-web border-ssj-web/30",
      track: "bg-ssj-web",
      glow: "shadow-ssj-web/20",
    },
    risk: {
      label: "Есть риск",
      icon: AlertTriangle,
      badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      track: "bg-amber-500",
      glow: "shadow-amber-500/20",
    },
    critical: {
      label: "Критично",
      icon: AlertCircle,
      badge: "bg-destructive/15 text-destructive border-destructive/30",
      track: "bg-destructive",
      glow: "shadow-destructive/20",
    },
  };

  const healthInfo = healthConfig[stats.health];
  const HealthIcon = healthInfo.icon;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border",
                healthInfo.badge
              )}
            >
              <HealthIcon className="h-3 w-3 shrink-0" />
              <span>{healthInfo.label}</span>
            </span>
          </div>

          <span className="font-mono text-xs text-muted-foreground font-medium">
            {stats.progressPercentage}% ({stats.completedTasks}/{stats.totalTasks})
          </span>
        </div>

        {/* Thin glowing progress track */}
        <div className="relative h-1.5 w-full rounded-full bg-muted/60 dark:bg-zinc-800 border border-border/40 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              stats.health === "normal"
                ? "bg-ssj-purple"
                : stats.health === "risk"
                ? "bg-amber-500"
                : "bg-destructive"
            )}
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  const innerContent = (
    <div className="space-y-3.5 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div
        className={cn(
          "absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none",
          stats.health === "normal" && "bg-ssj-purple",
          stats.health === "risk" && "bg-amber-500",
          stats.health === "critical" && "bg-destructive"
        )}
      />

      {/* Pulse Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-ssj-purple/15 border border-ssj-purple/30 p-1 text-ssj-purple flex items-center justify-center shrink-0">
            <Logo className="h-full w-full object-contain" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Project Pulse
          </span>
        </div>

        {/* Health Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold font-mono border",
            healthInfo.badge
          )}
        >
          <HealthIcon className="h-3.5 w-3.5" />
          <span>{healthInfo.label}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">Прогресс выполнения</span>
          <span className="font-bold text-foreground">
            {stats.progressPercentage}% ({stats.completedTasks}/{stats.totalTasks} задач)
          </span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800/80 border border-border/40 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-700 rounded-full",
              stats.health === "normal"
                ? "bg-ssj-purple"
                : stats.health === "risk"
                ? "bg-amber-500"
                : "bg-destructive"
            )}
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Next Deadline */}
        <div className="rounded-xl border border-border/50 bg-background/60 p-2 text-xs space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <Clock className="h-3 w-3 text-ssj-bot" />
            <span>Дедлайн</span>
          </div>
          <div className="font-semibold text-foreground truncate">
            {nextTaskDueDate ? formatDateRelative(nextTaskDueDate) : "Не указан"}
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-border/50 bg-background/60 p-2 text-xs space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <CheckCircle2 className="h-3 w-3 text-ssj-web" />
            <span>Завершено</span>
          </div>
          <div className="font-semibold text-foreground font-mono">
            {stats.completedTasks} из {stats.totalTasks}
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-xl border border-border/50 bg-background/60 p-2 text-xs space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <span>Просрочено</span>
          </div>
          <div
            className={cn(
              "font-semibold font-mono",
              stats.overdueTasks > 0 ? "text-destructive" : "text-foreground"
            )}
          >
            {stats.overdueTasks} {stats.overdueTasks === 1 ? "задача" : "задач"}
          </div>
        </div>

        {/* Blocked */}
        <div className="rounded-xl border border-border/50 bg-background/60 p-2 text-xs space-y-0.5">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <Ban className="h-3 w-3 text-amber-500" />
            <span>Блокировки</span>
          </div>
          <div
            className={cn(
              "font-semibold font-mono",
              stats.blockedTasks > 0 ? "text-amber-500" : "text-foreground"
            )}
          >
            {stats.blockedTasks} {stats.blockedTasks === 1 ? "задача" : "задач"}
          </div>
        </div>
      </div>
    </div>
  );

  if (hideCardWrapper) {
    return <div className={className}>{innerContent}</div>;
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-md space-y-3.5 transition-all overflow-hidden",
        className
      )}
    >
      {innerContent}
    </div>
  );
};
