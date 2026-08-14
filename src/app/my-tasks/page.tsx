"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKanban } from "@/store/KanbanContext";
import { Task } from "@/types/kanban";
import { isTaskOverdue, isTaskDueToday } from "@/lib/utils/taskUtils";
import { formatDateRelative, formatDateCompact } from "@/lib/utils/dateUtils";
import { BlurFade } from "@/components/ui/BlurFade";
import {
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Ban,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyTasksPage() {
  return (
    <AppLayout>
      <MyTasksContent />
    </AppLayout>
  );
}

function MyTasksContent() {
  const { tasks, projects, members, columns, setSelectedTask } = useKanban();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || "m1"
  );

  // Sync selected member to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ssjcorp-kanban:selected-my-tasks-member");
      if (saved && members.some((m) => m.id === saved)) {
        setSelectedMemberId(saved);
      } else if (members[0]) {
        setSelectedMemberId(members[0].id);
      }
    }
  }, [members]);

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("ssjcorp-kanban:selected-my-tasks-member", id);
    }
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  // Tasks assigned to selected developer
  const myTasks = tasks.filter((t) => t.assigneeIds.includes(selectedMemberId));

  const activeMyTasks = myTasks.filter((t) => t.columnId !== "done" && !t.completedAt);
  const overdueMyTasks = activeMyTasks.filter(isTaskOverdue);
  const todayMyTasks = activeMyTasks.filter(isTaskDueToday);
  const blockedMyTasks = activeMyTasks.filter((t) => t.isBlocked);
  const inProgressMyTasks = activeMyTasks.filter((t) => t.columnId === "in_progress");
  const reviewMyTasks = activeMyTasks.filter((t) => t.columnId === "review");

  // Sum time estimate
  const totalEstimateHours = activeMyTasks.reduce((sum, t) => {
    if (!t.timeEstimate) return sum;
    const match = t.timeEstimate.match(/(\d+)h/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Subheader & Member Selector */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-ssj-purple" />
              Мои задачи
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Персональный список задач и загрузки исполнителя
            </p>
          </div>

          {/* Member Switcher */}
          <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs font-mono text-muted-foreground">Исполнитель:</span>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </BlurFade>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <BlurFade delay={0.1}>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase">Активных задач</span>
              <Layers className="h-4 w-4 text-ssj-purple" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {activeMyTasks.length}
            </div>
            <p className="text-[10px] text-muted-foreground">Из {myTasks.length} всех назначенных</p>
          </div>
        </BlurFade>

        {/* Metric 2 */}
        <BlurFade delay={0.15}>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase">Часов в работе</span>
              <Clock className="h-4 w-4 text-ssj-bot" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {totalEstimateHours}h
            </div>
            <p className="text-[10px] text-muted-foreground">Суммарная оценка времени</p>
          </div>
        </BlurFade>

        {/* Metric 3 */}
        <BlurFade delay={0.2}>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase">Просрочено</span>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-2xl font-bold font-mono text-destructive">
              {overdueMyTasks.length}
            </div>
            <p className="text-[10px] text-destructive/80">Требуют скорейшей сдачи</p>
          </div>
        </BlurFade>

        {/* Metric 4 */}
        <BlurFade delay={0.25}>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-mono font-medium uppercase">На проверке</span>
              <CheckCircle2 className="h-4 w-4 text-ssj-web" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {reviewMyTasks.length}
            </div>
            <p className="text-[10px] text-muted-foreground">Ожидают ревью лида</p>
          </div>
        </BlurFade>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Overdue Section */}
        {overdueMyTasks.length > 0 && (
          <BlurFade delay={0.3} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Просроченные задачи ({overdueMyTasks.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {overdueMyTasks.map((task) => (
                <MyTaskCard key={task.id} task={task} />
              ))}
            </div>
          </BlurFade>
        )}

        {/* Today Section */}
        {todayMyTasks.length > 0 && (
          <BlurFade delay={0.35} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <Clock className="h-4 w-4" />
              <span>Дедлайн сегодня ({todayMyTasks.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todayMyTasks.map((task) => (
                <MyTaskCard key={task.id} task={task} />
              ))}
            </div>
          </BlurFade>
        )}

        {/* In Progress Section */}
        {inProgressMyTasks.length > 0 && (
          <BlurFade delay={0.4} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-ssj-purple">
              <Sparkles className="h-4 w-4" />
              <span>В работе сейчас ({inProgressMyTasks.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {inProgressMyTasks.map((task) => (
                <MyTaskCard key={task.id} task={task} />
              ))}
            </div>
          </BlurFade>
        )}

        {/* All Remaining Active Tasks */}
        <BlurFade delay={0.45} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Все активные задачи ({activeMyTasks.length})</span>
          </div>

          {activeMyTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">У разработчика нет активных задач</p>
              <p className="mt-1">Все задачи завершены или перенесены в архив.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeMyTasks.map((task) => (
                <MyTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </BlurFade>
      </div>
    </div>
  );
}

function MyTaskCard({ task }: { task: Task }) {
  const { projects, columns, setSelectedTask } = useKanban();
  const proj = projects.find((p) => p.id === task.projectId);
  const col = columns.find((c) => c.id === task.columnId);

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm hover:border-ssj-purple/50 cursor-pointer transition-all space-y-3 group"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded-lg border border-ssj-purple/20">
            {task.id}
          </span>
          {proj && (
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {proj.name}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-ssj-purple transition-colors">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {col && (
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {col.title}
            </span>
          )}
          {task.timeEstimate && <span>{task.timeEstimate}</span>}
        </div>

        {task.dueDate && (
          <span
            className={cn(
              "font-mono text-[11px] font-semibold",
              isTaskOverdue(task) && "text-destructive font-bold"
            )}
          >
            {formatDateCompact(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
