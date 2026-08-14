"use client";

import React, { useState, useEffect } from "react";
import { KanbanProvider, useKanban } from "@/store/KanbanContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ToastContainer } from "@/components/ui/Toast";
import { DotPattern } from "@/components/ui/DotPattern";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { isSidebarCollapsed, toast, dismissToast } = useKanban();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl/Cmd + K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-foreground flex antialiased overflow-x-hidden">
      {/* Level 0 Background Tech Pattern & Soft Purple Radial Glows */}
      <DotPattern className="opacity-[0.07] pointer-events-none fixed inset-0 z-0" />
      <div className="fixed top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-ssj-purple/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-ssj-bot/10 blur-[140px] pointer-events-none" />

      {/* Sidebar (Level 1 Shell) */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out min-h-screen",
          isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        )}
      >
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Level 4 Overlay Dialogs & Toast */}
      <CreateTaskModal />
      <CreateProjectModal />
      <TaskDetailSheet />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <ToastContainer toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <KanbanProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </KanbanProvider>
  );
};
