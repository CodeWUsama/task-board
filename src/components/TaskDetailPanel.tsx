import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Task, Comment, ActivityEntry, StructuredDescription } from '../types';
import { useTaskBoardContext } from '../context/TaskBoardProvider';
import { useTaskDetail } from '../hooks/useTaskDetail';
import { EMPTY_DESCRIPTION, DESCRIPTION_SECTIONS } from '../utils/constants';
import { getPriorityStyle, formatDateTime, getInitials, getTagStyle, hasDescription } from '../utils/helpers';
import { useShareLink } from '../hooks/useShareLink';
import { MentionText } from './MentionText';
import { MentionTextarea } from './MentionTextarea';
import { SkeletonPulse } from './SkeletonPulse';
import { TagBadge } from './TagBadge';
import {
  XIcon, ChevronDownIcon, CheckIcon, PlusIcon,
  PencilIcon, TrashIcon, LinkIcon, LockIcon, MessageSquareIcon,
} from '../icons';

export interface TaskDetailPanelProps {
  task: Task;
  projectSlug: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskDetailPanel({ task, projectSlug, onClose, onUpdate }: TaskDetailPanelProps) {
  const { columns, priorities, tags: predefinedTags, service, config, user, features } = useTaskBoardContext();
  const detail = useTaskDetail(task.id);
  const { copiedTaskId, copyShareLink } = useShareLink();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState<StructuredDescription>(task.description || EMPTY_DESCRIPTION);
  const [priority, setPriority] = useState(task.priority);
  const [taskStatus, setTaskStatus] = useState(task.status);
  const [localTags, setLocalTags] = useState<string[]>(task.tags || []);
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showOtherTagInput, setShowOtherTagInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const hasUnsavedChanges = editing && (title !== task.title || JSON.stringify(description) !== JSON.stringify(task.description));

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [detail.comments]);

  const saveField = async (field: string, value: unknown) => {
    setSaving(true);
    try {
      await detail.saveField(field, value);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (title.trim() && title !== task.title) updates.title = title.trim();
      if (JSON.stringify(description) !== JSON.stringify(task.description)) updates.description = description;
      if (Object.keys(updates).length > 0) {
        await service.updateTask(task.id, updates as Parameters<typeof service.updateTask>[1]);
        onUpdate();
      }
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      setEditing(false);
    }
  };

  const handleDiscardChanges = () => {
    setTitle(task.title);
    setDescription(task.description || EMPTY_DESCRIPTION);
    setEditing(false);
    setShowDiscardConfirm(false);
  };

  const handleClosePanel = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await service.deleteTask(task.id);
      config.onTaskDelete?.(task.id);
      onUpdate();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = (p: string) => {
    setPriority(p);
    setShowPriorityDropdown(false);
    saveField('priority', p);
  };

  const handleStatusChange = (s: string) => {
    setTaskStatus(s);
    setShowStatusDropdown(false);
    saveField('status', s);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await detail.addComment(newComment.trim(), isInternalComment);
    setNewComment('');
    setIsInternalComment(false);
    onUpdate();
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await detail.deleteComment(commentToDelete);
      setCommentToDelete(null);
      onUpdate();
    } catch (err: unknown) {
      setCommentToDelete(null);
    }
  };

  const startEditingComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingCommentContent(c.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const saveEditedComment = async () => {
    if (!editingCommentId || !editingCommentContent.trim()) return;
    try {
      await detail.editComment(editingCommentId, editingCommentContent.trim());
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch {
      // error surfaced by hook
    }
  };

  const statusCol = columns.find((c) => c.key === taskStatus);
  const priorityStyle = getPriorityStyle(priority);
  const initials = getInitials(task.created_by_name || '?');
  const linkCopied = copiedTaskId === task.id;

  const handleShareFromDetail = () => {
    copyShareLink(task.id, projectSlug);
  };

  // Merge comments and activity into timeline
  const timeline = [
    ...detail.comments.map((c) => ({ kind: 'comment' as const, date: c.created_at, data: c })),
    ...detail.activity.map((a) => ({ kind: 'activity' as const, date: a.created_at, data: a })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-end bg-black/30 backdrop-blur-md eb-tb-animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClosePanel()}
    >
      <div
        className="bg-white shadow-2xl border-l border-neutral-200 w-full lg:w-[75vw] h-full flex flex-col"
        style={{ animation: 'eb-tb-slide-in-right 0.15s ease-out' }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 border-b border-neutral-100 shrink-0">
          <h2 className="flex-1 text-base sm:text-lg font-semibold text-neutral-900 truncate min-w-0">
            {title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {saving && <span className="text-[11px] text-neutral-400 mr-1">Saving...</span>}
            {editing ? (
              <>
                <button onClick={handleCancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors">
                  <XIcon size={13} /> Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-lg transition-colors disabled:opacity-60">
                  <CheckIcon size={13} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                {features.sharing && (
                  <button onClick={handleShareFromDetail} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
                    {linkCopied ? <><CheckIcon size={13} /> Copied!</> : <><LinkIcon size={13} /> Share</>}
                  </button>
                )}
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <PencilIcon size={13} /> Edit
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <TrashIcon size={13} /> Delete
                </button>
              </>
            )}
            <button onClick={handleClosePanel} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors ml-1">
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left: Task content */}
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="max-w-2xl px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
              {/* Title edit */}
              {editing && (
                <div className="mb-6">
                  <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-2 block">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-lg font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF5E00]/10 focus:border-[#FF5E00]/50 leading-tight"
                    placeholder="Task title"
                    autoFocus
                  />
                </div>
              )}

              {/* Properties grid */}
              <div className={`${editing ? 'mt-0' : 'mt-2'} rounded-lg border border-neutral-100 grid grid-cols-1 sm:grid-cols-2`}>
                {/* Task ID | Creator */}
                <div className="flex items-center h-10 px-4 border-b sm:border-r border-neutral-100">
                  <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Task ID</span>
                  <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                    T-{task.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center h-10 px-4 border-b border-neutral-100">
                  <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Creator</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#FF5E00] flex items-center justify-center">
                      <span className="text-[8px] font-medium text-white leading-none">{initials}</span>
                    </div>
                    <span className="text-xs text-neutral-700">{task.created_by_name || task.created_by}</span>
                  </div>
                </div>

                {/* Created | Updated */}
                <div className="flex items-center h-10 px-4 border-b sm:border-r border-neutral-100">
                  <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Created</span>
                  <span className="text-xs text-neutral-600">{formatDateTime(task.created_at)}</span>
                </div>
                <div className="flex items-center h-10 px-4 border-b border-neutral-100">
                  <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Updated</span>
                  <span className="text-xs text-neutral-600">{task.updated_at ? formatDateTime(task.updated_at) : '—'}</span>
                </div>

                {/* Status | Priority */}
                <div className="flex items-center h-10 px-4 border-b sm:border-r border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                  <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Status</span>
                  <div className="relative">
                    <button
                      onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowPriorityDropdown(false); setShowTagDropdown(false); }}
                      className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md hover:bg-neutral-100 transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${statusCol?.color ?? 'bg-neutral-400'}`} />
                      {statusCol?.label ?? taskStatus}
                      <ChevronDownIcon size={12} className="text-neutral-400" />
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute top-full mt-1 left-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 py-1 w-52 eb-tb-animate-zoom-in">
                        {columns.map((col) => (
                          <button key={col.key} onClick={() => handleStatusChange(col.key)} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 flex items-center gap-2 ${taskStatus === col.key ? 'font-medium bg-neutral-50' : ''}`}>
                            <span className={`w-2 h-2 rounded-full ${col.color}`} /> {col.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center h-10 px-4 border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                  <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Priority</span>
                  <div className="relative">
                    <button
                      onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowStatusDropdown(false); setShowTagDropdown(false); }}
                      className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md transition-colors border ${priorityStyle.className}`}
                    >
                      {priorityStyle.label}
                      <ChevronDownIcon size={12} className="opacity-50" />
                    </button>
                    {showPriorityDropdown && (
                      <div className="absolute top-full mt-1 left-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 py-1 w-40 eb-tb-animate-zoom-in">
                        {priorities.map((p) => (
                          <button key={p.value} onClick={() => handlePriorityChange(p.value)} className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 flex items-center gap-2 ${priority === p.value ? 'bg-neutral-50' : ''}`}>
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${p.className}`}>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags — full width */}
                {features.tags && (
                  <div className="flex items-center min-h-[40px] px-4 border-b border-neutral-100 sm:col-span-2 hover:bg-neutral-50/50 transition-colors">
                    <span className="w-14 text-[11px] text-neutral-400 font-medium shrink-0">Tags</span>
                    <div className="relative flex-1 flex items-center gap-1.5 flex-wrap py-1.5">
                      {localTags.map((tag) => (
                        <TagBadge key={tag} tag={tag} size="sm" onRemove={() => {
                          const newTags = localTags.filter((t) => t !== tag);
                          setLocalTags(newTags);
                          saveField('tags', newTags);
                        }} />
                      ))}
                      <button
                        onClick={() => {
                          if (!showTagDropdown) setPendingTags([...localTags]);
                          setShowTagDropdown(!showTagDropdown);
                          setShowStatusDropdown(false);
                          setShowPriorityDropdown(false);
                        }}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-neutral-600 rounded border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors"
                      >
                        <PlusIcon size={12} /> {showTagDropdown ? 'Close' : 'Edit'}
                      </button>
                      {showTagDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 w-56 eb-tb-animate-zoom-in">
                          <div className="py-1">
                            {predefinedTags.map((tag) => {
                              const isSelected = pendingTags.includes(tag.value);
                              return (
                                <button key={tag.value} onClick={() => setPendingTags((prev) => isSelected ? prev.filter((t) => t !== tag.value) : [...prev, tag.value])}
                                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 flex items-center justify-between ${isSelected ? 'bg-neutral-50' : ''}`}>
                                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${tag.className}`}>{tag.label}</span>
                                  {isSelected && <CheckIcon size={12} strokeWidth={2.5} className="text-[#FF5E00]" />}
                                </button>
                              );
                            })}
                            {!showOtherTagInput ? (
                              <button onClick={() => setShowOtherTagInput(true)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 flex items-center justify-between">
                                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border bg-neutral-100 text-neutral-500 border-neutral-200">Other</span>
                              </button>
                            ) : (
                              <div className="px-3 py-2 bg-neutral-50/50">
                                <div className="flex gap-1.5">
                                  <input type="text" autoFocus onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim().toLowerCase().replace(/\s+/g, '-'); if (val && !pendingTags.includes(val)) setPendingTags((prev) => [...prev, val]); e.currentTarget.value = ''; setShowOtherTagInput(false); }
                                    if (e.key === 'Escape') setShowOtherTagInput(false);
                                  }} className="flex-1 px-2 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF5E00]/20 focus:border-[#FF5E00]/50" placeholder="Type a custom tag..." onClick={(e) => e.stopPropagation()} />
                                  <button type="button" onClick={() => setShowOtherTagInput(false)} className="px-2.5 py-1.5 text-[10px] font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-md transition-colors">Add</button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-neutral-100 px-2 py-2 flex items-center justify-end gap-2">
                            <button onClick={() => { setPendingTags([...localTags]); setShowTagDropdown(false); setShowOtherTagInput(false); }} className="px-2.5 py-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors">Cancel</button>
                            <button onClick={() => { setLocalTags([...pendingTags]); saveField('tags', pendingTags); setShowTagDropdown(false); setShowOtherTagInput(false); }} className="px-3 py-1 text-[11px] font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded transition-colors">Save</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description Sections */}
              <div className="mt-5 space-y-4">
                {DESCRIPTION_SECTIONS.map((section) => {
                  const val = description[section.key] || '';
                  const hasContent = val.trim().length > 0;
                  if (!editing && !hasContent) return null;
                  return (
                    <div key={section.key}>
                      <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-1.5 block">{section.label}</label>
                      {editing ? (
                        <MentionTextarea
                          value={val}
                          onChange={(v) => setDescription((prev) => ({ ...prev, [section.key]: v }))}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/10 focus:border-[#FF5E00]/50 resize-y transition-all placeholder:text-neutral-400"
                          placeholder={`Add ${section.label.toLowerCase()}...`}
                        />
                      ) : (
                        <div className="w-full px-3.5 py-2.5 bg-neutral-50/60 border border-neutral-100 rounded-lg text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">
                          <MentionText text={val} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {!editing && !hasDescription(description) && (
                  <div className="px-3.5 py-4 bg-neutral-50/60 border border-neutral-100 rounded-lg text-sm text-neutral-400 text-center">
                    No description provided.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Activity panel */}
          {features.comments && (
            <div className="w-full md:w-[380px] shrink-0 border-t md:border-t-0 md:border-l border-neutral-100 flex flex-col bg-[#FAFAFA]">
              <div className="px-5 h-12 flex items-center border-b border-neutral-100">
                <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                  Activity{detail.commentsLoaded ? ` · ${detail.comments.length + detail.activity.length}` : ''}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {!detail.commentsLoaded && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2.5">
                        <SkeletonPulse className="w-7 h-7 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <SkeletonPulse className="h-3 w-20" />
                          <SkeletonPulse className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {detail.commentsLoaded && detail.comments.length === 0 && detail.activity.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                      <MessageSquareIcon size={20} className="text-neutral-400" />
                    </div>
                    <p className="text-xs text-neutral-400">No activity yet</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Comments and status changes will appear here</p>
                  </div>
                )}

                <div className="space-y-4">
                  {timeline.map((item, i) => {
                    if (item.kind === 'comment') {
                      const c = item.data as Comment;
                      const isOwner = user.username === c.author_id;
                      const isEditing = editingCommentId === c.id;
                      return (
                        <div key={`c-${c.id}`} className={`group/comment flex gap-2.5 ${c.is_internal ? 'pl-2 border-l-2 border-amber-300' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${c.is_internal ? 'bg-amber-100' : 'bg-neutral-200'}`}>
                            <span className={`text-[10px] font-medium ${c.is_internal ? 'text-amber-600' : 'text-neutral-600'}`}>
                              {getInitials(c.author_name || '?')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-semibold text-neutral-700">{c.author_name}</span>
                              {c.is_internal && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-px text-[9px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded">
                                  <LockIcon size={8} strokeWidth={2.5} /> Internal
                                </span>
                              )}
                              <span className="text-[10px] text-neutral-400">{formatDateTime(c.created_at)}</span>
                              {c.edited && (
                                <span className="text-[9px] text-neutral-400 italic" title={c.edited_at ? `Edited ${formatDateTime(c.edited_at)}` : 'Edited'}>(edited)</span>
                              )}
                              {isOwner && (
                                <div className={`ml-auto flex items-center gap-0.5 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover/comment:opacity-100'}`}>
                                  {isEditing ? (
                                    <>
                                      <button onClick={saveEditedComment} disabled={!editingCommentContent.trim() || editingCommentContent.trim() === c.content} className="p-1 rounded hover:bg-green-50 text-neutral-400 hover:text-green-600 disabled:opacity-30" title="Save edit"><CheckIcon size={12} strokeWidth={2.5} /></button>
                                      <button onClick={cancelEditingComment} className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500" title="Cancel edit"><XIcon size={12} strokeWidth={2.5} /></button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => startEditingComment(c)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600" title="Edit comment"><PencilIcon size={11} /></button>
                                      <button onClick={() => setCommentToDelete(c.id)} className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500" title="Delete comment"><TrashIcon size={11} /></button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            {isEditing ? (
                              <MentionTextarea
                                value={editingCommentContent}
                                onChange={setEditingCommentContent}
                                onKeyDown={(e) => { if (e.key === 'Escape') cancelEditingComment(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEditedComment(); } }}
                                rows={2}
                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/20 focus:border-[#FF5E00]/50 resize-none"
                              />
                            ) : (
                              <div className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed"><MentionText text={c.content} /></div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      const a = item.data as ActivityEntry;
                      const fromCol = columns.find((col) => col.key === a.from_status);
                      const toCol = columns.find((col) => col.key === a.to_status);
                      const isCreated = a.type === 'created';
                      return (
                        <div key={`a-${a.id}`} className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                            {isCreated ? <PlusIcon size={12} className="text-neutral-400" /> : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isCreated ? (
                              <p className="text-[11px] text-neutral-500"><span className="font-medium text-neutral-700">{a.user_name}</span>{' created this task'}</p>
                            ) : (
                              <p className="text-[11px] text-neutral-500">
                                <span className="font-medium text-neutral-700">{a.user_name}</span>{' moved from '}
                                <span className="font-medium text-neutral-700">{fromCol?.label ?? a.from_status}</span>{' to '}
                                <span className="font-medium text-neutral-700">{toCol?.label ?? a.to_status}</span>
                              </p>
                            )}
                            <span className="text-[10px] text-neutral-400">{formatDateTime(a.created_at)}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                  <div ref={commentsEndRef} />
                </div>
              </div>

              {/* Comment input */}
              <div className={`px-5 py-4 pb-5 border-t bg-white transition-colors ${isInternalComment ? 'border-amber-300 bg-amber-50/30' : 'border-neutral-200'}`}>
                <MentionTextarea
                  value={newComment}
                  onChange={setNewComment}
                  onKeyDown={handleCommentKeyDown}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 resize-none transition-colors placeholder:text-neutral-400 ${
                    isInternalComment
                      ? 'bg-amber-50/50 border-amber-200 focus:ring-amber-200/30 focus:border-amber-300'
                      : 'bg-neutral-50 border-neutral-200 focus:bg-white focus:ring-[#FF5E00]/10 focus:border-[#FF5E00]/50'
                  }`}
                  placeholder={isInternalComment ? 'Write an internal note... (only visible to team)' : 'Write a comment... (type @ to mention someone)'}
                />
                <div className="flex items-center justify-between mt-2.5">
                  {features.internalComments && user.is_internal ? (
                    <button
                      type="button"
                      onClick={() => setIsInternalComment(!isInternalComment)}
                      className={`flex items-center gap-1.5 text-[11px] font-medium rounded-md px-2 py-1 transition-colors ${
                        isInternalComment ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <LockIcon size={12} /> Internal
                    </button>
                  ) : <div />}
                  <button
                    onClick={handleAddComment}
                    disabled={detail.commentLoading || !newComment.trim()}
                    className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-40 ${
                      isInternalComment ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#FF5E00] hover:bg-[#E05200]'
                    }`}
                  >
                    {detail.commentLoading ? 'Sending...' : isInternalComment ? 'Add Note' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 eb-tb-animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm mx-4 eb-tb-animate-zoom-in">
            <div className="p-5 space-y-4">
              <h2 className="text-lg font-medium text-neutral-900">Delete Task</h2>
              <p className="text-sm text-neutral-500">Are you sure you want to delete <span className="font-medium text-neutral-900">{task.title}</span>? This cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-lg transition-colors disabled:opacity-60">{saving ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {commentToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 eb-tb-animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm mx-4 eb-tb-animate-zoom-in">
            <div className="p-5 space-y-4">
              <h2 className="text-lg font-medium text-neutral-900">Delete Comment</h2>
              <p className="text-sm text-neutral-500">Are you sure you want to delete this comment? This cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setCommentToDelete(null)} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                <button onClick={handleDeleteComment} className="px-5 py-2 text-sm font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 eb-tb-animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm mx-4 eb-tb-animate-zoom-in">
            <div className="p-5 space-y-4">
              <h2 className="text-lg font-medium text-neutral-900">Unsaved Changes</h2>
              <p className="text-sm text-neutral-500">You have unsaved changes that will be lost. Are you sure you want to discard them?</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowDiscardConfirm(false)} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Keep Editing</button>
                <button onClick={() => { handleDiscardChanges(); onClose(); }} className="px-5 py-2 text-sm font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-lg transition-colors">Discard</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
