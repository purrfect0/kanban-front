"use client";

import React from "react";
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
  X,
  UserCheck,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    setIsCreateProjectOpen,
    resetDemoData,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileOpen,
    setIsMobileOpen,
  } = useKanban();

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
    {
      label: "Мои задачи",
      href: "/my-tasks/",
      icon: UserCheck,
    },
  ];

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsMobileOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 flex flex-col border-r bg-card transition-all duration-300 ease-in-out border-border shadow-2xl lg:shadow-none",
          isMobileOpen
            ? "z-50 w-[260px] translate-x-0"
            : "z-40 -translate-x-full lg:translate-x-0",
          !isMobileOpen && (isSidebarCollapsed ? "lg:w-[72px]" : "lg:w-[260px]")
        )}
      >
        {/* Header / Logo Bar */}
        <div className="flex h-16 items-center px-4 border-b border-border">
          {/* Mobile Drawer Header with Close Button */}
          <div className="flex w-full items-center justify-between gap-2 lg:hidden">
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="h-10 w-10 shrink-0 aspect-square flex items-center justify-center rounded-xl bg-ssj-purple/15 border border-ssj-purple/30 p-2 text-ssj-purple shadow-xs">
                <Logo className="h-full w-full object-contain" />
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
              onClick={() => setIsMobileOpen(false)}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Закрыть меню"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Sidebar Header */}
          <div className="hidden lg:flex w-full items-center justify-between">
            {isSidebarCollapsed ? (
              /* Collapsed mode: Centered Logo box that expands on click */
              <div className="flex w-full items-center justify-center">
                <button
                  onClick={toggleSidebar}
                  className="h-10 w-10 shrink-0 aspect-square flex items-center justify-center rounded-xl bg-ssj-purple/15 border border-ssj-purple/30 p-2 text-ssj-purple hover:bg-ssj-purple/25 transition-all shadow-xs"
                  title="Развернуть боковое меню"
                >
                  <Logo className="h-full w-full object-contain" />
                </button>
              </div>
            ) : (
              /* Expanded mode: Logo + Title + Collapse Arrow Button */
              <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
                <Link
                  href="/"
                  className="flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-90 min-w-0"
                >
                  <div className="h-10 w-10 shrink-0 aspect-square flex items-center justify-center rounded-xl bg-ssj-purple/15 border border-ssj-purple/30 p-2 text-ssj-purple shadow-xs">
                    <Logo className="h-full w-full object-contain" />
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
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const cleanPathname = pathname.replace(/^\/kanban-front/, "") || "/";
              const isActive =
                cleanPathname === item.href ||
                (item.href !== "/" && cleanPathname.startsWith(item.href));

              // Collapsed mode (desktop only)
              if (isSidebarCollapsed && !isMobileOpen) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex h-10 w-10 mx-auto items-center justify-center rounded-xl border transition-all shadow-xs",
                      isActive
                        ? "bg-ssj-purple text-white border-ssj-purple shadow-md shadow-ssj-purple/30"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              }

              // Expanded mode & Mobile Drawer
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all border",
                    isActive
                      ? "bg-ssj-purple/15 text-ssj-purple border-ssj-purple/40 shadow-xs"
                      : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-ssj-purple" : "text-muted-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Projects List */}
          <div className="space-y-2">
            {(!isSidebarCollapsed || isMobileOpen) && (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                  Проекты ({projects.length})
                </span>
                <button
                  onClick={() => {
                    setIsCreateProjectOpen(true);
                    setIsMobileOpen(false);
                  }}
                  className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-ssj-purple/20 hover:text-ssj-purple transition-colors"
                  title="Создать новый проект"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              {projects.map((project) => {
                const isSelected = activeProjectId === project.id;
                const TypeIcon = project.type === "website" ? Globe : Bot;

                if (isSidebarCollapsed && !isMobileOpen) {
                  return (
                    <Link
                      key={project.id}
                      href={`/board/?project=${project.slug}`}
                      onClick={() => handleProjectClick(project.id)}
                      className={cn(
                        "flex h-10 w-10 mx-auto items-center justify-center rounded-xl border transition-all shadow-xs",
                        isSelected
                          ? "bg-muted text-foreground border-ssj-purple/60"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={project.name}
                    >
                      <TypeIcon className="h-4 w-4" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={project.id}
                    href={`/board/?project=${project.slug}`}
                    onClick={() => handleProjectClick(project.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all border",
                      isSelected
                        ? "bg-muted text-foreground font-semibold border-border"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <TypeIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        project.type === "website" ? "text-ssj-web" : "text-ssj-bot"
                      )}
                    />
                    <span className="truncate flex-1 font-medium text-xs">{project.name}</span>
                    {isSelected && (
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
          {isSidebarCollapsed && !isMobileOpen ? (
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Развернуть меню"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm("Сбросить демо-данные к первоначальному состоянию?")) {
                  resetDemoData();
                  setIsMobileOpen(false);
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
