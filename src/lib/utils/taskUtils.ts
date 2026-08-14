import { Task, Project, ProjectStats, ProjectHealth, TaskDeadlineStatus } from "@/types/kanban";

/**
 * Normalizes date string or Date object to YYYY-MM-DD string in local time
 */
export function toIsoDateString(d: Date | string): string {
  if (typeof d === "string") {
    if (d.includes("T")) {
      d = new Date(d);
    } else {
      return d;
    }
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIsoString(): string {
  return toIsoDateString(new Date());
}

/**
 * A task is OVERDUE ONLY if:
 * 1. Has a dueDate
 * 2. dueDate < today
 * 3. columnId !== "done"
 * 4. Not completed (no completedAt)
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  if (task.columnId === "done" || Boolean(task.completedAt)) return false;

  const today = getTodayIsoString();
  return task.dueDate < today;
}

export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false;
  if (task.columnId === "done" || Boolean(task.completedAt)) return false;

  const today = getTodayIsoString();
  return task.dueDate === today;
}

export function isTaskDueSoon(task: Task, daysAhead = 3): boolean {
  if (!task.dueDate) return false;
  if (task.columnId === "done" || Boolean(task.completedAt)) return false;

  const todayStr = getTodayIsoString();
  if (task.dueDate <= todayStr) return false;

  const today = new Date(todayStr);
  const due = new Date(task.dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 && diffDays <= daysAhead;
}

export function getTaskDeadlineState(task: Task): TaskDeadlineStatus {
  if (isTaskOverdue(task)) return "overdue";
  if (isTaskDueToday(task)) return "today";
  if (isTaskDueSoon(task)) return "due_soon";
  return "normal";
}

/**
 * Calculates Project Health & Statistics deterministically:
 * - В норме (normal): 0 overdue, 0 blocked, deadline not passed
 * - Есть риск (risk): 1 overdue or 1 blocked or deadline within 3 days
 * - Критично (critical): > 1 overdue/blocked OR project deadline passed with unfinished tasks
 */
export function calculateProjectStats(project: Project, projectTasks: Task[]): ProjectStats {
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(
    (t) => t.columnId === "done" || Boolean(t.completedAt)
  ).length;

  const overdueTasks = projectTasks.filter(isTaskOverdue).length;
  const blockedTasks = projectTasks.filter(
    (t) => t.isBlocked && t.columnId !== "done"
  ).length;

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStr = getTodayIsoString();
  const isProjectOverdue =
    Boolean(project.dueDate) && project.dueDate! < todayStr && progressPercentage < 100;

  let health: ProjectHealth = "normal";

  if (isProjectOverdue || overdueTasks >= 2 || blockedTasks >= 2) {
    health = "critical";
  } else if (overdueTasks === 1 || blockedTasks === 1) {
    health = "risk";
  }

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    blockedTasks,
    progressPercentage,
    health,
  };
}

/**
 * Circular dependency check: Returns true if targetDepId depends back on taskId
 */
export function hasCyclicDependency(
  taskId: string,
  targetDepId: string,
  allTasks: Task[]
): boolean {
  if (taskId === targetDepId) return true;

  const visited = new Set<string>();
  const queue = [targetDepId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === taskId) return true;

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const currentTask = allTasks.find((t) => t.id === currentId);
      if (currentTask && currentTask.dependencyIds) {
        queue.push(...currentTask.dependencyIds);
      }
    }
  }

  return false;
}
