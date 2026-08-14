"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKanban } from "@/store/KanbanContext";
import { useTheme } from "next-themes";
import {
  Search,
  KanbanSquare,
  Plus,
  CalendarDays,
  UserCheck,
  Moon,
  Sun,
  X,
  Globe,
  Bot,
  AlertTriangle,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const {
    tasks,
    projects,
    setActiveProjectId,
    setSelectedTask,
    setIsCreateTaskOpen,
    setIsCreateProjectOpen,
  } = useKanban();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const searchResultsTasks = query.trim()
    ? tasks.filter(
        (t) =>
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const searchResultsProjects = query.trim()
    ? projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-300 dark:border-zinc-800 bg-card text-card-foreground shadow-2xl overflow-hidden animate-blur-fade">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Поиск задач по ID, названию или командам..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results / Navigation Commands List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {/* Direct Search Tasks Results */}
          {searchResultsTasks.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Найденные задачи ({searchResultsTasks.length})
              </span>
              {searchResultsTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTask(t);
                    onClose();
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-muted/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-ssj-purple bg-ssj-purple/10 px-1.5 py-0.5 rounded border border-ssj-purple/20">
                      {t.id}
                    </span>
                    <span className="font-medium text-foreground truncate">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {t.columnId}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search Projects */}
          {searchResultsProjects.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Проекты ({searchResultsProjects.length})
              </span>
              {searchResultsProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    router.push(`/board/?project=${p.slug}`);
                    onClose();
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-muted/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {p.type === "website" ? (
                      <Globe className="h-3.5 w-3.5 text-ssj-web" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-ssj-bot" />
                    )}
                    <span className="font-semibold text-foreground">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Перейти на доску →
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Быстрые действия
            </span>

            <button
              onClick={() => {
                setIsCreateTaskOpen(true);
                onClose();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-ssj-purple/15 hover:text-ssj-purple transition-colors text-left"
            >
              <Plus className="h-4 w-4 text-ssj-purple" />
              <span>Создать новую задачу</span>
            </button>

            <button
              onClick={() => {
                setIsCreateProjectOpen(true);
                onClose();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-ssj-purple/15 hover:text-ssj-purple transition-colors text-left"
            >
              <FolderPlus className="h-4 w-4 text-ssj-purple" />
              <span>Создать новый проект</span>
            </button>

            <button
              onClick={() => {
                router.push("/my-tasks/");
                onClose();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left"
            >
              <UserCheck className="h-4 w-4 text-ssj-web" />
              <span>Мои задачи</span>
            </button>

            <button
              onClick={() => {
                router.push("/deadlines/");
                onClose();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left"
            >
              <CalendarDays className="h-4 w-4 text-ssj-bot" />
              <span>Сроки и дедлайны</span>
            </button>

            <button
              onClick={() => {
                setTheme(isDark ? "light" : "dark");
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700" />
                )}
                <span>Переключить тему ({isDark ? "Светлая" : "Тёмная"})</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Theme</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/30 text-[10px] font-mono text-muted-foreground">
          <span>Навигация: ↑↓ для выбора, Enter — открыть</span>
          <span>ESC — закрыть</span>
        </div>
      </div>
    </div>
  );
};
