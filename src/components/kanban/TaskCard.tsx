"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Member } from "@/types/kanban";
import { useKanban } from "@/store/KanbanContext";
import { isTaskOverdue, isTaskDueToday } from "@/lib/utils/taskUtils";
import { formatDateCompact } from "@/lib/utils/dateUtils";
import {
  AlertCircle,
  Paperclip,
  CheckSquare,
  Clock,
  Ban,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  members: Member[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, members }) => {
  const { setSelectedTask, tasks } = useKanban();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignedMembers = members.filter((m) =>
    task.assigneeIds.includes(m.id)
  );

  const completedChecklistCount = task.checklist.filter(
    (item) => item.completed
  ).length;

  const isOverdue = isTaskOverdue(task);
  const isDueToday = isTaskDueToday(task);

  // Dependency information
  const blockingTasks = (task.dependencyIds || [])
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t) && t!.columnId !== "done");

  const priorityColors = {
    P0: "bg-destructive/20 text-destructive border-destructive/40 font-bold",
    P1: "bg-orange-500/20 text-orange-500 border-orange-500/40 font-semibold",
    P2: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    P3: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedTask(task)}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-gradient-to-b from-[#16161B] to-[#0E0E11] p-3.5 shadow-sm transition-all duration-200 cursor-pointer select-none space-y-3 hover:-translate-y-0.5 hover:shadow-md hover:border-ssj-purple/50",
        isDragging && "opacity-40 scale-95 border-ssj-purple ring-2 ring-ssj-purple/40",
        task.isBlocked && "border-destructive/40 bg-destructive/5"
      )}
    >
      {/* Level 3 Inset Top Highlight */}
      <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header Row: Task ID & Priority */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded-lg border border-ssj-purple/20">
          {task.id}
        </span>

        <div className="flex items-center gap-1.5">
          {task.isBlocked && (
            <span className="flex items-center gap-1 rounded-md bg-destructive/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-destructive border border-destructive/30">
              <Ban className="h-3 w-3" />
              <span>Заблокирована</span>
            </span>
          )}

          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-ssj-purple transition-colors leading-snug">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Blocking Dependency Badge */}
      {blockingTasks.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] space-y-0.5">
          <div className="flex items-center gap-1 font-bold text-amber-500 font-mono">
            <Lock className="h-3 w-3" />
            <span>Зависят от ({blockingTasks.length}):</span>
          </div>
          <p className="text-amber-400 truncate">
            {blockingTasks[0].id}: {blockingTasks[0].title}
          </p>
        </div>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium border"
              style={{
                backgroundColor: `${label.color}15`,
                color: label.color,
                borderColor: `${label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer Details: Date, Checklist & Assignees */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2 font-mono">
          {/* Due Date Indicator */}
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 font-semibold",
                isOverdue && "text-destructive font-bold",
                isDueToday && "text-amber-500"
              )}
            >
              <Clock className="h-3 w-3 shrink-0" />
              <span>{formatDateCompact(task.dueDate)}</span>
            </div>
          )}

          {/* Checklist Counter */}
          {task.checklist.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckSquare className="h-3 w-3 shrink-0" />
              <span>
                {completedChecklistCount}/{task.checklist.length}
              </span>
            </div>
          )}

          {/* Attachments */}
          {Boolean(task.attachmentsCount) && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3 shrink-0" />
              <span>{task.attachmentsCount}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatars */}
        <div className="flex items-center -space-x-1 shrink-0">
          {assignedMembers.map((member) => (
            <div
              key={member.id}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ssj-purple/20 text-[10px] font-mono font-semibold text-ssj-purple border border-card"
              title={member.name}
            >
              {member.avatar || member.name.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
