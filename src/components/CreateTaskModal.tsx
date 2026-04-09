import React, { useState } from 'react';
import type { StructuredDescription, TasksByStatus } from '../types';
import { useTaskBoardContext } from '../context/TaskBoardProvider';
import { EMPTY_DESCRIPTION, DESCRIPTION_SECTIONS } from '../utils/constants';
import { getPriorityStyle } from '../utils/helpers';
import { XIcon, ChevronDownIcon, CheckIcon } from '../icons';

export interface CreateTaskModalProps {
  projectSlug: string;
  defaultStatus?: string;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateTaskModal({
  projectSlug,
  defaultStatus = 'backlog',
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const { columns, priorities, tags: predefinedTags, service, config } = useTaskBoardContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<StructuredDescription>({ ...EMPTY_DESCRIPTION });
  const [priority, setPriority] = useState('medium');
  const [taskStatus, setTaskStatus] = useState(defaultStatus);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setCustomTag('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const task = await service.createTask({
        project_slug: projectSlug,
        title: title.trim(),
        description,
        priority,
        status: taskStatus,
        tags: selectedTags,
      });
      config.onTaskCreate?.(task);
      onCreate();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(apiErr?.response?.data?.detail || apiErr?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const priorityStyle = getPriorityStyle(priority);
  const statusCol = columns.find((c) => c.key === taskStatus);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm eb-tb-animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-[80vw] max-w-[1100px] h-[85vh] flex flex-col eb-tb-animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900">New Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left: Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 border-r border-neutral-100">
              <div className="max-w-2xl">
                {/* Title */}
                <div className="pb-4">
                  <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/10 focus:border-[#FF5E00]/50"
                    placeholder="What needs to be done?"
                    autoFocus
                  />
                </div>

                <div className="border-t border-neutral-100 pt-4 pb-1">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Description</span>
                </div>

                {/* Description Sections */}
                {DESCRIPTION_SECTIONS.map((section, idx) => (
                  <div key={section.key} className={`py-3 ${idx < DESCRIPTION_SECTIONS.length - 1 ? 'border-b border-dashed border-neutral-100' : ''}`}>
                    <label className="text-xs font-medium text-neutral-700 mb-1.5 block">
                      {section.label} <span className="text-neutral-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={description[section.key]}
                      onChange={(e) =>
                        setDescription((prev) => ({ ...prev, [section.key]: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/10 focus:border-[#FF5E00]/50 resize-y"
                      placeholder={`Add ${section.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Settings */}
            <div className="w-[340px] shrink-0 overflow-y-auto px-5 py-5 bg-neutral-50/30">
              {/* Column + Priority side by side */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Column */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Column</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusCol?.color ?? 'bg-neutral-400'}`} />
                        {statusCol?.label ?? taskStatus}
                      </div>
                      <ChevronDownIcon size={12} className="text-neutral-400" />
                    </button>
                    {showColumnDropdown && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 py-1 eb-tb-animate-zoom-in">
                        {columns.map((col) => (
                          <button
                            key={col.key}
                            type="button"
                            onClick={() => { setTaskStatus(col.key); setShowColumnDropdown(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-neutral-50 text-left ${
                              taskStatus === col.key ? 'font-medium bg-neutral-50' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${col.color}`} />
                            {col.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Priority</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${priorityStyle.className}`}
                    >
                      {priorityStyle.label}
                      <ChevronDownIcon size={12} className="opacity-50" />
                    </button>
                    {showPriorityDropdown && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 py-1 eb-tb-animate-zoom-in">
                        {priorities.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => { setPriority(p.value); setShowPriorityDropdown(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-neutral-50 text-left ${
                              priority === p.value ? 'bg-neutral-50' : ''
                            }`}
                          >
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${p.className}`}>
                              {p.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Tags</label>
                <div className="space-y-1">
                  {predefinedTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => toggleTag(tag.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'bg-[#FF5E00]/5 border-[#FF5E00]/30 text-neutral-800'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span className={`inline-flex items-center px-1.5 py-px text-[10px] font-medium rounded border ${tag.className}`}>
                          {tag.label}
                        </span>
                        {isSelected && <CheckIcon size={13} strokeWidth={2.5} className="text-[#FF5E00]" />}
                      </button>
                    );
                  })}
                </div>
                {/* Custom tag input */}
                <div className="mt-2.5 flex gap-1.5">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                    className="flex-1 px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/10 focus:border-[#FF5E00]/50 bg-white"
                    placeholder="Custom tag..."
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-lg transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                {selectedTags.filter((t) => !predefinedTags.some((p) => p.value === t)).length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {selectedTags
                      .filter((t) => !predefinedTags.some((p) => p.value === t))
                      .map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200 rounded"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            <XIcon size={12} />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-[#FF5E00] hover:bg-[#E05200] rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
