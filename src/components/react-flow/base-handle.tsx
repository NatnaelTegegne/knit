'use client';

import { Handle, type HandleProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface BaseHandleProps extends HandleProps {
  className?: string;
}

export function BaseHandle({ className, ...props }: BaseHandleProps) {
  return (
    <Handle
      className={cn(
        '!h-3 !w-3 !border-2 !border-background !bg-primary',
        className
      )}
      {...props}
    />
  );
}
