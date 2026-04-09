// ─── Core Data Types ───

export interface Project {
  slug: string;
  name: string;
}

export interface StructuredDescription {
  problem: string;
  user_story: string;
  proposed_behavior: string;
  acceptance_criteria: string;
  questions_for_gibson: string;
}

export interface Task {
  id: string;
  project_slug: string;
  title: string;
  description: StructuredDescription;
  status: string;
  priority: string;
  position: number;
  created_by: string;
  created_by_name: string;
  comment_count: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  has_unread?: boolean;
}

export interface ActivityEntry {
  id: string;
  type: string;
  from_status: string;
  to_status: string;
  user: string;
  user_name: string;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  author_id: string;
  author_name: string;
  is_internal?: boolean;
  edited?: boolean;
  edited_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  context: string;
  actor_name: string;
  actor_username: string;
  task_id: string;
  task_title: string;
  project_slug: string;
  snippet: string;
  read: boolean;
  created_at: string;
}

export interface MentionUser {
  username: string;
  name: string;
  email: string;
}

// ─── Board State Types ───

export type TasksByStatus = Record<string, Task[]>;
export type ColumnTotals = Record<string, number>;
export type ColumnUnreads = Record<string, number>;

// ─── Configuration Types ───

export interface ColumnConfig {
  key: string;
  label: string;
  color: string;
  description: string;
}

export interface PriorityConfig {
  value: string;
  label: string;
  className: string;
}

export interface TagConfig {
  value: string;
  label: string;
  className: string;
}

export interface DescriptionSectionConfig {
  key: keyof StructuredDescription;
  label: string;
}

// ─── User Type (injected by consuming app) ───

export interface TaskBoardUser {
  username: string;
  name: string;
  email: string;
  apps: string[];
  role?: string;
  is_reviewer?: boolean;
  is_internal?: boolean;
}

// ─── API Client Interface ───

export interface ApiClientConfig {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  [key: string]: unknown;
}

export interface ApiClient {
  get: <T>(url: string, config?: ApiClientConfig) => Promise<{ data: T }>;
  post: <T>(url: string, data?: unknown, config?: ApiClientConfig) => Promise<{ data: T }>;
  put: <T>(url: string, data?: unknown, config?: ApiClientConfig) => Promise<{ data: T }>;
  patch: <T>(url: string, data?: unknown, config?: ApiClientConfig) => Promise<{ data: T }>;
  delete: <T>(url: string, config?: ApiClientConfig) => Promise<{ data: T }>;
}

// ─── API Response Types ───

export interface ColumnResponse {
  tasks: Task[];
  total: number;
  unread: number;
}

export interface TaskDetailResponse extends Task {
  comments: Comment[];
  activity: ActivityEntry[];
}

export interface NotificationCountResponse {
  count: number;
}

// ─── Create / Update Payloads ───

export interface CreateTaskPayload {
  project_slug: string;
  title: string;
  description?: StructuredDescription;
  priority: string;
  status: string;
  tags: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: StructuredDescription;
  priority?: string;
  status?: string;
  position?: number;
  tags?: string[];
}

export interface CreateCommentPayload {
  content: string;
  is_internal?: boolean;
}

export interface EditCommentPayload {
  content: string;
}
