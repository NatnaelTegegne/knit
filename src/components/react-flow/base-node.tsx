'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseNodeProps {
  children: ReactNode;
  selected?: boolean;
  className?: string;
}

export const BaseNode = memo(function BaseNode({
  children,
  selected,
  className,
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card px-4 py-3 shadow-sm transition-colors',
        selected ? 'border-primary' : 'border-border',
        className
      )}
    >
      {children}
    </div>
  );
});
