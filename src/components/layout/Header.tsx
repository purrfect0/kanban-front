"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Sun,
  Moon,
  X,
  Globe,
  Bot,
  SlidersHorizontal,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    projects,
    members,
    activeProjectId,
    setActiveProjectId,
    filters,
    setFilters,
    resetFilters,
    theme,
    toggleTheme,
    setIsCreateTaskOpen,
    setIsCreateProjectOpen,
  } = useKanban();

  // Keyboard shortcut Ctrl/Cmd + K focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const cleanPathname = pathname.replace(/^\/kanban-front/, "") || "/";

  let title = "Обзор проектов";
  if (cleanPathname.startsWith("/board")) {
    title = "Канбан-доска";
  } else if (cleanPathname.startsWith("/deadlines")) {
    title = "Сроки и дедлайны";
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.columnId) ||
    Boolean(filters.assigneeId) ||
    Boolean(filters.priority) ||
    Boolean(filters.labelId) ||
    Boolean(filters.onlyOverdue) ||
    Boolean(filters.onlyBlocked);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/80 px-4 md:px-6 backdrop-blur-md border-border/60">
      {/* Title & Project Selector */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-foreground hidden sm:block">
          {title}
        </h1>

        {/* Project Selector for /board */}
        {cleanPathname.startsWith("/board") && projects.length > 0 && (
          <div className="flex items-center gap-2 bg-muted/50 border border-border/80 rounded-xl px-2.5 py-1">
            <span className="text-xs font-mono text-muted-foreground hidden md:inline">
              Проект:
            </span>
            <select
              value={activeProjectId || ""}
              onChange={(e) => {
                const proj = projects.find((p) => p.id === e.target.value);
                if (proj) {
                  setActiveProjectId(proj.id);
                  router.push(`/board/?project=${proj.slug}`);
                }
              }}
              className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer pr-1"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-card text-foreground">
                  {p.name} ({p.type === "website" ? "Сайт" : "Бот"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск задач, ID, меток..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="h-9 w-64 rounded-xl border border-border/80 bg-muted/40 pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:border-ssj-purple focus:outline-none focus:ring-1 focus:ring-ssj-purple transition-all"
          />
          <kbd className="absolute right-2.5 flex h-5 select-none items-center gap-1 rounded border border-border/80 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Filters Badge / Clear button if active */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            title="Сбросить все фильтры"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Сбросить</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={theme === "dark" ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Team Avatars Stack */}
        <div className="hidden lg:flex items-center -space-x-2 overflow-hidden px-1">
          {members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-ssj-purple/20 text-xs font-mono font-medium text-ssj-purple shadow-sm"
              title={`${member.name} (${member.role})`}
            >
              {member.avatar || member.name.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Primary CTA button: New Task */}
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="relative inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-ssj-purple px-4 text-xs md:text-sm font-medium text-white shadow-md shadow-ssj-purple/20 hover:bg-ssj-purple/90 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Новая задача</span>
        </button>
      </div>
    </header>
  );
};
