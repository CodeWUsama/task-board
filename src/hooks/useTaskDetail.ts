import { useState, useEffect, useCallback } from 'react';
import type { Comment, ActivityEntry, TaskDetailResponse, UpdateTaskPayload } from '../types';
import { useTaskBoardContext } from '../context/TaskBoardProvider';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

function getErrorMessage(err: unknown): string {
  const apiErr = err as ApiError;
  return apiErr?.response?.data?.detail || apiErr?.message || 'An error occurred';
}

export function useTaskDetail(taskId: string) {
  const { service, config } = useTaskBoardContext();

  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await service.getTask(taskId);
      setComments(data.comments || []);
      setActivity(data.activity || []);
    } catch {
      try {
        const comments = await service.listComments(taskId);
        setComments(comments);
      } catch { /* silent */ }
    } finally {
      setCommentsLoaded(true);
    }
  }, [taskId, service]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const addComment = async (content: string, isInternal: boolean = false) => {
    setCommentLoading(true);
    try {
      await service.addComment(taskId, { content, is_internal: isInternal });
      await fetchDetail();
    } catch (err) {
      const message = getErrorMessage(err);
      config.onError?.(err instanceof Error ? err : new Error(message));
    } finally { setCommentLoading(false); }
  };

  const editComment = async (commentId: string, content: string) => {
    try {
      await service.editComment(taskId, commentId, { content });
      await fetchDetail();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      throw new Error(msg);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await service.deleteComment(taskId, commentId);
      await fetchDetail();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      throw new Error(msg);
    }
  };

  const saveField = async (field: string, value: unknown) => {
    await service.updateTask(taskId, { [field]: value } as UpdateTaskPayload);
  };

  return {
    comments,
    activity,
    commentsLoaded,
    commentLoading,
    addComment,
    editComment,
    deleteComment,
    saveField,
    refreshDetail: fetchDetail,
  };
}
