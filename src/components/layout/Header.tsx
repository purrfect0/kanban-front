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

  // Determine current page title
  const cleanPathname = pathname.replace(/\/$/, "");
  let title = "Обзор проектов";
  if (cleanPathname.startsWith("/board")) {
    title = "Канбан";
  } else if (cleanPathname.startsWith("/deadlines")) {
    title = "Сроки и дедлайны";
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
    <header className="sticky top-0 z-30 flex h-16 fluid-header-h w-full items-center justify-between border-b bg-card/90 px-3 md:px-6 backdrop-blur-md border-border/60 gap-2 shadow-xs">
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

        <h1 className="text-sm sm:text-base fluid-text-base font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>

        {/* Project Selector for /board */}
        {cleanPathname.startsWith("/board") && projects.length > 0 && (
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border/80 rounded-xl px-2.5 py-1 max-w-[130px] sm:max-w-none truncate">
            <span className="text-xs fluid-text-xs font-mono text-muted-foreground hidden md:inline">
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
              className="bg-transparent text-xs sm:text-sm fluid-text-sm font-semibold text-foreground outline-none cursor-pointer truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-[#141416] text-slate-900 dark:text-slate-100 font-semibold">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Area: Command Palette Search, Theme Toggle, Assignee Avatars, New Task Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Command Palette Search CTA */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs fluid-text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-2xs"
          title="Поиск задач и команд (Ctrl + K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Поиск и команды...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Global Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors shadow-2xs"
          title={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
          aria-label="Переключить тему"
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-ssj-purple" />
            )
          ) : (
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
          )}
        </button>

        {/* Team Avatars Bar */}
        <div className="hidden lg:flex items-center -space-x-1.5">
          {members.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-ssj-purple/20 text-[11px] font-mono font-bold text-ssj-purple border-2 border-card shadow-2xs"
              title={member.name}
            >
              {member.avatar}
            </div>
          ))}
        </div>

        {/* Create Task Button */}
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-ssj-purple px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm fluid-text-sm font-bold text-white shadow-md hover:bg-ssj-purple/90 transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Новая задача</span>
          <span className="xs:hidden">Задача</span>
        </button>
      </div>
    </header>
  );
};
