import { useCallback, useRef } from 'react';
import type { Task, TasksByStatus, CreateTaskPayload, UpdateTaskPayload } from '../types';
import { useTaskBoardContext } from '../context/TaskBoardProvider';
import { POSITION_GAP } from '../utils/constants';

export function useTaskActions(
  tasks: TasksByStatus,
  setTasks: React.Dispatch<React.SetStateAction<TasksByStatus>>,
  fetchTasks: () => Promise<void>,
) {
  const { service, config } = useTaskBoardContext();

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const createTask = useCallback(async (data: CreateTaskPayload): Promise<Task> => {
    const task = await service.createTask(data);
    config.onTaskCreate?.(task);
    await fetchTasks();
    return task;
  }, [service, config, fetchTasks]);

  const updateTask = useCallback(async (taskId: string, data: UpdateTaskPayload): Promise<Task> => {
    const task = await service.updateTask(taskId, data);
    config.onTaskUpdate?.(task);
    await fetchTasks();
    return task;
  }, [service, config, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    await service.deleteTask(taskId);
    config.onTaskDelete?.(taskId);
    await fetchTasks();
  }, [service, config, fetchTasks]);

  const markTaskRead = useCallback(async (taskId: string): Promise<void> => {
    service.markTaskRead(taskId).catch(() => {});
  }, [service]);

  const moveTask = useCallback(async (
    taskId: string,
    sourceStatus: string,
    destStatus: string,
    sourceIndex: number,
    destIndex: number,
  ) => {
    const currentTasks = tasksRef.current;
    const sourceCol = [...(currentTasks[sourceStatus] || [])];
    const destCol = sourceStatus === destStatus ? sourceCol : [...(currentTasks[destStatus] || [])];

    const [movedTask] = sourceCol.splice(sourceIndex, 1);
    if (!movedTask) return;

    const updatedTask = { ...movedTask, status: destStatus };
    destCol.splice(destIndex, 0, updatedTask);

    // Calculate position
    let newPosition: number;
    if (destCol.length === 1) {
      newPosition = POSITION_GAP;
    } else if (destIndex === 0) {
      newPosition = (destCol[1]?.position ?? POSITION_GAP) - POSITION_GAP;
    } else if (destIndex === destCol.length - 1) {
      newPosition = (destCol[destCol.length - 2]?.position ?? 0) + POSITION_GAP;
    } else {
      const above = destCol[destIndex - 1]?.position ?? 0;
      const below = destCol[destIndex + 1]?.position ?? above + POSITION_GAP * 2;
      newPosition = (above + below) / 2;
    }
    updatedTask.position = newPosition;

    // Optimistic update
    const newTasks = { ...currentTasks };
    newTasks[sourceStatus] = sourceCol;
    if (sourceStatus !== destStatus) {
      newTasks[destStatus] = destCol;
    }
    setTasks(newTasks);

    // Persist
    try {
      await service.updateTask(taskId, { status: destStatus, position: newPosition });
    } catch {
      fetchTasks();
    }
  }, [setTasks, service, fetchTasks]);

  return { createTask, updateTask, deleteTask, markTaskRead, moveTask };
}
