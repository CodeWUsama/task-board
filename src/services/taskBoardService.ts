import type {
  ApiClient,
  Task,
  TaskDetailResponse,
  ColumnResponse,
  Notification,
  NotificationCountResponse,
  MentionUser,
  Comment,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateCommentPayload,
  EditCommentPayload,
} from '../types';

export interface TaskBoardService {
  // ─── Tasks ───
  listTasks(projectSlug: string, perColumn?: number): Promise<Record<string, ColumnResponse>>;
  listColumnTasks(projectSlug: string, statusKey: string, offset: number, limit: number): Promise<Task[]>;
  getTask(taskId: string): Promise<TaskDetailResponse>;
  createTask(data: CreateTaskPayload): Promise<Task>;
  updateTask(taskId: string, data: UpdateTaskPayload): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  markTaskRead(taskId: string): Promise<void>;

  // ─── Comments ───
  listComments(taskId: string): Promise<Comment[]>;
  addComment(taskId: string, data: CreateCommentPayload): Promise<Comment>;
  editComment(taskId: string, commentId: string, data: EditCommentPayload): Promise<Comment>;
  deleteComment(taskId: string, commentId: string): Promise<void>;

  // ─── Mentions ───
  searchMentionUsers(query: string): Promise<MentionUser[]>;

  // ─── Notifications ───
  getNotificationCount(): Promise<number>;
  listNotifications(limit?: number): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
}

export function createTaskBoardService(
  apiClient: ApiClient,
  basePath: string = '/api/v1/taskboard'
): TaskBoardService {
  return {
    // ─── Tasks ───

    async listTasks(projectSlug, perColumn = 10) {
      const { data } = await apiClient.get<Record<string, ColumnResponse>>(
        `${basePath}/tasks?project_slug=${encodeURIComponent(projectSlug)}&per_column=${perColumn}`
      );
      return data;
    },

    async listColumnTasks(projectSlug, statusKey, offset, limit) {
      const { data } = await apiClient.get<Task[]>(
        `${basePath}/tasks/column?project_slug=${encodeURIComponent(projectSlug)}&status_key=${encodeURIComponent(statusKey)}&offset=${offset}&limit=${limit}`
      );
      return data;
    },

    async getTask(taskId) {
      const { data } = await apiClient.get<TaskDetailResponse>(`${basePath}/tasks/${taskId}`);
      return data;
    },

    async createTask(payload) {
      const { data } = await apiClient.post<Task>(`${basePath}/tasks`, payload);
      return data;
    },

    async updateTask(taskId, payload) {
      const { data } = await apiClient.patch<Task>(`${basePath}/tasks/${taskId}`, payload);
      return data;
    },

    async deleteTask(taskId) {
      await apiClient.delete(`${basePath}/tasks/${taskId}`);
    },

    async markTaskRead(taskId) {
      await apiClient.post(`${basePath}/tasks/${taskId}/read`);
    },

    // ─── Comments ───

    async listComments(taskId) {
      const { data } = await apiClient.get<Comment[]>(`${basePath}/tasks/${taskId}/comments`);
      return data;
    },

    async addComment(taskId, payload) {
      const { data } = await apiClient.post<Comment>(`${basePath}/tasks/${taskId}/comments`, payload);
      return data;
    },

    async editComment(taskId, commentId, payload) {
      const { data } = await apiClient.patch<Comment>(
        `${basePath}/tasks/${taskId}/comments/${commentId}`,
        payload
      );
      return data;
    },

    async deleteComment(taskId, commentId) {
      await apiClient.delete(`${basePath}/tasks/${taskId}/comments/${commentId}`);
    },

    // ─── Mentions ───

    async searchMentionUsers(query) {
      const { data } = await apiClient.get<MentionUser[]>(
        `${basePath}/mentions/users?q=${encodeURIComponent(query)}`
      );
      return data;
    },

    // ─── Notifications ───

    async getNotificationCount() {
      const { data } = await apiClient.get<NotificationCountResponse>(
        `${basePath}/notifications/count`
      );
      return data.count;
    },

    async listNotifications(limit = 30) {
      const { data } = await apiClient.get<Notification[]>(
        `${basePath}/notifications?limit=${limit}`
      );
      return data;
    },

    async markNotificationRead(notificationId) {
      await apiClient.patch(`${basePath}/notifications/${notificationId}/read`);
    },

    async markAllNotificationsRead() {
      await apiClient.post(`${basePath}/notifications/read-all`);
    },
  };
}
