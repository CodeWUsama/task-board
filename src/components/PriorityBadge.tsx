import React from 'react';
import { getPriorityStyle } from '../utils/helpers';

export interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const style = getPriorityStyle(priority);
  const sizeClass = size === 'sm'
    ? 'px-1.5 py-0.5 text-[9px]'
    : 'px-2.5 py-1 text-[10px]';

  return (
    <span className={`inline-flex items-center font-semibold uppercase tracking-wide rounded border ${style.className} ${sizeClass}`}>
      {style.label}
    </span>
  );
}
