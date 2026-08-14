"use client";

import React, { useState } from "react";
import { X, Globe, Bot, AlertCircle, Layers, CheckSquare, Square } from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { ProjectType } from "@/types/kanban";
import { PROJECT_TEMPLATES } from "@/data/projectTemplates";
import { kanbanRepository } from "@/lib/repositories/LocalStorageKanbanRepository";

export const CreateProjectModal: React.FC = () => {
  const {
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    members,
    createProject,
    refreshData,
  } = useKanban();

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<"blank" | "website" | "telegram-bot">("website");
  const [type, setType] = useState<ProjectType>("website");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState<string>(members[0]?.id || "");
  const [memberIds, setMemberIds] = useState<string[]>(members.map((m) => m.id));
  const [dueDate, setDueDate] = useState("");
  const [taskPrefix, setTaskPrefix] = useState("WEB");
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isCreateProjectOpen) return null;

  const currentTemplate = PROJECT_TEMPLATES.find((t) => t.id === templateId);

  const handleTemplateSelect = (id: "blank" | "website" | "telegram-bot") => {
    setTemplateId(id);
    if (id === "website") {
      setTaskPrefix("WEB");
      setType("website");
      setSelectedTaskIndices([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    } else if (id === "telegram-bot") {
      setTaskPrefix("BOT");
      setType("telegram-bot");
      setSelectedTaskIndices([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    } else {
      setTaskPrefix("PROJ");
      setType("website");
      setSelectedTaskIndices([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Название проекта обязательно";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `proj-${Date.now()}`;

    try {
      const newProj = await createProject({
        name: name.trim(),
        slug,
        type,
        status: "active",
        description: description.trim() || currentTemplate?.description || "",
        leadId,
        memberIds,
        dueDate: dueDate || undefined,
        templateType: templateId,
        taskPrefix: taskPrefix.toUpperCase().trim(),
        accentColor: type === "website" ? "#22C55E" : "#29A9EB",
      });

      // Auto-populate template tasks if template selected
      if (currentTemplate && currentTemplate.tasks.length > 0) {
        for (const idx of selectedTaskIndices) {
          const tItem = currentTemplate.tasks[idx];
          if (tItem) {
            await kanbanRepository.createTask({
              projectId: newProj.id,
              columnId: tItem.columnId,
              title: tItem.title,
              description: tItem.description,
              priority: tItem.priority,
              labels: tItem.labels,
              assigneeIds: [leadId],
              timeEstimate: tItem.timeEstimate,
              checklist: [],
              isBlocked: false,
            });
          }
        }
        await refreshData();
      }

      // Reset form
      setName("");
      setTemplateId("website");
      setDescription("");
      setDueDate("");
      setErrors({});
      setIsCreateProjectOpen(false);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const toggleTaskSelection = (idx: number) => {
    if (selectedTaskIndices.includes(idx)) {
      setSelectedTaskIndices(selectedTaskIndices.filter((i) => i !== idx));
    } else {
      setSelectedTaskIndices([...selectedTaskIndices, idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#0F0F10] text-slate-900 dark:text-slate-100 p-6 shadow-2xl animate-blur-fade max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Создание нового проекта SSJCorp</h2>
            <p className="text-xs text-muted-foreground">Выберите готовый шаблон или настройте с нуля</p>
          </div>
          <button
            onClick={() => setIsCreateProjectOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
              Шаблон проекта
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleTemplateSelect("website")}
                className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all ${
                  templateId === "website"
                    ? "border-ssj-web/60 bg-ssj-web/10 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#141416] text-slate-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-ssj-web shrink-0" />
                  <span className="text-xs font-bold">Сайт</span>
                </div>
                <span className="text-[10px] text-muted-foreground">12 готовых задач фронтенд/бэкенд</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSelect("telegram-bot")}
                className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all ${
                  templateId === "telegram-bot"
                    ? "border-ssj-bot/60 bg-ssj-bot/10 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#141416] text-slate-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-ssj-bot shrink-0" />
                  <span className="text-xs font-bold">Telegram-бот</span>
                </div>
                <span className="text-[10px] text-muted-foreground">12 задач логики и интеграций</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSelect("blank")}
                className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all ${
                  templateId === "blank"
                    ? "border-ssj-purple/60 bg-ssj-purple/10 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#141416] text-slate-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-ssj-purple shrink-0" />
                  <span className="text-xs font-bold">Пустой проект</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Без предзаполненных задач</span>
              </button>
            </div>
          </div>

          {/* Name & Task Prefix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Название проекта *
              </label>
              <input
                type="text"
                placeholder="Например: Tutto Gusto Website"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-ssj-purple transition-all"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Префикс задач
              </label>
              <input
                type="text"
                value={taskPrefix}
                onChange={(e) => setTaskPrefix(e.target.value.toUpperCase())}
                placeholder="WEB"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Описание
            </label>
            <textarea
              rows={2}
              placeholder="Краткое описание целей и задач проекта..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-ssj-purple resize-none transition-all"
            />
          </div>

          {/* Lead & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Ответственный (Lead)
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm text-slate-900 dark:text-slate-100 font-semibold outline-none focus:border-ssj-purple transition-all"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Дедлайн проекта
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#141416] px-3 text-sm font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-ssj-purple transition-all"
              />
            </div>
          </div>

          {/* Template Tasks Preview List */}
          {currentTemplate && currentTemplate.tasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs font-bold text-foreground font-mono">
                <span>Предпросмотр задач шаблона ({selectedTaskIndices.length}/{currentTemplate.tasks.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTaskIndices.length === currentTemplate.tasks.length) {
                      setSelectedTaskIndices([]);
                    } else {
                      setSelectedTaskIndices(currentTemplate.tasks.map((_, i) => i));
                    }
                  }}
                  className="text-ssj-purple hover:underline text-[11px]"
                >
                  {selectedTaskIndices.length === currentTemplate.tasks.length ? "Снять все" : "Выбрать все"}
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#141416] p-2 space-y-1.5 text-xs">
                {currentTemplate.tasks.map((tItem, idx) => {
                  const isChecked = selectedTaskIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTaskSelection(idx)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-ssj-purple shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className={isChecked ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {tItem.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreateProjectOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-xl bg-ssj-purple px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-ssj-purple/90 transition-all"
            >
              Создать проект
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
