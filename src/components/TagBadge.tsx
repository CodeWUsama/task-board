import React from 'react';
import { getTagStyle } from '../utils/helpers';
import { XIcon } from '../icons';

export interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, onRemove, size = 'sm' }: TagBadgeProps) {
  const style = getTagStyle(tag);
  const sizeClass = size === 'sm'
    ? 'px-1.5 py-px text-[8px]'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded border ${style.className} ${sizeClass}`}>
      {style.label}
      {onRemove && (
        <button onClick={onRemove} className="opacity-50 hover:opacity-100 transition-opacity">
          <XIcon size={size === 'sm' ? 10 : 12} />
        </button>
      )}
    </span>
  );
}
