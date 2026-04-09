import React from 'react';

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-neutral-200/60 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-3 space-y-2.5">
      <SkeletonPulse className="h-4 w-3/4" />
      <SkeletonPulse className="h-4 w-16 rounded-sm" />
      <SkeletonPulse className="h-3 w-full" />
      <SkeletonPulse className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-1">
        <SkeletonPulse className="h-2.5 w-12" />
        <SkeletonPulse className="h-2.5 w-8" />
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  const cardCounts = [3, 2, 2, 1, 1, 0, 1];
  return (
    <div className="flex-1 min-h-0 overflow-hidden pb-4">
      <div className="flex gap-4 min-w-max h-full">
        {cardCounts.map((count, i) => (
          <div key={i} className="w-[280px] flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <SkeletonPulse className="w-2 h-2 rounded-full" />
              <SkeletonPulse className="h-3 w-20" />
            </div>
            <div className="flex-1 rounded-xl bg-neutral-100/50 p-2 space-y-2">
              {Array.from({ length: count }).map((_, j) => (
                <SkeletonCard key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
