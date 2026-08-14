"use client";

import React, { useEffect, useRef, useState } from "react";
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

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    setFilters,
    resetFilters,
    setIsCreateTaskOpen,
    toggleMobileSidebar,
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

  let title = "Обзор";
  if (cleanPathname.startsWith("/board")) {
    title = "Канбан";
  } else if (cleanPathname.startsWith("/deadlines")) {
    title = "Сроки";
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/90 px-3 md:px-6 backdrop-blur-md border-border/80 gap-2">
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

        <h1 className="text-sm sm:text-lg font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>

        {/* Project Selector for /board */}
        {cleanPathname.startsWith("/board") && projects.length > 0 && (
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-xl px-2 py-1 max-w-[130px] sm:max-w-none truncate">
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
              className="bg-transparent text-xs sm:text-sm font-medium text-foreground outline-none cursor-pointer truncate"
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
        {/* Search Input (desktop/tablet) */}
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
            className="h-9 w-48 lg:w-64 rounded-xl border border-border bg-background pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-ssj-purple focus:outline-none focus:ring-1 focus:ring-ssj-purple transition-all"
          />
          <kbd className="absolute right-2.5 flex h-5 select-none items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
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
          className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-ssj-purple px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-ssj-purple/20 hover:bg-ssj-purple/90 active:scale-95 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Новая задача</span>
          <span className="xs:hidden">Задача</span>
        </button>
      </div>
    </header>
  );
};
