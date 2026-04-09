import React, { createContext, useContext, useMemo } from 'react';
import type { ApiClient, TaskBoardUser, Project, ColumnConfig, PriorityConfig, TagConfig, Task } from '../types';
import { TaskBoardService, createTaskBoardService } from '../services/taskBoardService';
import { DEFAULT_COLUMNS, DEFAULT_PRIORITIES, PREDEFINED_TAGS } from '../utils/constants';

export interface TaskBoardConfig {
  /** Axios-like API client with auth headers pre-configured */
  apiClient: ApiClient;
  /** Current logged-in user */
  user: TaskBoardUser;
  /** Available projects (if not provided, derived from user.apps) */
  projects?: Project[];
  /** Column configuration (defaults to 8-column kanban) */
  columns?: ColumnConfig[];
  /** Priority levels (defaults to Critical/High/Medium/Low) */
  priorities?: PriorityConfig[];
  /** Predefined tags (defaults to 6 built-in tags) */
  tags?: TagConfig[];
  /** Base API path (defaults to '/api/v1/taskboard') */
  apiBasePath?: string;

  /** Callbacks */
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onError?: (error: Error) => void;
  onNavigate?: (path: string) => void;

  /** Feature flags */
  features?: {
    dragAndDrop?: boolean;
    comments?: boolean;
    mentions?: boolean;
    notifications?: boolean;
    internalComments?: boolean;
    tags?: boolean;
    sharing?: boolean;
    filters?: boolean;
    unreadIndicators?: boolean;
  };
}

export interface TaskBoardContextValue {
  service: TaskBoardService;
  user: TaskBoardUser;
  projects: Project[];
  columns: ColumnConfig[];
  priorities: PriorityConfig[];
  tags: TagConfig[];
  config: TaskBoardConfig;
  features: Required<NonNullable<TaskBoardConfig['features']>>;
}

const TaskBoardContext = createContext<TaskBoardContextValue | null>(null);

export function useTaskBoardContext(): TaskBoardContextValue {
  const ctx = useContext(TaskBoardContext);
  if (!ctx) {
    throw new Error('useTaskBoardContext must be used within a <TaskBoardProvider>');
  }
  return ctx;
}

export function TaskBoardProvider({
  children,
  ...config
}: TaskBoardConfig & { children: React.ReactNode }) {
  const service = useMemo(
    () => createTaskBoardService(config.apiClient, config.apiBasePath),
    [config.apiClient, config.apiBasePath]
  );

  const features = useMemo(
    () => ({
      dragAndDrop: config.features?.dragAndDrop ?? true,
      comments: config.features?.comments ?? true,
      mentions: config.features?.mentions ?? true,
      notifications: config.features?.notifications ?? true,
      internalComments: config.features?.internalComments ?? true,
      tags: config.features?.tags ?? true,
      sharing: config.features?.sharing ?? true,
      filters: config.features?.filters ?? true,
      unreadIndicators: config.features?.unreadIndicators ?? true,
    }),
    [config.features]
  );

  const value = useMemo<TaskBoardContextValue>(
    () => ({
      service,
      user: config.user,
      projects: config.projects ?? [],
      columns: config.columns ?? DEFAULT_COLUMNS,
      priorities: config.priorities ?? DEFAULT_PRIORITIES,
      tags: config.tags ?? PREDEFINED_TAGS,
      config,
      features,
    }),
    [service, config, features]
  );

  return (
    <TaskBoardContext.Provider value={value}>
      {children}
    </TaskBoardContext.Provider>
  );
}
