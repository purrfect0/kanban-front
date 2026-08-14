"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { Column, Task, Member } from "@/types/kanban";
import { TaskCard } from "./TaskCard";
import { BlurFade } from "@/components/ui/BlurFade";
import { useKanban } from "@/store/KanbanContext";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  members: Member[];
}

const COLUMN_STATUS_THEMES: Record<
  string,
  { dot: string; pill: string; line: string; drop: string }
> = {
  backlog: {
    dot: "bg-slate-400",
    pill: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    line: "bg-slate-500",
    drop: "border-slate-500/80 bg-slate-500/5",
  },
  todo: {
    dot: "bg-ssj-purple",
    pill: "bg-ssj-purple/15 text-ssj-purple border-ssj-purple/30",
    line: "bg-ssj-purple",
    drop: "border-ssj-purple/80 bg-ssj-purple/5",
  },
  in_progress: {
    dot: "bg-ssj-bot",
    pill: "bg-ssj-bot/15 text-ssj-bot border-ssj-bot/30",
    line: "bg-ssj-bot",
    drop: "border-ssj-bot/80 bg-ssj-bot/5",
  },
  review: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    line: "bg-amber-500",
    drop: "border-amber-500/80 bg-amber-500/5",
  },
  done: {
    dot: "bg-ssj-web",
    pill: "bg-ssj-web/15 text-ssj-web border-ssj-web/30",
    line: "bg-ssj-web",
    drop: "border-ssj-web/80 bg-ssj-web/5",
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, members }) => {
  const { setIsCreateTaskOpen } = useKanban();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnTheme = COLUMN_STATUS_THEMES[column.id] || COLUMN_STATUS_THEMES.todo;

  const isWipExceeded = column.wipLimit ? tasks.length > column.wipLimit : false;
  const isWipWarning = column.wipLimit ? tasks.length >= Math.ceil(column.wipLimit * 0.8) : false;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex flex-col shrink-0 rounded-2xl border border-border/60 bg-slate-100/80 dark:bg-[#0D0D10] p-3 transition-all duration-200 h-fit max-h-[calc(100vh-220px)] shadow-sm",
        isCollapsed ? "w-16" : "w-[300px] sm:w-[320px]",
        isOver && columnTheme.drop
      )}
    >
      {/* Status Top Accent Line */}
      <div className={cn("absolute top-0 left-4 right-4 h-[2px] rounded-full", columnTheme.line)} />

      {/* Sticky Column Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between pb-3 pt-1 px-1 bg-slate-100/95 dark:bg-[#0D0D10]/95 backdrop-blur border-b border-border/40">
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={isCollapsed ? "Развернуть колонку" : "Свернуть колонку"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-2 truncate">
              <div className={cn("h-2 w-2 rounded-full shrink-0", columnTheme.dot)} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground truncate font-mono">
                {column.title}
              </h2>
            </div>
          )}
        </div>

        {/* Counter & WIP limit Pill */}
        <div className="flex items-center gap-1.5">
          {!isCollapsed && (
            <div
              className={cn(
                "flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-help",
                isWipExceeded
                  ? "bg-destructive/20 text-destructive border-destructive/50 animate-pulse"
                  : isWipWarning
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/50"
                  : columnTheme.pill
              )}
              title={
                column.wipLimit
                  ? `WIP-лимит: ${tasks.length}/${column.wipLimit} задач в работе`
                  : undefined
              }
            >
              <span>{tasks.length}</span>
              {column.wipLimit && <span>/{column.wipLimit}</span>}
              {isWipExceeded && <AlertCircle className="h-3 w-3 text-destructive" />}
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-ssj-purple/20 hover:text-ssj-purple transition-colors"
              title="Быстро добавить задачу"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsed State View */}
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-muted-foreground [writing-mode:vertical-lr] rotate-180">
            {column.title}
          </span>
          <span className={cn("font-mono text-xs font-bold px-2 py-1 rounded-lg border", columnTheme.pill)}>
            {tasks.length}
          </span>
        </div>
      ) : (
        /* Task Cards Sortable Container */
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 space-y-3 overflow-y-auto pt-3 pr-0.5 max-h-[calc(100vh-280px)]">
            {tasks.map((task, idx) => (
              <BlurFade key={task.id} delay={0.05 + idx * 0.03}>
                <TaskCard task={task} members={members} />
              </BlurFade>
            ))}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-dashed border-border/40 text-center text-xs text-muted-foreground space-y-2">
                <p>Колонка пуста</p>
                <button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="text-ssj-purple font-semibold hover:underline"
                >
                  + Добавить задачу
                </button>
              </div>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
};
