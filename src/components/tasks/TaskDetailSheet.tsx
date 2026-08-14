"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  AlertTriangle,
  Clock,
  User,
  Tag,
  Calendar,
  CheckCircle2,
  Ban,
  Save,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { Priority, Label, ChecklistItem, Task } from "@/types/kanban";
import { getTaskDeadlineStatus } from "@/lib/repositories/KanbanRepository";
import { cn } from "@/lib/utils";

const AVAILABLE_LABELS: Label[] = [
  { id: "l1", name: "Frontend", color: "#7C6CF6" },
  { id: "l2", name: "UI/UX", color: "#22C55E" },
  { id: "l3", name: "Performance", color: "#EAB308" },
  { id: "l4", name: "SEO", color: "#06B6D4" },
  { id: "l5", name: "API Integration", color: "#EC4899" },
  { id: "l6", name: "Bot Logic", color: "#29A9EB" },
];

export const TaskDetailSheet: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    columns,
    members,
    projects,
    updateTask,
    deleteTask,
  } = useKanban();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || "");
      setColumnId(selectedTask.columnId);
      setPriority(selectedTask.priority);
      setAssigneeIds(selectedTask.assigneeIds || []);
      setSelectedLabels(selectedTask.labels || []);
      setDueDate(selectedTask.dueDate || "");
      setTimeEstimate(selectedTask.timeEstimate || "");
      setChecklist(selectedTask.checklist || []);
      setIsBlocked(selectedTask.isBlocked || false);
      setBlockedReason(selectedTask.blockedReason || "");
      setIsDirty(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedTask]);

  // Handle Escape key close with dirty check
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedTask) {
        if (isDirty) {
          if (!confirm("У вас есть несохранённые изменения. Закрыть без сохранения?")) {
            return;
          }
        }
        setSelectedTask(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTask, isDirty, setSelectedTask]);

  if (!selectedTask) return null;

  const project = projects.find((p) => p.id === selectedTask.projectId);

  const handleClose = () => {
    if (isDirty) {
      if (!confirm("У вас есть несохранённые изменения. Закрыть без сохранения?")) {
        return;
      }
    }
    setSelectedTask(null);
  };

  const handleSave = async () => {
    try {
      await updateTask(selectedTask.id, {
        title: title.trim(),
        description: description.trim(),
        columnId,
        priority,
        assigneeIds,
        labels: selectedLabels,
        dueDate: dueDate || undefined,
        timeEstimate: timeEstimate.trim() || undefined,
        checklist,
        isBlocked,
        blockedReason: isBlocked ? blockedReason.trim() : undefined,
      });
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(selectedTask.id);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText("");
    setIsDirty(true);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    setIsDirty(true);
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
    setIsDirty(true);
  };

  const deadlineStatus = getTaskDeadlineStatus(dueDate);
  const completedChecklistCount = checklist.filter((item) => item.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-card border-l border-border shadow-2xl animate-fade-in overflow-y-auto">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card/90 px-6 backdrop-blur border-border/80">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-ssj-purple/15 px-2.5 py-1 font-mono text-xs font-semibold text-ssj-purple border border-ssj-purple/30">
              {selectedTask.id}
            </span>
            {project && (
              <span className="text-xs font-medium text-muted-foreground">
                {project.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-amber-500 font-medium animate-pulse mr-2">
                ● Есть несохранённые изменения
              </span>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-ssj-purple px-4 py-2 text-xs font-medium text-white shadow-md hover:bg-ssj-purple/90"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Сохранить</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-2 text-destructive hover:bg-destructive/20 transition-colors"
              title="Удалить задачу"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={handleClose}
              className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Blocked Alert Banner */}
          {isBlocked && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-sm">Задача заблокирована!</span>
                <p className="text-destructive/90">{blockedReason || "Причина блокировки не указана."}</p>
              </div>
            </div>
          )}

          {/* Editable Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Название задачи..."
              className="w-full text-xl font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-ssj-purple outline-none pb-1 transition-colors"
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4">
            {/* Column */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Колонка
              </label>
              <select
                value={columnId}
                onChange={(e) => {
                  setColumnId(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground outline-none"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as Priority);
                  setIsDirty(true);
                }}
                className="w-full h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground outline-none"
              >
                <option value="P0">P0 — Критический</option>
                <option value="P1">P1 — Высокий</option>
                <option value="P2">P2 — Обычный</option>
                <option value="P3">P3 — Низкий</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Срок выполнения
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground outline-none"
                />
                {dueDate && (
                  <span
                    className={cn(
                      "shrink-0 rounded-lg px-2 py-1 font-mono text-[10px] font-medium border",
                      deadlineStatus === "overdue" && "bg-destructive/20 text-destructive border-destructive/40",
                      deadlineStatus === "today" && "bg-amber-500/20 text-amber-500 border-amber-500/40",
                      deadlineStatus === "due_soon" && "bg-blue-500/20 text-blue-500 border-blue-500/40",
                      deadlineStatus === "normal" && "bg-ssj-web/20 text-ssj-web border-ssj-web/40"
                    )}
                  >
                    {deadlineStatus === "overdue" && "Просрочено"}
                    {deadlineStatus === "today" && "Сегодня"}
                    {deadlineStatus === "due_soon" && "Скоро"}
                    {deadlineStatus === "normal" && "В норме"}
                  </span>
                )}
              </div>
            </div>

            {/* Time Estimate */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Оценка времени
              </label>
              <input
                type="text"
                value={timeEstimate}
                placeholder="Например: 4h"
                onChange={(e) => {
                  setTimeEstimate(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground font-mono outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Описание
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Добавьте подробное описание задачи..."
              className="w-full rounded-2xl border border-border/80 bg-muted/20 p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ssj-purple resize-none"
            />
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Метки
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LABELS.map((label) => {
                const isSelected = selectedLabels.some((l) => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id));
                      } else {
                        setSelectedLabels([...selectedLabels, label]);
                      }
                      setIsDirty(true);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-ssj-purple/20 text-ssj-purple border-ssj-purple/50"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Исполнители
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isAssigned = assigneeIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      if (isAssigned) {
                        setAssigneeIds(assigneeIds.filter((id) => id !== member.id));
                      } else {
                        setAssigneeIds([...assigneeIds, member.id]);
                      }
                      setIsDirty(true);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      isAssigned
                        ? "bg-ssj-purple/20 text-ssj-purple border-ssj-purple/50"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono">{member.avatar}</span>
                    <span>{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Чек-лист ({completedChecklistCount}/{checklist.length})
              </label>
              {checklist.length > 0 && (
                <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-ssj-purple transition-all duration-300"
                    style={{
                      width: `${Math.round((completedChecklistCount / checklist.length) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm group"
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-2.5 text-left flex-1"
                  >
                    {item.completed ? (
                      <CheckSquare className="h-4 w-4 text-ssj-purple shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-foreground",
                        item.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {item.text}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Добавить пункт чек-листа..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
                className="flex-1 h-9 rounded-xl border border-border/80 bg-muted/40 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ssj-purple"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="h-9 px-3 rounded-xl bg-muted border border-border/80 text-xs font-medium text-foreground hover:bg-muted/80 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Blocked Flag Options */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" />
                Заблокировать задачу
              </span>
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={(e) => {
                  setIsBlocked(e.target.checked);
                  setIsDirty(true);
                }}
                className="h-4 w-4 rounded accent-ssj-purple cursor-pointer"
              />
            </div>
            {isBlocked && (
              <input
                type="text"
                placeholder="Причина блокировки (например: ожидаем токенов API)..."
                value={blockedReason}
                onChange={(e) => {
                  setBlockedReason(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full h-9 rounded-xl border border-destructive/40 bg-card px-3 text-xs text-foreground outline-none"
              />
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                Удалить задачу {selectedTask.id}?
              </h3>
              <p className="text-xs text-muted-foreground">
                Это действие нельзя отменить. Задача будет безвозвратно удалена из доски.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-destructive px-4 py-2 text-xs font-medium text-white shadow-md hover:bg-destructive/90"
                >
                  Да, удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
