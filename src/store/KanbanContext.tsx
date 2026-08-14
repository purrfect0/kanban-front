"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Project,
  Task,
  Column,
  Member,
  FilterState,
  Priority,
} from "@/types/kanban";
import { kanbanRepository } from "@/lib/repositories/LocalStorageKanbanRepository";
import { getTaskDeadlineStatus } from "@/lib/repositories/KanbanRepository";

interface KanbanContextType {
  projects: Project[];
  tasks: Task[];
  columns: Column[];
  members: Member[];
  activeProjectId: string | null;
  activeProject: Project | null;
  setActiveProjectId: (id: string | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredTasks: Task[];
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: (open: boolean) => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isLoading: boolean;

  // Actions
  refreshData: () => Promise<void>;
  createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  moveTask: (taskId: string, targetColumnId: string, targetIndex?: number) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  createProject: (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: "",
};

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Sync active project to localStorage
  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
    if (typeof window !== "undefined" && id) {
      localStorage.setItem("ssjcorp-kanban:last-project", id);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [projs, tsks, cols, mems] = await Promise.all([
        kanbanRepository.getProjects(),
        kanbanRepository.getTasks(),
        kanbanRepository.getColumns(),
        kanbanRepository.getMembers(),
      ]);
      setProjects(projs);
      setTasks(tsks);
      setColumns(cols);
      setMembers(mems);

      // Auto-select last active project or first project if none selected
      if (!activeProjectId && projs.length > 0) {
        const saved = typeof window !== "undefined" ? localStorage.getItem("ssjcorp-kanban:last-project") : null;
        const exists = saved ? projs.find((p) => p.id === saved || p.slug === saved) : null;
        setActiveProjectIdState(exists ? exists.id : projs[0].id);
      }
    } catch (err) {
      console.error("Failed to load kanban data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Theme management
  useEffect(() => {
    const savedTheme = (localStorage.getItem("ssjcorp-kanban:theme-v3") as "dark" | "light" | null) || "dark";
    setThemeState(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const setTheme = (t: "dark" | "light") => {
    setThemeState(t);
    localStorage.setItem("ssjcorp-kanban:theme-v3", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Client-side task filtering engine
  const filteredTasks = tasks.filter((task) => {
    // Project filter
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false;
    }

    // Column filter
    if (filters.columnId && task.columnId !== filters.columnId) {
      return false;
    }

    // Assignee filter
    if (filters.assigneeId && !task.assigneeIds.includes(filters.assigneeId)) {
      return false;
    }

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Label filter
    if (filters.labelId && !task.labels.some((l) => l.id === filters.labelId)) {
      return false;
    }

    // Overdue filter
    if (filters.onlyOverdue && getTaskDeadlineStatus(task.dueDate) !== "overdue") {
      return false;
    }

    // Blocked filter
    if (filters.onlyBlocked && !task.isBlocked) {
      return false;
    }

    // Has due date filter
    if (filters.hasDueDate && !task.dueDate) {
      return false;
    }

    // Search query (title, ID, description, labels)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchLabel = task.labels.some((l) => l.name.toLowerCase().includes(q));
      if (!matchTitle && !matchId && !matchDesc && !matchLabel) {
        return false;
      }
    }

    return true;
  });

  // Action methods
  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask = await kanbanRepository.createTask(taskData);
    await refreshData();
    return newTask;
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await kanbanRepository.updateTask(id, updates);
    if (selectedTask?.id === id) {
      setSelectedTask(updated);
    }
    await refreshData();
    return updated;
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string, targetIndex?: number) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t))
    );
    const moved = await kanbanRepository.moveTask(taskId, targetColumnId, targetIndex);
    await refreshData();
    return moved;
  };

  const handleDeleteTask = async (id: string) => {
    await kanbanRepository.deleteTask(id);
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
    await refreshData();
  };

  const handleCreateProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProject = await kanbanRepository.createProject(projectData);
    await refreshData();
    setActiveProjectId(newProject.id);
    return newProject;
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    const updated = await kanbanRepository.updateProject(id, updates);
    await refreshData();
    return updated;
  };

  const handleDeleteProject = async (id: string) => {
    await kanbanRepository.deleteProject(id);
    if (activeProjectId === id) {
      setActiveProjectId(projects.find((p) => p.id !== id)?.id || null);
    }
    await refreshData();
  };

  const handleResetDemoData = async () => {
    await kanbanRepository.resetDemoData();
    await refreshData();
  };

  return (
    <KanbanContext.Provider
      value={{
        projects,
        tasks,
        columns,
        members,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        filters,
        setFilters,
        resetFilters,
        filteredTasks,
        selectedTask,
        setSelectedTask,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isCreateProjectOpen,
        setIsCreateProjectOpen,
        theme,
        setTheme,
        toggleTheme,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isLoading,
        refreshData,
        createTask: handleCreateTask,
        updateTask: handleUpdateTask,
        moveTask: handleMoveTask,
        deleteTask: handleDeleteTask,
        createProject: handleCreateProject,
        updateProject: handleUpdateProject,
        deleteProject: handleDeleteProject,
        resetDemoData: handleResetDemoData,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
};
