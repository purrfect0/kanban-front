export type ProjectType = "website" | "telegram-bot";
export type ProjectStatus = "active" | "archived" | "completed";

export type Priority = "P0" | "P1" | "P2" | "P3";

export type TaskDeadlineStatus = "normal" | "due_soon" | "today" | "overdue";

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Label {
  id: string;
  name: string;
  color: string; // hex or tailwind class
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string; // e.g., "WEB-024"
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  labels: Label[];
  assigneeIds: string[];
  dueDate?: string; // YYYY-MM-DD
  timeEstimate?: string; // e.g. "4h", "2d"
  checklist: ChecklistItem[];
  isBlocked: boolean;
  blockedReason?: string;
  attachmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  wipLimit?: number;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  leadId: string;
  memberIds: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progressPercentage: number;
}

export interface FilterState {
  searchQuery: string;
  projectId?: string;
  columnId?: string;
  assigneeId?: string;
  priority?: Priority;
  labelId?: string;
  onlyOverdue?: boolean;
  onlyBlocked?: boolean;
  hasDueDate?: boolean;
}
