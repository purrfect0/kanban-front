"use client";

import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { Priority, Label } from "@/types/kanban";

const AVAILABLE_LABELS: Label[] = [
  { id: "l1", name: "Frontend", color: "#7C6CF6" },
  { id: "l2", name: "UI/UX", color: "#22C55E" },
  { id: "l3", name: "Performance", color: "#EAB308" },
  { id: "l4", name: "SEO", color: "#06B6D4" },
  { id: "l5", name: "API Integration", color: "#EC4899" },
  { id: "l6", name: "Bot Logic", color: "#29A9EB" },
];

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    projects,
    activeProjectId,
    columns,
    members,
    createTask,
  } = useKanban();

  const [projectId, setProjectId] = useState<string>(activeProjectId || projects[0]?.id || "");
  const [columnId, setColumnId] = useState<string>("todo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isCreateTaskOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Название задачи обязательно";
    }
    if (!projectId) {
      newErrors.projectId = "Выберите проект";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createTask({
        projectId,
        columnId,
        title: title.trim(),
        description: description.trim(),
        priority,
        labels: selectedLabels,
        assigneeIds,
        dueDate: dueDate || undefined,
        timeEstimate: timeEstimate.trim() || undefined,
        checklist: [],
        isBlocked: false,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("P2");
      setAssigneeIds([]);
      setSelectedLabels([]);
      setDueDate("");
      setTimeEstimate("");
      setErrors({});
      setIsCreateTaskOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const toggleLabel = (label: Label) => {
    if (selectedLabels.some((l) => l.id === label.id)) {
      setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const toggleAssignee = (memberId: string) => {
    if (assigneeIds.includes(memberId)) {
      setAssigneeIds(assigneeIds.filter((id) => id !== memberId));
    } else {
      setAssigneeIds([...assigneeIds, memberId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0F0F10] text-slate-900 dark:text-slate-100 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Новая задача</h2>
          <button
            onClick={() => setIsCreateTaskOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Project & Column Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Проект *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#141416] text-slate-900 dark:text-slate-100">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Колонка
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple transition-all"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-[#141416] text-slate-900 dark:text-slate-100">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Название задачи *
            </label>
            <input
              type="text"
              placeholder="Например: Адаптивная вёрстка карточек"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-ssj-purple transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Описание
            </label>
            <textarea
              rows={3}
              placeholder="Подробная информация о задаче..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-ssj-purple resize-none transition-all"
            />
          </div>

          {/* Priority & Due Date & Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple transition-all"
              >
                <option value="P0" className="text-destructive font-medium">P0 — Критический</option>
                <option value="P1" className="text-orange-500 font-medium">P1 — Высокий</option>
                <option value="P2" className="text-blue-500 font-medium">P2 — Обычный</option>
                <option value="P3" className="text-slate-500 dark:text-zinc-400 font-medium">P3 — Низкий</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Срок выполнения
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Оценка времени
              </label>
              <input
                type="text"
                placeholder="4h / 2d"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple font-mono text-xs transition-all"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Метки
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LABELS.map((label) => {
                const isSelected = selectedLabels.some((l) => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-ssj-purple/20 text-ssj-purple border-ssj-purple/50 font-semibold"
                        : "border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-[#141416] text-slate-700 dark:text-zinc-300 hover:border-ssj-purple/50"
                    }`}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Исполнители
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isSelected = assigneeIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAssignee(member.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-ssj-purple/20 text-ssj-purple border-ssj-purple/50 font-semibold"
                        : "border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-[#141416] text-slate-700 dark:text-zinc-300 hover:border-ssj-purple/50"
                    }`}
                  >
                    <span className="font-mono text-[11px]">{member.avatar}</span>
                    <span>{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-xl bg-ssj-purple px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-ssj-purple/90 transition-all"
            >
              Создать задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
