import type { ColumnConfig, PriorityConfig, TagConfig, DescriptionSectionConfig, StructuredDescription } from '../types';

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "backlog", label: "Backlog", color: "bg-neutral-400", description: "Tasks not yet scheduled" },
  { key: "blocked", label: "Blocked", color: "bg-red-500", description: "Waiting on a dependency" },
  { key: "queued", label: "Queued", color: "bg-blue-500", description: "Scheduled for this sprint" },
  { key: "in_progress", label: "In Progress", color: "bg-amber-500", description: "Actively being worked on" },
  { key: "in_testing", label: "In Testing", color: "bg-teal-500", description: "Under QA and validation" },
  { key: "gibson_review", label: "Gibson Review", color: "bg-purple-500", description: "Live & ready for Gibson review" },
  { key: "changes_requested", label: "Changes Requested", color: "bg-orange-500", description: "Revisions needed from review" },
  { key: "approved", label: "Approved", color: "bg-green-500", description: "Signed off and complete" },
];

export const DEFAULT_PRIORITIES: PriorityConfig[] = [
  { value: "urgent", label: "Critical", className: "bg-red-50 text-red-600 border-red-200" },
  { value: "high", label: "High", className: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "medium", label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "low", label: "Low", className: "bg-neutral-100 text-neutral-500 border-neutral-200" },
];

export const PREDEFINED_TAGS: TagConfig[] = [
  { value: "traceability", label: "Traceability", className: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "info-architecture", label: "Info Architecture", className: "bg-purple-50 text-purple-600 border-purple-200" },
  { value: "ui-ux", label: "UI/UX", className: "bg-pink-50 text-pink-600 border-pink-200" },
  { value: "workflow-logic", label: "Workflow Logic", className: "bg-teal-50 text-teal-600 border-teal-200" },
  { value: "legal-reasoning", label: "Legal Reasoning", className: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "bug-fix", label: "Bug Fix", className: "bg-red-50 text-red-600 border-red-200" },
];

export const DESCRIPTION_SECTIONS: DescriptionSectionConfig[] = [
  { key: "problem", label: "Problem" },
  { key: "user_story", label: "User Story" },
  { key: "proposed_behavior", label: "Proposed Behavior" },
  { key: "acceptance_criteria", label: "Acceptance Criteria" },
  { key: "questions_for_gibson", label: "Questions for Gibson" },
];

export const EMPTY_DESCRIPTION: StructuredDescription = {
  problem: "",
  user_story: "",
  proposed_behavior: "",
  acceptance_criteria: "",
  questions_for_gibson: "",
};

export const POSITION_GAP = 1000;
export const DEFAULT_PAGE_SIZE = 10;
export const NOTIFICATION_POLL_INTERVAL = 30000;
