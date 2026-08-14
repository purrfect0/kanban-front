"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { Column, Task, Member } from "@/types/kanban";
import { TaskCard } from "./TaskCard";
import { useKanban } from "@/store/KanbanContext";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  members: Member[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, members }) => {
  const { setIsCreateTaskOpen } = useKanban();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const isWipExceeded = column.wipLimit ? tasks.length > column.wipLimit : false;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col shrink-0 rounded-2xl border border-border/60 bg-muted/20 p-3 transition-all duration-200",
        isCollapsed ? "w-16" : "w-[300px] sm:w-[320px]",
        isOver && "border-ssj-purple/80 bg-ssj-purple/5 ring-2 ring-ssj-purple/30"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
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
            <h2 className="text-sm font-semibold text-foreground truncate">
              {column.title}
            </h2>
          )}
        </div>

        {/* Counter & WIP limit */}
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <div
              className={cn(
                "flex items-center gap-1 font-mono text-xs font-medium px-2 py-0.5 rounded-lg border",
                isWipExceeded
                  ? "bg-destructive/20 text-destructive border-destructive/40"
                  : "bg-muted text-muted-foreground border-border/60"
              )}
              title={
                column.wipLimit
                  ? `Лимит задач в работе: ${column.wipLimit}`
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

      {/* Collapsed State Title View */}
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
          <span className="font-semibold text-xs text-muted-foreground tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
            {column.title}
          </span>
          <span className="font-mono text-xs font-bold text-ssj-purple bg-ssj-purple/10 px-2 py-1 rounded-lg">
            {tasks.length}
          </span>
        </div>
      ) : (
        /* Task Cards Sortable Container */
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[150px] max-h-[calc(100vh-220px)]">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} members={members} />
            ))}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border/60 text-center text-xs text-muted-foreground">
                <p>Колонка пуста</p>
                <button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="mt-2 text-ssj-purple hover:underline"
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
