export type ProjectType = "website" | "telegram-bot";
export type ProjectStatus = "planning" | "active" | "paused" | "completed" | "archived";
export type ProjectHealth = "normal" | "risk" | "critical";

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
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TaskEventType =
  | "created"
  | "column_changed"
  | "assignee_changed"
  | "priority_changed"
  | "due_date_changed"
  | "blocked"
  | "unblocked"
  | "completed";

export interface TaskEvent {
  id: string;
  type: TaskEventType;
  timestamp: string;
  actorId?: string;
  details: string;
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
  dependencyIds?: string[];
  history?: TaskEvent[];
  completedAt?: string;
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
  templateType?: "blank" | "website" | "telegram-bot";
  accentColor?: string;
  taskPrefix?: string;
  wipLimits?: Record<string, number>;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  progressPercentage: number;
  health: ProjectHealth;
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
  unassignedOnly?: boolean;
  noDueDateOnly?: boolean;
  hasDueDate?: boolean;
}

export interface ToastMessage {
  id: string;
  type?: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
