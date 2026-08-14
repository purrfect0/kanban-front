import { KanbanRepository } from "./KanbanRepository";
import { Project, Task, Column, Member, ProjectStats } from "@/types/kanban";
import { calculateProjectStats } from "@/lib/utils/taskUtils";
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_COLUMNS,
  INITIAL_MEMBERS,
} from "@/data/seedData";

const STORAGE_KEY = "ssjcorp-kanban:v4";
const PREVIOUS_KEYS = ["ssjcorp-kanban:v3", "ssjcorp-kanban:v2", "ssjcorp-kanban:v1"];

interface StorageSchema {
  projects: Project[];
  tasks: Task[];
  columns: Column[];
  members: Member[];
}

export class LocalStorageKanbanRepository implements KanbanRepository {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private migrateSchema(raw: StorageSchema): StorageSchema {
    // Safely migrate fields without wiping user tasks
    const tasks = (raw.tasks || []).map((t) => ({
      ...t,
      dependencyIds: t.dependencyIds || [],
      history: t.history || [
        {
          id: `hist-init-${t.id}`,
          type: "created" as const,
          timestamp: t.createdAt || new Date().toISOString(),
          details: "Задача создана",
        },
      ],
      completedAt: t.completedAt || (t.columnId === "done" ? t.updatedAt || new Date().toISOString() : undefined),
    }));

    const projects = (raw.projects || []).map((p) => ({
      ...p,
      status: p.status || ("active" as const),
      templateType: p.templateType || (p.type === "website" ? ("website" as const) : ("telegram-bot" as const)),
      accentColor: p.accentColor || (p.type === "website" ? "#22C55E" : "#29A9EB"),
      taskPrefix: p.taskPrefix || (p.type === "website" ? "WEB" : "BOT"),
    }));

    return {
      projects,
      tasks,
      columns: raw.columns || INITIAL_COLUMNS,
      members: raw.members || INITIAL_MEMBERS,
    };
  }

  private loadData(): StorageSchema {
    if (!this.isClient()) {
      return {
        projects: INITIAL_PROJECTS,
        tasks: INITIAL_TASKS,
        columns: INITIAL_COLUMNS,
        members: INITIAL_MEMBERS,
      };
    }

    try {
      // 1. Try loading v4 schema
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return this.migrateSchema(JSON.parse(raw));
      }

      // 2. Migration from previous storage keys (v3, v2, v1)
      for (const prevKey of PREVIOUS_KEYS) {
        const prevRaw = localStorage.getItem(prevKey);
        if (prevRaw) {
          try {
            const parsed = JSON.parse(prevRaw);
            const migrated = this.migrateSchema(parsed);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
          } catch (err) {
            console.error(`Failed to parse legacy data from ${prevKey}:`, err);
          }
        }
      }

      // 3. Fallback to initial seed data
      const initial: StorageSchema = {
        projects: INITIAL_PROJECTS,
        tasks: INITIAL_TASKS,
        columns: INITIAL_COLUMNS,
        members: INITIAL_MEMBERS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error("Failed to load from LocalStorage:", e);
      return {
        projects: INITIAL_PROJECTS,
        tasks: INITIAL_TASKS,
        columns: INITIAL_COLUMNS,
        members: INITIAL_MEMBERS,
      };
    }
  }

  private saveData(data: StorageSchema): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to LocalStorage:", e);
    }
  }

  async getProjects(): Promise<Project[]> {
    const data = this.loadData();
    return data.projects;
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const data = this.loadData();
    return data.projects.find((p) => p.slug === slug) || null;
  }

  async createProject(
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    const data = this.loadData();
    const now = new Date().toISOString();
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      ...projectData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    data.projects.push(newProject);
    this.saveData(data);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const data = this.loadData();
    const index = data.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Project ${id} not found`);

    const updated: Project = {
      ...data.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    data.projects[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const data = this.loadData();
    data.projects = data.projects.filter((p) => p.id !== id);
    data.tasks = data.tasks.filter((t) => t.projectId !== id);
    this.saveData(data);
    return true;
  }

  async getColumns(): Promise<Column[]> {
    const data = this.loadData();
    return data.columns.sort((a, b) => a.order - b.order);
  }

  async getMembers(): Promise<Member[]> {
    const data = this.loadData();
    return data.members;
  }

  async getTasks(projectId?: string): Promise<Task[]> {
    const data = this.loadData();
    if (projectId) {
      return data.tasks.filter((t) => t.projectId === projectId);
    }
    return data.tasks;
  }

  async getTaskById(id: string): Promise<Task | null> {
    const data = this.loadData();
    return data.tasks.find((t) => t.id === id) || null;
  }

  async createTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> {
    const data = this.loadData();
    const now = new Date().toISOString();

    const project = data.projects.find((p) => p.id === taskData.projectId);
    const prefix = project?.taskPrefix || (project ? project.slug.split("-")[0].toUpperCase() : "TASK");
    const count = data.tasks.filter((t) => t.projectId === taskData.projectId).length + 1;
    const id = `${prefix}-${String(count).padStart(3, "0")}`;

    const newTask: Task = {
      ...taskData,
      id,
      dependencyIds: taskData.dependencyIds || [],
      history: [
        {
          id: `hist-${Date.now()}`,
          type: "created",
          timestamp: now,
          details: "Задача создана",
        },
      ],
      completedAt: taskData.columnId === "done" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    data.tasks.push(newTask);
    this.saveData(data);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const data = this.loadData();
    const index = data.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);

    const existing = data.tasks[index];
    const now = new Date().toISOString();

    const newHistory = [...(existing.history || [])];

    // Log column change history
    if (updates.columnId && updates.columnId !== existing.columnId) {
      newHistory.push({
        id: `hist-${Date.now()}`,
        type: updates.columnId === "done" ? "completed" : "column_changed",
        timestamp: now,
        details: `Статус изменен на ${updates.columnId}`,
      });
    }

    // Log block history
    if (updates.isBlocked !== undefined && updates.isBlocked !== existing.isBlocked) {
      newHistory.push({
        id: `hist-${Date.now()}`,
        type: updates.isBlocked ? "blocked" : "unblocked",
        timestamp: now,
        details: updates.isBlocked ? `Заблокирована: ${updates.blockedReason || ""}` : "Снята блокировка",
      });
    }

    const updated: Task = {
      ...existing,
      ...updates,
      history: newHistory,
      completedAt:
        updates.columnId === "done"
          ? existing.completedAt || now
          : updates.columnId
          ? undefined
          : existing.completedAt,
      updatedAt: now,
    };

    data.tasks[index] = updated;
    this.saveData(data);
    return updated;
  }

  async moveTask(
    taskId: string,
    targetColumnId: string,
    targetIndex?: number
  ): Promise<Task> {
    const data = this.loadData();
    const taskIndex = data.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    const task = data.tasks[taskIndex];
    const now = new Date().toISOString();

    if (task.columnId !== targetColumnId) {
      task.history = [
        ...(task.history || []),
        {
          id: `hist-${Date.now()}`,
          type: targetColumnId === "done" ? "completed" : "column_changed",
          timestamp: now,
          details: `Перемещена в колонку ${targetColumnId}`,
        },
      ];
      if (targetColumnId === "done") {
        task.completedAt = now;
      } else {
        task.completedAt = undefined;
      }
    }

    task.columnId = targetColumnId;
    task.updatedAt = now;

    if (targetIndex !== undefined) {
      data.tasks.splice(taskIndex, 1);
      const targetColTasks = data.tasks.filter(
        (t) => t.columnId === targetColumnId && t.projectId === task.projectId
      );
      const insertionPos = Math.min(targetIndex, targetColTasks.length);

      if (targetColTasks.length === 0) {
        data.tasks.push(task);
      } else {
        const refTask = targetColTasks[insertionPos] || targetColTasks[targetColTasks.length - 1];
        const refIdx = data.tasks.indexOf(refTask);
        data.tasks.splice(refIdx >= 0 ? refIdx : data.tasks.length, 0, task);
      }
    }

    this.saveData(data);
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const data = this.loadData();
    data.tasks = data.tasks.filter((t) => t.id !== id);
    this.saveData(data);
    return true;
  }

  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const data = this.loadData();
    const project = data.projects.find((p) => p.id === projectId);
    const projectTasks = data.tasks.filter((t) => t.projectId === projectId);
    if (!project) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        blockedTasks: 0,
        progressPercentage: 0,
        health: "normal",
      };
    }
    return calculateProjectStats(project, projectTasks);
  }

  async resetDemoData(): Promise<void> {
    if (!this.isClient()) return;
    const initial: StorageSchema = {
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      columns: INITIAL_COLUMNS,
      members: INITIAL_MEMBERS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }
}

export const kanbanRepository = new LocalStorageKanbanRepository();
