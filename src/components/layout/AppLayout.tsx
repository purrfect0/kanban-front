"use client";

import React from "react";
import { KanbanProvider, useKanban } from "@/store/KanbanContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { isSidebarCollapsed } = useKanban();

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <CreateTaskModal />
      <CreateProjectModal />
      <TaskDetailSheet />
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
