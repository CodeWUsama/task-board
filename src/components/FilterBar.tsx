import React, { useState, useRef, useEffect } from 'react';
import type { Project, TagConfig } from '../types';
import { FilterIcon, XIcon, CheckIcon, ChevronDownIcon } from '../icons';
import { useTaskBoardContext } from '../context/TaskBoardProvider';

export interface FilterBarProps {
  projects: Project[];
  selectedProject: string;
  onSelectProject: (slug: string) => void;
  filterTags: string[];
  onSetFilterTags: (tags: string[]) => void;
}

export function FilterBar({
  projects,
  selectedProject,
  onSelectProject,
  filterTags,
  onSetFilterTags,
}: FilterBarProps) {
  const { tags: predefinedTags, features } = useTaskBoardContext();
  const [filterExpanded, setFilterExpanded] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterExpanded) return;
    function handleClick(e: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setFilterExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterExpanded]);

  const toggleTag = (value: string) => {
    onSetFilterTags(
      filterTags.includes(value)
        ? filterTags.filter((t) => t !== value)
        : [...filterTags, value]
    );
  };

  return (
    <div className="mb-4 shrink-0 flex items-start justify-between gap-3">
      {/* Project pills */}
      {projects.length > 1 && (
        <div className="flex gap-2 flex-nowrap overflow-x-auto eb-tb-no-scrollbar sm:flex-wrap sm:overflow-visible">
          {projects.map((project) => (
            <button
              key={project.slug}
              onClick={() => onSelectProject(project.slug)}
              className={`shrink-0 px-4 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                selectedProject === project.slug
                  ? "bg-[#FF5E00] text-white border-[#FF5E00]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      )}
      {projects.length === 1 && (
        <span className="text-sm font-medium text-neutral-600">{projects[0].name}</span>
      )}

      {/* Divider */}
      {features.filters && <div className="self-stretch w-px bg-neutral-200 shrink-0" />}

      {/* Filter button + dropdown */}
      {features.filters && (
        <div className="relative shrink-0" ref={filterDropdownRef}>
          <button
            onClick={() => setFilterExpanded(!filterExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              filterTags.length > 0
                ? "bg-[#FF5E00]/5 border-[#FF5E00]/30 text-[#FF5E00]"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            <FilterIcon size={14} />
            Filter
            {filterTags.length > 0 && (
              <span className="min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#FF5E00] text-white text-[9px] font-bold px-1">
                {filterTags.length}
              </span>
            )}
          </button>

          {filterExpanded && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 animate-in fade-in zoom-in-95 duration-75">
              <div className="px-3 py-2.5 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Filter by Tags</span>
                {filterTags.length > 0 && (
                  <button
                    onClick={() => onSetFilterTags([])}
                    className="text-[10px] font-medium text-[#FF5E00] hover:text-[#E05200] transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="py-1">
                {predefinedTags.map((tag) => {
                  const isActive = filterTags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-neutral-50 transition-colors ${
                        isActive ? "bg-neutral-50" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${tag.className}`}>
                        {tag.label}
                      </span>
                      {isActive && <CheckIcon size={13} strokeWidth={2.5} className="text-[#FF5E00]" />}
                    </button>
                  );
                })}
                {/* Other — matches custom tags */}
                <button
                  onClick={() => toggleTag("__other__")}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-neutral-50 transition-colors border-t border-neutral-100 ${
                    filterTags.includes("__other__") ? "bg-neutral-50" : ""
                  }`}
                >
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border bg-neutral-100 text-neutral-500 border-neutral-200">
                    Other
                  </span>
                  {filterTags.includes("__other__") && <CheckIcon size={13} strokeWidth={2.5} className="text-[#FF5E00]" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
