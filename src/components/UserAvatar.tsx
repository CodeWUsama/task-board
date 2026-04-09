import React from 'react';
import { getInitials } from '../utils/helpers';

export interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

const SIZES = {
  xs: { container: 'w-5 h-5', text: 'text-[8px]' },
  sm: { container: 'w-6 h-6', text: 'text-[9px]' },
  md: { container: 'w-7 h-7', text: 'text-[10px]' },
};

export function UserAvatar({ name, size = 'xs', showTooltip = false, className = '' }: UserAvatarProps) {
  const s = SIZES[size];
  const initials = getInitials(name || '?');

  return (
    <div className={`relative ${showTooltip ? 'group/avatar' : ''} ${className}`}>
      <div className={`${s.container} rounded-full bg-[#FF5E00] flex items-center justify-center`}>
        <span className={`${s.text} font-medium text-white leading-none`}>{initials}</span>
      </div>
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 text-[10px] font-medium text-white bg-neutral-800 rounded whitespace-nowrap opacity-0 pointer-events-none group-hover/avatar:opacity-100 transition-opacity duration-75">
          {name}
        </div>
      )}
    </div>
  );
}
