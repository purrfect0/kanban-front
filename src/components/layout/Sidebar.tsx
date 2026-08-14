"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Bot,
  RotateCcw,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  basePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    setIsCreateProjectOpen,
    resetDemoData,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
  } = useKanban();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Обзор",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Доска",
      href: "/board/",
      icon: KanbanSquare,
    },
    {
      label: "Сроки",
      href: "/deadlines/",
      icon: CalendarDays,
    },
  ];

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300 ease-in-out border-border",
          isSidebarCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo Bar */}
        <div className="flex h-16 items-center px-4 border-b border-border">
          {isSidebarCollapsed ? (
            /* Collapsed mode: Centered Logo + Expand Button toggle */
            <div className="flex w-full items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="h-10 w-10 shrink-0 aspect-square flex items-center justify-center rounded-xl bg-ssj-purple/10 border border-ssj-purple/20 p-2 text-ssj-purple hover:bg-ssj-purple/20 transition-all mx-auto"
                title="Развернуть меню"
              >
                <Logo className="h-full w-full" />
              </button>
            </div>
          ) : (
            /* Expanded mode: Logo + Title + Collapse Button */
            <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
              <Link
                href="/"
                className="flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-90 min-w-0"
              >
                <div className="h-10 w-10 shrink-0 aspect-square flex items-center justify-center rounded-xl bg-ssj-purple/10 border border-ssj-purple/20 p-2 text-ssj-purple">
                  <Logo className="h-full w-full" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold tracking-tight text-foreground text-sm flex items-center gap-1.5">
                    SSJKanban
                    <span className="rounded bg-ssj-purple/20 px-1.5 py-0.5 text-[10px] font-mono text-ssj-purple font-semibold">
                      MVP
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    SSJCorp Team
                  </span>
                </div>
              </Link>

              <button
                onClick={toggleSidebar}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Свернуть панель"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const cleanPathname = pathname.replace(/^\/kanban-front/, "") || "/";
              const isActive =
                cleanPathname === item.href ||
                (item.href !== "/" && cleanPathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2 text-sm font-medium transition-all group",
                    isActive
                      ? "bg-ssj-purple/15 text-ssj-purple border border-ssj-purple/30 shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div
                    className={cn(
                      "h-9 w-9 shrink-0 aspect-square rounded-xl flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-ssj-purple text-white shadow-md shadow-ssj-purple/30"
                        : "bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="truncate font-semibold">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Projects List */}
          <div className="space-y-2">
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                  Проекты ({projects.length})
                </span>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-ssj-purple/20 hover:text-ssj-purple transition-colors"
                  title="Создать новый проект"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              {projects.map((project) => {
                const isSelected = activeProjectId === project.id;
                const TypeIcon = project.type === "website" ? Globe : Bot;
                const accentColor =
                  project.type === "website" ? "text-ssj-web" : "text-ssj-bot";

                return (
                  <Link
                    key={project.id}
                    href={`/board/?project=${project.slug}`}
                    onClick={() => handleProjectClick(project.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 text-sm transition-all group",
                      isSelected
                        ? "bg-muted text-foreground font-semibold border border-border"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                    title={isSidebarCollapsed ? project.name : undefined}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 shrink-0 aspect-square rounded-xl flex items-center justify-center bg-muted/40 border border-border/50",
                        accentColor
                      )}
                    >
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 font-medium">{project.name}</span>
                    )}
                    {!isSidebarCollapsed && isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-ssj-purple animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-2">
          {isSidebarCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center justify-center h-9 rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Развернуть меню"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm("Сбросить демо-данные к первоначальному состоянию?")) {
                  resetDemoData();
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Сбросить демо-данные</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
