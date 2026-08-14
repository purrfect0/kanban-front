"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Folder,
  Globe,
  Bot,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useKanban } from "@/store/KanbanContext";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/Logo";

interface SidebarProps {
  basePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ basePath = "" }) => {
  const pathname = usePathname();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    setIsCreateProjectOpen,
    resetDemoData,
  } = useKanban();

  const [isCollapsed, setIsCollapsed] = useState(false);
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
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300 border-border/80",
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ssj-purple/10 border border-ssj-purple/20 p-2 text-ssj-purple">
              <Logo className="h-full w-full" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-foreground text-sm flex items-center gap-1.5">
                  SSJKanban
                  <span className="rounded bg-ssj-purple/20 px-1.5 py-0.5 text-[10px] font-mono text-ssj-purple font-medium">
                    MVP
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  SSJCorp Team
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={isCollapsed ? "Развернуть панель" : "Свернуть панель"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Handle basePath matching for production GitHub Pages
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
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-ssj-purple/15 text-ssj-purple border border-ssj-purple/30 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-ssj-purple")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Projects List */}
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all group",
                      isSelected
                        ? "bg-muted text-foreground font-medium border border-border"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                    title={isCollapsed ? project.name : undefined}
                  >
                    <TypeIcon className={cn("h-4 w-4 shrink-0", accentColor)} />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{project.name}</span>
                    )}
                    {!isCollapsed && isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-ssj-purple animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border/60 space-y-2">
          {!isCollapsed && (
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
