"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKanban } from "@/store/KanbanContext";
import { TaskCard } from "@/components/kanban/TaskCard";
import { BlurFade } from "@/components/ui/BlurFade";
import { UserCheck, Filter, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { isTaskOverdue } from "@/lib/utils/taskUtils";
import { cn } from "@/lib/utils";

export default function MyTasksPage() {
  return (
    <AppLayout>
      <MyTasksContent />
    </AppLayout>
  );
}

function MyTasksContent() {
  const { tasks, members, columns, projects } = useKanban();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || "m1"
  );

  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "overdue" | "done">("all");

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  // Tasks assigned to selected developer
  const myTasks = tasks.filter((t) => t.assigneeIds.includes(selectedMemberId));

  const overdueCount = myTasks.filter((t) => isTaskOverdue(t)).length;
  const doneCount = myTasks.filter((t) => t.columnId === "done").length;
  const inProgressCount = myTasks.filter((t) => t.columnId === "in_progress").length;

  const filteredTasks = myTasks.filter((t) => {
    if (activeTab === "in_progress") return t.columnId === "in_progress";
    if (activeTab === "overdue") return isTaskOverdue(t);
    if (activeTab === "done") return t.columnId === "done";
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-none pb-8">
      {/* Page Subheader */}
      <BlurFade delay={0.05} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-ssj-purple" />
              Мои задачи и распределение
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Персональный дашборд разработчика команды SSJCorp
            </p>
          </div>

          {/* Member Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-card border border-border/80 rounded-2xl p-1.5 shadow-2xs">
            <span className="text-xs font-mono text-muted-foreground pl-2 hidden sm:inline">
              Разработчик:
            </span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer pr-2"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-[#141416] text-slate-900 dark:text-slate-100">
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Developer Profile Card */}
        {selectedMember && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-ssj-purple/20 text-ssj-purple border border-ssj-purple/30 font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                {selectedMember.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedMember.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedMember.role}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">Всего назначено</span>
                <p className="font-bold text-foreground">{myTasks.length} задач</p>
              </div>
              <div className="h-8 w-[1px] bg-border/60" />
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">В работе</span>
                <p className="font-bold text-ssj-bot">{inProgressCount}</p>
              </div>
              <div className="h-8 w-[1px] bg-border/60" />
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[11px]">Просрочено</span>
                <p className={cn("font-bold", overdueCount > 0 ? "text-destructive" : "text-foreground")}>
                  {overdueCount}
                </p>
              </div>
            </div>
          </div>
        )}
      </BlurFade>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all",
            activeTab === "all"
              ? "bg-ssj-purple text-white border-ssj-purple shadow-xs"
              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Все ({myTasks.length})
        </button>

        <button
          onClick={() => setActiveTab("in_progress")}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all",
            activeTab === "in_progress"
              ? "bg-ssj-bot/20 text-ssj-bot border-ssj-bot/50 shadow-xs"
              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          В работе ({inProgressCount})
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all",
            activeTab === "overdue"
              ? "bg-destructive/20 text-destructive border-destructive/50 shadow-xs"
              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Просрочено ({overdueCount})
        </button>

        <button
          onClick={() => setActiveTab("done")}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all",
            activeTab === "done"
              ? "bg-ssj-web/20 text-ssj-web border-ssj-web/50 shadow-xs"
              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Завершено ({doneCount})
        </button>
      </div>

      {/* Assigned Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task, idx) => {
          const proj = projects.find((p) => p.id === task.projectId);
          const col = columns.find((c) => c.id === task.columnId);

          return (
            <BlurFade key={task.id} delay={0.05 + idx * 0.03}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
                  <span>{proj?.name}</span>
                  <span className="font-bold text-ssj-purple">{col?.title}</span>
                </div>
                <TaskCard task={task} members={members} />
              </div>
            </BlurFade>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border/60 rounded-3xl text-muted-foreground text-sm font-mono space-y-2">
            <p>Задач в этой категории не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
