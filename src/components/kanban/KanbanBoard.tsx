"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useKanban } from "@/store/KanbanContext";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types/kanban";

export const KanbanBoard: React.FC = () => {
  const {
    columns,
    members,
    filteredTasks,
    activeProjectId,
    moveTask,
  } = useKanban();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag intent to prevent accidental clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks for current active project
  const projectTasks = filteredTasks.filter(
    (t) => !activeProjectId || t.projectId === activeProjectId
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = projectTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find columns
    const activeTaskItem = projectTasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    // Is over a column or another task?
    let targetColumnId = overId;
    const overTaskItem = projectTasks.find((t) => t.id === overId);
    if (overTaskItem) {
      targetColumnId = overTaskItem.columnId;
    }

    if (activeTaskItem.columnId !== targetColumnId) {
      moveTask(activeId, targetColumnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = projectTasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    let targetColumnId = overId;
    const overTaskItem = projectTasks.find((t) => t.id === overId);

    if (overTaskItem) {
      targetColumnId = overTaskItem.columnId;
    }

    moveTask(activeId, targetColumnId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Horizontal Scroll Kanban Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth min-h-[calc(100vh-140px)]">
        {columns.map((column) => {
          const colTasks = projectTasks.filter((t) => t.columnId === column.id);
          return (
            <div key={column.id} className="snap-start shrink-0">
              <KanbanColumn column={column} tasks={colTasks} members={members} />
            </div>
          );
        })}
      </div>

      {/* Drag Overlay Preview */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl opacity-90">
            <TaskCard task={activeTask} members={members} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
