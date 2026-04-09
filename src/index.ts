// ─── Components ───
export { TaskBoard } from './components/TaskBoard';
export type { TaskBoardProps } from './components/TaskBoard';
export { TaskCard } from './components/TaskCard';
export type { TaskCardProps } from './components/TaskCard';
export { KanbanColumn } from './components/KanbanColumn';
export type { KanbanColumnProps } from './components/KanbanColumn';
export { FilterBar } from './components/FilterBar';
export type { FilterBarProps } from './components/FilterBar';
export { NotificationBell } from './components/NotificationBell';
export type { NotificationBellProps } from './components/NotificationBell';
export { PriorityBadge } from './components/PriorityBadge';
export type { PriorityBadgeProps } from './components/PriorityBadge';
export { UserAvatar } from './components/UserAvatar';
export type { UserAvatarProps } from './components/UserAvatar';
export { TagBadge } from './components/TagBadge';
export type { TagBadgeProps } from './components/TagBadge';
export { MentionText, toDisplayText, toStoredText } from './components/MentionText';
export { MentionTextarea } from './components/MentionTextarea';
export type { MentionTextareaProps } from './components/MentionTextarea';
export { SkeletonPulse, SkeletonCard, BoardSkeleton } from './components/SkeletonPulse';
export { CreateTaskModal } from './components/CreateTaskModal';
export type { CreateTaskModalProps } from './components/CreateTaskModal';
export { TaskDetailPanel } from './components/TaskDetailPanel';
export type { TaskDetailPanelProps } from './components/TaskDetailPanel';

// ─── Provider ───
export { TaskBoardProvider, useTaskBoardContext } from './context/TaskBoardProvider';
export type { TaskBoardConfig, TaskBoardContextValue } from './context/TaskBoardProvider';

// ─── Hooks ───
export { useTaskBoard } from './hooks/useTaskBoard';
export { useTaskActions } from './hooks/useTaskActions';
export { useTaskDetail } from './hooks/useTaskDetail';
export { useShareLink } from './hooks/useShareLink';

// ─── Types ───
export type {
  Project,
  StructuredDescription,
  Task,
  ActivityEntry,
  Comment,
  Notification,
  MentionUser,
  TasksByStatus,
  ColumnTotals,
  ColumnUnreads,
  ColumnConfig,
  PriorityConfig,
  TagConfig,
  DescriptionSectionConfig,
  TaskBoardUser,
  ApiClient,
  ColumnResponse,
  TaskDetailResponse,
  NotificationCountResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateCommentPayload,
  EditCommentPayload,
  ApiClientConfig,
} from './types';

// ─── Service ───
export { createTaskBoardService } from './services/taskBoardService';
export type { TaskBoardService } from './services/taskBoardService';

// ─── Utils ───
export {
  getPriorityStyle,
  getTagStyle,
  getInitials,
  formatDate,
  formatDateTime,
  getDescriptionPreview,
  hasDescription,
  getUserProjects,
} from './utils/helpers';

// ─── Constants ───
export {
  DEFAULT_COLUMNS,
  DEFAULT_PRIORITIES,
  PREDEFINED_TAGS,
  DESCRIPTION_SECTIONS,
  EMPTY_DESCRIPTION,
  POSITION_GAP,
  DEFAULT_PAGE_SIZE,
} from './utils/constants';

// ─── Icons ───
export {
  PlusIcon,
  XIcon,
  ChevronDownIcon,
  MessageSquareIcon,
  KanbanIcon,
  LinkIcon,
  CheckIcon,
  BellIcon,
  FilterIcon,
  PencilIcon,
  TrashIcon,
  LockIcon,
  FeedbackIcon,
} from './icons';
