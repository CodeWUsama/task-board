import React, { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { TagBadge } from './TagBadge';
import { UserAvatar } from './UserAvatar';
import { MessageSquareIcon, LinkIcon, CheckIcon } from '../icons';
import { formatDate, getDescriptionPreview, hasDescription } from '../utils/helpers';

export interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
  onShare: (e: React.MouseEvent) => void;
  copied: boolean;
}

export const TaskCard = memo(function TaskCard({ task, index, onClick, onShare, copied }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`relative bg-white rounded-lg border p-3.5 cursor-pointer transition-all hover:shadow-md group/card ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-[#FF5E00]/20" : ""
          } border-neutral-200`}
        >
          {/* Title + priority */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              {task.has_unread && (
                <span className="relative group/unread mt-[5px] w-1.5 h-1.5 rounded-full bg-[#FF5E00] shrink-0 cursor-default">
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-1 text-[10px] font-medium text-white bg-neutral-800 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover/unread:opacity-100 transition-opacity duration-75">
                    New activity
                  </span>
                </span>
              )}
              <h4 className="text-[13px] font-medium text-neutral-900 leading-snug line-clamp-2">
                {task.title}
              </h4>
            </div>
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {task.tags.length > 3 && (
                <span className="text-[8px] text-neutral-400 px-1 py-px">+{task.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Description preview */}
          {hasDescription(task.description) && (
            <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
              {getDescriptionPreview(task.description)}
            </p>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-neutral-100">
            <span className="text-[10px] text-neutral-400">{formatDate(task.created_at)}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onShare}
                className="opacity-0 group-hover/card:opacity-100 transition-opacity p-0.5 rounded text-neutral-300 hover:text-neutral-500 cursor-pointer"
                title={copied ? "Link copied!" : "Copy link"}
              >
                {copied ? <CheckIcon size={12} /> : <LinkIcon size={12} />}
              </button>
              {task.comment_count > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                  <MessageSquareIcon size={12} />
                  {task.comment_count}
                </span>
              )}
              {task.created_by_name && (
                <UserAvatar name={task.created_by_name} size="xs" showTooltip />
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});
