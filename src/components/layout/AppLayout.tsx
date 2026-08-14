"use client";

import React from "react";
import { KanbanProvider } from "@/store/KanbanContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <KanbanProvider>
      <div className="min-h-screen bg-background text-foreground flex antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
        <CreateTaskModal />
        <CreateProjectModal />
        <TaskDetailSheet />
      </div>
    </KanbanProvider>
  );
};
