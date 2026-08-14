"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKanban } from "@/store/KanbanContext";
import { Task, Priority } from "@/types/kanban";
import { getTaskDeadlineStatus } from "@/lib/repositories/KanbanRepository";
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  User,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeadlinesPage() {
  return (
    <AppLayout>
      <DeadlinesContent />
    </AppLayout>
  );
}

function DeadlinesContent() {
  const {
    tasks,
    projects,
    members,
    columns,
    setSelectedTask,
  } = useKanban();

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
    if (assigneeFilter !== "all" && !t.assigneeIds.includes(assigneeFilter)) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  // Group tasks by period
  const overdueTasks: Task[] = [];
  const todayTasks: Task[] = [];
  const next7DaysTasks: Task[] = [];
  const laterTasks: Task[] = [];
  const noDeadlineTasks: Task[] = [];

  filteredTasks.forEach((task) => {
    if (!task.dueDate) {
      noDeadlineTasks.push(task);
      return;
    }

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      overdueTasks.push(task);
    } else if (diffDays === 0) {
      todayTasks.push(task);
    } else if (diffDays <= 7) {
      next7DaysTasks.push(task);
    } else {
      laterTasks.push(task);
    }
  });

  const periods = [
    {
      title: "Просрочено",
      count: overdueTasks.length,
      tasks: overdueTasks,
      icon: AlertTriangle,
      color: "text-destructive border-destructive/40 bg-destructive/10",
    },
    {
      title: "Сегодня",
      count: todayTasks.length,
      tasks: todayTasks,
      icon: Clock,
      color: "text-amber-500 border-amber-500/40 bg-amber-500/10",
    },
    {
      title: "Ближайшие 7 дней",
      count: next7DaysTasks.length,
      tasks: next7DaysTasks,
      icon: Calendar,
      color: "text-ssj-bot border-ssj-bot/40 bg-ssj-bot/10",
    },
    {
      title: "Позже",
      count: laterTasks.length,
      tasks: laterTasks,
      icon: Calendar,
      color: "text-ssj-web border-ssj-web/40 bg-ssj-web/10",
    },
    {
      title: "Без срока",
      count: noDeadlineTasks.length,
      tasks: noDeadlineTasks,
      icon: Calendar,
      color: "text-muted-foreground border-border bg-muted/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Subheader & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Сроки и дедлайны
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Все задачи проектов SSJCorp, сгруппированные по временным интервалам
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ssj-purple"
          >
            <option value="all">Все проекты</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Filter Assignee */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ssj-purple"
          >
            <option value="all">Все исполнители</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Filter Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ssj-purple"
          >
            <option value="all">Все приоритеты</option>
            <option value="P0">P0 — Критический</option>
            <option value="P1">P1 — Высокий</option>
            <option value="P2">P2 — Обычный</option>
            <option value="P3">P3 — Низкий</option>
          </select>
        </div>
      </div>

      {/* Timeframe Groups */}
      <div className="space-y-6">
        {periods.map((period) => {
          if (period.count === 0) return null;
          const Icon = period.icon;

          return (
            <div key={period.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold",
                    period.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{period.title}</span>
                  <span className="font-mono text-[11px] font-bold">
                    ({period.count})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {period.tasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  const col = columns.find((c) => c.id === task.columnId);
                  const assigned = members.filter((m) =>
                    task.assigneeIds.includes(m.id)
                  );

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm hover:border-ssj-purple/50 cursor-pointer transition-all space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-semibold text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded-lg border border-ssj-purple/20">
                            {task.id}
                          </span>
                          {proj && (
                            <span className="text-[11px] text-muted-foreground font-medium truncate">
                              {proj.name}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-foreground line-clamp-2">
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
                          {task.dueDate && <span>{task.dueDate}</span>}
                        </div>

                        <div className="flex items-center -space-x-1">
                          {assigned.map((m) => (
                            <div
                              key={m.id}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-ssj-purple/20 text-[10px] font-mono text-ssj-purple border border-card"
                              title={m.name}
                            >
                              {m.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
