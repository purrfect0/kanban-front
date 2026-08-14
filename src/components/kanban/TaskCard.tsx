"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckSquare,
  Paperclip,
  AlertTriangle,
  Clock,
  Ban,
  GripVertical,
} from "lucide-react";
import { Task, Member } from "@/types/kanban";
import { getTaskDeadlineStatus } from "@/lib/repositories/KanbanRepository";
import { useKanban } from "@/store/KanbanContext";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  members: Member[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, members }) => {
  const { setSelectedTask } = useKanban();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deadlineStatus = getTaskDeadlineStatus(task.dueDate);
  const checklistTotal = task.checklist?.length || 0;
  const checklistCompleted = task.checklist?.filter((c) => c.completed).length || 0;

  const assignedMembers = members.filter((m) => task.assigneeIds.includes(m.id));

  // Priority Styling & Icons
  const priorityConfig = {
    P0: { label: "P0", bg: "bg-destructive/20 text-destructive border-destructive/40" },
    P1: { label: "P1", bg: "bg-orange-500/20 text-orange-500 border-orange-500/40" },
    P2: { label: "P2", bg: "bg-blue-500/20 text-blue-500 border-blue-500/40" },
    P3: { label: "P3", bg: "bg-muted text-muted-foreground border-border" },
  };

  const priorityBadge = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:border-ssj-purple/50 hover:shadow-md cursor-pointer",
        isDragging && "opacity-40 scale-[0.98] border-ssj-purple ring-2 ring-ssj-purple/30 shadow-xl"
      )}
      onClick={() => setSelectedTask(task)}
    >
      {/* Top Bar: ID, Priority, Drag Handle */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-ssj-purple bg-ssj-purple/10 px-2 py-0.5 rounded-lg border border-ssj-purple/20">
            {task.id}
          </span>
          <span
            className={cn(
              "font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border",
              priorityBadge.bg
            )}
          >
            {priorityBadge.label}
          </span>
        </div>

        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-opacity"
          title="Перетащить карточку"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Blocked Indicator */}
      {task.isBlocked && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-destructive/15 px-2.5 py-1 text-[11px] font-medium text-destructive border border-destructive/30">
          <Ban className="h-3 w-3 shrink-0" />
          <span className="truncate">{task.blockedReason || "Заблокировано"}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1.5 group-hover:text-ssj-purple transition-colors">
        {task.title}
      </h3>

      {/* Short Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/60"
              style={{
                borderColor: `${label.color}40`,
                color: label.color,
                backgroundColor: `${label.color}15`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Metadata Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
        {/* Left Stats: Due Date, Checklist, Time */}
        <div className="flex items-center gap-3">
          {/* Due date badge */}
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
                deadlineStatus === "overdue" && "bg-destructive/20 text-destructive border-destructive/40",
                deadlineStatus === "today" && "bg-amber-500/20 text-amber-500 border-amber-500/40",
                deadlineStatus === "due_soon" && "bg-blue-500/20 text-blue-500 border-blue-500/40",
                deadlineStatus === "normal" && "text-muted-foreground border-transparent"
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>{task.dueDate.split("-").slice(1).join("/")}</span>
            </div>
          )}

          {/* Checklist Counter */}
          {checklistTotal > 0 && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-mono",
                checklistCompleted === checklistTotal
                  ? "text-ssj-web font-medium"
                  : "text-muted-foreground"
              )}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>
                {checklistCompleted}/{checklistTotal}
              </span>
            </div>
          )}

          {/* Time Estimate */}
          {task.timeEstimate && (
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <Clock className="h-3 w-3" />
              <span>{task.timeEstimate}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachmentsCount && task.attachmentsCount > 0 ? (
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachmentsCount}</span>
            </div>
          ) : null}
        </div>

        {/* Assignees Stack */}
        <div className="flex items-center -space-x-1.5">
          {assignedMembers.map((member) => (
            <div
              key={member.id}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-card bg-ssj-purple/20 text-[10px] font-mono font-medium text-ssj-purple"
              title={member.name}
            >
              {member.avatar}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
