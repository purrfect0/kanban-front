import { Project, Task, Column, Member, ProjectStats, TaskDeadlineStatus } from "@/types/kanban";

export interface KanbanRepository {
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;

  getColumns(): Promise<Column[]>;

  getMembers(): Promise<Member[]>;

  getTasks(projectId?: string): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  moveTask(taskId: string, targetColumnId: string, targetIndex?: number): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;

  getProjectStats(projectId: string): Promise<ProjectStats>;
  resetDemoData(): Promise<void>;
}

export function getTaskDeadlineStatus(dueDate?: string): TaskDeadlineStatus {
  if (!dueDate) return "normal";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 3) return "due_soon";
  return "normal";
}
