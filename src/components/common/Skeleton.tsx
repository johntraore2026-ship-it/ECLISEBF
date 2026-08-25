import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'card' | 'table-row';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  count = 1
}) => {
  const items = Array.from({ length: count });

  if (variant === 'circular') {
    return (
      <div className={`animate-pulse bg-slate-800 rounded-full ${className}`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-3 ${className}`}
          >
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-6 bg-slate-800 rounded-lg w-16" />
            </div>
            <div className="h-6 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="pt-2 border-t border-slate-800 flex justify-between">
              <div className="h-3 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="space-y-2">
        {items.map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4"
          >
            <div className="h-4 bg-slate-800 rounded w-1/6" />
            <div className="h-4 bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-800 rounded w-1/5" />
            <div className="h-4 bg-slate-800 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800/80 rounded-xl ${className || 'h-10 w-full'}`}
        />
      ))}
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ cols?: number; count?: number }> = ({
  cols = 3,
  count = 6
}) => {
  const gridClasses = cols === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : cols === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClasses} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-800 rounded w-24" />
            <div className="h-7 w-7 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-6 bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-800/60 rounded w-1/2" />
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-800 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};
