import { KanbanRepository, getTaskDeadlineStatus } from "./KanbanRepository";
import { Project, Task, Column, Member, ProjectStats } from "@/types/kanban";
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_COLUMNS,
  INITIAL_MEMBERS,
} from "@/data/seedData";

const STORAGE_KEY = "ssjcorp-kanban:v3";

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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial: StorageSchema = {
          projects: INITIAL_PROJECTS,
          tasks: INITIAL_TASKS,
          columns: INITIAL_COLUMNS,
          members: INITIAL_MEMBERS,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
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
    
    // Auto-generate task ID based on project slug prefix or default WEB
    const project = data.projects.find((p) => p.id === taskData.projectId);
    const prefix = project
      ? project.slug.split("-")[0].toUpperCase()
      : "TASK";
    const count = data.tasks.filter((t) => t.projectId === taskData.projectId).length + 1;
    const id = `${prefix}-${String(count).padStart(3, "0")}`;

    const newTask: Task = {
      ...taskData,
      id,
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

    const updated: Task = {
      ...data.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
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
    task.columnId = targetColumnId;
    task.updatedAt = new Date().toISOString();

    // Reorder within column array if targetIndex specified
    if (targetIndex !== undefined) {
      data.tasks.splice(taskIndex, 1);
      // Find tasks in the target column
      const targetColTasks = data.tasks.filter(
        (t) => t.columnId === targetColumnId && t.projectId === task.projectId
      );
      const insertionPos = Math.min(targetIndex, targetColTasks.length);
      
      // Calculate real index in data.tasks
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
    const projectTasks = data.tasks.filter((t) => t.projectId === projectId);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.columnId === "done").length;
    const overdueTasks = projectTasks.filter(
      (t) => t.columnId !== "done" && getTaskDeadlineStatus(t.dueDate) === "overdue"
    ).length;

    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      progressPercentage,
    };
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
