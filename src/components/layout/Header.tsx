"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Plus,
  Sun,
  Moon,
  X,
  Menu,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";

interface HeaderProps {
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    projects,
    members,
    activeProjectId,
    setActiveProjectId,
    filters,
    resetFilters,
    setIsCreateTaskOpen,
    toggleMobileSidebar,
  } = useKanban();

  const cleanPathname = pathname.replace(/^\/kanban-front/, "") || "/";

  let title = "Обзор";
  if (cleanPathname.startsWith("/board")) {
    title = "Канбан";
  } else if (cleanPathname.startsWith("/deadlines")) {
    title = "Сроки";
  } else if (cleanPathname.startsWith("/my-tasks")) {
    title = "Мои задачи";
  }

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.columnId) ||
    Boolean(filters.assigneeId) ||
    Boolean(filters.priority) ||
    Boolean(filters.labelId) ||
    Boolean(filters.onlyOverdue) ||
    Boolean(filters.onlyBlocked);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/90 px-3 md:px-6 backdrop-blur-md border-border/60 gap-2 shadow-xs">
      {/* Left Area: Mobile Menu Toggle + Page Title + Project Selector */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors lg:hidden"
          title="Открыть боковое меню"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>

        {/* Project Selector for /board */}
        {cleanPathname.startsWith("/board") && projects.length > 0 && (
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border/80 rounded-xl px-2.5 py-1 max-w-[130px] sm:max-w-none truncate">
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
              className="bg-transparent text-xs sm:text-sm font-semibold text-foreground outline-none cursor-pointer truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Command Palette Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-background px-3 text-xs text-muted-foreground hover:border-ssj-purple/50 hover:text-foreground transition-all"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">Поиск и команды...</span>
          <kbd className="flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-bold text-muted-foreground">
            ⌘K
          </kbd>
        </button>

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
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          title={mounted && isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
        >
          {mounted && isDark ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Team Avatars (desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-1">
          {members.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-ssj-purple/30 bg-ssj-purple/15 text-xs font-mono font-semibold text-ssj-purple shadow-xs"
              title={`${member.name} (${member.role})`}
            >
              {member.avatar || member.name.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Primary CTA button: New Task */}
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-ssj-purple px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-ssj-purple/25 hover:bg-ssj-purple/90 active:scale-95 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Новая задача</span>
          <span className="xs:hidden">Задача</span>
        </button>
      </div>
    </header>
  );
};
