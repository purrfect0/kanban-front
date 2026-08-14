"use client";

import React, { useState } from "react";
import { X, Globe, Bot, AlertCircle } from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { ProjectType } from "@/types/kanban";

export const CreateProjectModal: React.FC = () => {
  const {
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    members,
    createProject,
  } = useKanban();

  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("website");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState<string>(members[0]?.id || "");
  const [memberIds, setMemberIds] = useState<string[]>(members.map((m) => m.id));
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isCreateProjectOpen) return null;

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
      await createProject({
        name: name.trim(),
        slug,
        type,
        status: "active",
        description: description.trim(),
        leadId,
        memberIds,
        dueDate: dueDate || undefined,
      });

      // Reset form
      setName("");
      setType("website");
      setDescription("");
      setDueDate("");
      setErrors({});
      setIsCreateProjectOpen(false);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const toggleMember = (id: string) => {
    if (memberIds.includes(id)) {
      setMemberIds(memberIds.filter((mId) => mId !== id));
    } else {
      setMemberIds([...memberIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <h2 className="text-lg font-semibold text-foreground">Новый проект</h2>
          <button
            onClick={() => setIsCreateProjectOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Project Type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Тип проекта
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("website")}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  type === "website"
                    ? "border-ssj-web/50 bg-ssj-web/10 text-foreground shadow-sm"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Globe className="h-5 w-5 text-ssj-web shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Сайт</div>
                  <div className="text-[10px] text-muted-foreground">Web-платформа или промо-страница</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType("telegram-bot")}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  type === "telegram-bot"
                    ? "border-ssj-bot/50 bg-ssj-bot/10 text-foreground shadow-sm"
                    : "border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Bot className="h-5 w-5 text-ssj-bot shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Telegram-бот</div>
                  <div className="text-[10px] text-muted-foreground">Сервисный или воронка продаж</div>
                </div>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Название проекта *
            </label>
            <input
              type="text"
              placeholder="Например: SSJCorp Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ssj-purple"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Описание
            </label>
            <textarea
              rows={3}
              placeholder="Краткое описание целей и стека проекта..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ssj-purple resize-none"
            />
          </div>

          {/* Lead & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Ответственный (Lead)
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ssj-purple"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Дедлайн проекта
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ssj-purple"
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Участники команды
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isSelected = memberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-ssj-purple/20 text-ssj-purple border-ssj-purple/50"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono">{member.avatar}</span>
                    <span>{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => setIsCreateProjectOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-xl bg-ssj-purple px-5 py-2 text-sm font-medium text-white shadow-md hover:bg-ssj-purple/90"
            >
              Создать проект
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
