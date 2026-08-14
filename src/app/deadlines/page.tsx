"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKanban } from "@/store/KanbanContext";
import { Task } from "@/types/kanban";
import { isTaskOverdue, getTodayIsoString } from "@/lib/utils/taskUtils";
import { formatDateCompact } from "@/lib/utils/dateUtils";
import { BlurFade } from "@/components/ui/BlurFade";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  Clock,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Target,
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

  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [highlightedDay, setHighlightedDay] = useState<string | null>(getTodayIsoString());

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
    if (assigneeFilter !== "all" && !t.assigneeIds.includes(assigneeFilter)) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group tasks by period for Timeline Mode
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

    if (isTaskOverdue(task)) {
      overdueTasks.push(task);
    } else if (diffDays === 0) {
      todayTasks.push(task);
    } else if (diffDays > 0 && diffDays <= 7) {
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
      rail: "bg-destructive",
    },
    {
      title: "Сегодня",
      count: todayTasks.length,
      tasks: todayTasks,
      icon: Clock,
      color: "text-amber-500 border-amber-500/40 bg-amber-500/10",
      rail: "bg-amber-500",
    },
    {
      title: "Ближайшие 7 дней",
      count: next7DaysTasks.length,
      tasks: next7DaysTasks,
      icon: CalendarIcon,
      color: "text-ssj-bot border-ssj-bot/40 bg-ssj-bot/10",
      rail: "bg-ssj-bot",
    },
    {
      title: "Позже",
      count: laterTasks.length,
      tasks: laterTasks,
      icon: CalendarIcon,
      color: "text-ssj-web border-ssj-web/40 bg-ssj-web/10",
      rail: "bg-ssj-web",
    },
    {
      title: "Без срока",
      count: noDeadlineTasks.length,
      tasks: noDeadlineTasks,
      icon: CalendarIcon,
      color: "text-muted-foreground border-border bg-muted/20",
      rail: "bg-slate-500",
    },
  ];

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Russian Monday = 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const todayStr = getTodayIsoString();
    setHighlightedDay(todayStr);

    const el = document.getElementById(`calendar-day-${todayStr}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const monthName = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(currentDate);
  const todayFormatted = formatDateCompact(getTodayIsoString());

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Subheader, Mode Switcher & Filters */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-ssj-purple" />
              Сроки и дедлайны
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Временная шкала и календарь контроля сроков задач
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle Button */}
            <div className="flex items-center rounded-xl bg-card border border-border/80 p-1 shadow-xs">
              <button
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                  viewMode === "timeline"
                    ? "bg-ssj-purple text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>Временная шкала</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                  viewMode === "calendar"
                    ? "bg-ssj-purple text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Календарь</span>
              </button>
            </div>

            {/* Filters */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground font-semibold outline-none focus:border-ssj-purple max-w-[150px] sm:max-w-none truncate"
            >
              <option value="all">Все проекты</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground font-semibold outline-none focus:border-ssj-purple max-w-[150px] sm:max-w-none truncate"
            >
              <option value="all">Все исполнители</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </BlurFade>

      {/* Mode 1: Timeline (Vertical Rail with Fixed Center Lines & Dots) */}
      {viewMode === "timeline" ? (
        <div className="space-y-8 min-w-0 max-w-full">
          {periods.map((period, pIdx) => {
            if (period.count === 0) return null;
            const Icon = period.icon;

            return (
              <BlurFade key={period.title} delay={0.1 + pIdx * 0.06} className="space-y-4 min-w-0 max-w-full">
                {/* Section Header */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold font-mono",
                      period.color
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{period.title}</span>
                    <span>({period.count})</span>
                  </div>
                </div>

                {/* Timeline Row List */}
                <div className="relative space-y-3 pl-1 min-w-0 max-w-full">
                  {/* Single Continuous Vertical Connecting Rail Line */}
                  <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-border/80 pointer-events-none" />

                  {period.tasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.projectId);
                    const col = columns.find((c) => c.id === task.columnId);
                    const assigned = members.filter((m) =>
                      task.assigneeIds.includes(m.id)
                    );

                    return (
                      <div key={task.id} className="relative flex items-center gap-3 min-w-0 max-w-full">
                        {/* Bullet Marker Node */}
                        <div className="relative z-10 flex items-center justify-center shrink-0 w-5">
                          <div
                            className={cn(
                              "h-3.5 w-3.5 rounded-full border-2 border-background shadow-xs",
                              period.rail
                            )}
                          />
                        </div>

                        {/* Task Card */}
                        <div
                          onClick={() => setSelectedTask(task)}
                          className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm hover:border-ssj-purple/50 cursor-pointer transition-all group min-w-0 max-w-full overflow-hidden"
                        >
                          {/* Title & Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono font-bold text-xs text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded-lg border border-ssj-purple/20 shrink-0">
                              {task.id}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-ssj-purple transition-colors">
                              {task.title}
                            </h4>
                            {proj && (
                              <span className="hidden md:inline text-[11px] text-muted-foreground font-medium truncate">
                                ({proj.name})
                              </span>
                            )}
                          </div>

                          {/* Status, Date & Assignees */}
                          <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0">
                            {col && (
                              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-muted text-muted-foreground">
                                {col.title}
                              </span>
                            )}

                            {task.dueDate && (
                              <span
                                className={cn(
                                  "font-mono text-xs font-semibold",
                                  period.title === "Просрочено" && "text-destructive font-bold"
                                )}
                              >
                                {formatDateCompact(task.dueDate)}
                              </span>
                            )}

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
                      </div>
                    );
                  })}
                </div>
              </BlurFade>
            );
          })}
        </div>
      ) : (
        /* Mode 2: Calendar Grid View (Scrolled horizontally on small mobile screens) */
        <BlurFade delay={0.1} className="space-y-4 min-w-0 max-w-full">
          {/* Month Header Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-foreground capitalize font-mono">
                {monthName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToToday}
                className="flex items-center gap-1.5 rounded-xl border border-ssj-purple/40 bg-ssj-purple/15 px-3 py-1.5 text-xs font-bold text-ssj-purple hover:bg-ssj-purple/25 transition-all shadow-xs"
                title={`Перейти к сегодня (${todayFormatted})`}
              >
                <Target className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Перейти к сегодня ({todayFormatted})</span>
                <span className="sm:hidden">Сегодня ({todayFormatted})</span>
              </button>

              <button
                onClick={prevMonth}
                className="rounded-xl border border-border/80 bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Предыдущий месяц"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={nextMonth}
                className="rounded-xl border border-border/80 bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Следующий месяц"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Month Grid Wrapper */}
          <div className="rounded-2xl border border-border/60 bg-card/90 overflow-x-auto shadow-sm min-w-0 max-w-full">
            <div className="min-w-[640px]">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40 text-center font-mono text-xs font-bold text-muted-foreground py-2.5">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span className="text-amber-500">Сб</span>
                <span className="text-amber-500">Вс</span>
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 text-xs">
                {/* Empty offset cells before month start */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/30 bg-muted/10 p-2" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const dayTasks = filteredTasks.filter((t) => t.dueDate === cellDateStr);

                  const isToday =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === dayNum;

                  const isSelected = highlightedDay === cellDateStr;

                  return (
                    <div
                      id={`calendar-day-${cellDateStr}`}
                      key={cellDateStr}
                      onClick={() => setHighlightedDay(cellDateStr)}
                      className={cn(
                        "min-h-[100px] border-b border-r border-border/30 p-2 flex flex-col justify-between transition-all cursor-pointer",
                        isToday && "bg-ssj-purple/10 font-bold border-ssj-purple/40",
                        isSelected && "ring-2 ring-ssj-purple shadow-md bg-ssj-purple/15"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs",
                            isToday
                              ? "bg-ssj-purple text-white shadow-xs font-bold"
                              : "text-foreground"
                          )}
                        >
                          {dayNum}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="font-mono text-[10px] font-bold text-ssj-purple bg-ssj-purple/20 px-1.5 py-0.5 rounded-md border border-ssj-purple/30">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[85px]">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className={cn(
                              "truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer border transition-all hover:scale-[1.02]",
                              isTaskOverdue(t)
                                ? "bg-destructive/20 text-destructive border-destructive/40"
                                : "bg-ssj-purple/15 text-ssj-purple border-ssj-purple/30"
                            )}
                            title={`${t.id}: ${t.title}`}
                          >
                            {t.id}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </BlurFade>
      )}
    </div>
  );
}
