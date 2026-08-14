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
          !isMobileOpen && (isSidebarCollapsed ? "fluid-sidebar-w-collapsed lg:w-[72px]" : "fluid-sidebar-w lg:w-[260px]")
        )}
      >
        {/* Header / Logo Bar */}
        <div className="flex h-16 fluid-header-h items-center px-4 border-b border-border">
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

          {/* Desktop Logo & Collapse Toggle Button */}
          <div className="hidden lg:flex w-full items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 overflow-hidden"
              title="SSJKanban"
            >
              <div className="h-10 w-10 shrink-0 aspect-square flex items-center justify-center rounded-xl bg-ssj-purple/15 border border-ssj-purple/30 p-2 text-ssj-purple shadow-xs">
                <Logo className="h-full w-full object-contain" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-bold tracking-tight text-foreground text-sm fluid-text-sm flex items-center gap-1.5">
                    SSJKanban
                    <span className="rounded bg-ssj-purple/20 px-1.5 py-0.5 text-[10px] font-mono text-ssj-purple font-semibold">
                      MVP
                    </span>
                  </span>
                  <span className="text-[11px] fluid-text-xs text-muted-foreground font-mono">
                    SSJCorp Team
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={toggleSidebar}
              className="rounded-xl border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs"
              title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm fluid-text-sm font-semibold transition-all group",
                    isActive
                      ? "bg-ssj-purple/15 text-ssj-purple border border-ssj-purple/30 shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-ssj-purple" : "text-muted-foreground"
                    )}
                  />
                  {(!isSidebarCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Project List Section */}
          {(!isSidebarCollapsed || isMobileOpen) && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-3">
                <span className="text-[11px] fluid-text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Проекты ({projects.length})
                </span>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Создать новый проект"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {projects.map((project) => {
                  const isActive = activeProjectId === project.id;
                  const Icon = project.type === "website" ? Globe : Bot;

                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs fluid-text-xs font-semibold transition-all group text-left",
                        isActive
                          ? "bg-secondary text-foreground border border-border font-bold shadow-2xs"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-colors",
                            project.type === "website"
                              ? "text-ssj-web"
                              : "text-ssj-bot"
                          )}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>

                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-ssj-purple shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Area: Reset Demo Data */}
        <div className="p-3 border-t border-border">
          <button
            onClick={resetDemoData}
            className={cn(
              "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs fluid-text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
              isSidebarCollapsed && !isMobileOpen ? "justify-center" : ""
            )}
            title="Сбросить все демо-данные к исходным"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            {(!isSidebarCollapsed || isMobileOpen) && (
              <span className="truncate">Сбросить демо-данные</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
