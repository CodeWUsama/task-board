import type { StructuredDescription, PriorityConfig, TagConfig } from '../types';
import { DEFAULT_PRIORITIES, PREDEFINED_TAGS, DESCRIPTION_SECTIONS } from './constants';

export function getPriorityStyle(priority: string): PriorityConfig {
  return DEFAULT_PRIORITIES.find((p) => p.value === priority) ?? DEFAULT_PRIORITIES[2];
}

export function getTagStyle(tag: string): TagConfig {
  const predefined = PREDEFINED_TAGS.find((t) => t.value === tag);
  if (predefined) return predefined;
  const label = tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, " ");
  return { value: tag, label, className: "bg-neutral-100 text-neutral-500 border-neutral-200" };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) && !dateStr.endsWith("Z") && !dateStr.includes("+")) {
    return new Date(dateStr + "Z");
  }
  return d;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "";
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getDescriptionPreview(desc: StructuredDescription | string | undefined): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  for (const section of DESCRIPTION_SECTIONS) {
    if (desc[section.key]?.trim()) return desc[section.key].trim();
  }
  return "";
}

export function hasDescription(desc: StructuredDescription | string | undefined): boolean {
  if (!desc) return false;
  if (typeof desc === "string") return desc.trim().length > 0;
  return DESCRIPTION_SECTIONS.some((s) => desc[s.key]?.trim());
}

export function getUserProjects(
  apps: string[],
  allProjects: { slug: string; name: string }[]
): { slug: string; name: string }[] {
  if (apps.includes("all")) return allProjects;
  return allProjects.filter((p) => apps.includes(p.slug));
}
