'use client';

import { cn } from '@/lib/utils';
import { Loader2Icon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

export type NodeStatus = 'idle' | 'loading' | 'success' | 'error';

interface NodeStatusIndicatorProps {
  status: NodeStatus;
  className?: string;
}

export function NodeStatusIndicator({ status, className }: NodeStatusIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm',
        className
      )}
    >
      {status === 'loading' && (
        <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
      )}
      {status === 'success' && (
        <CheckCircleIcon className="h-4 w-4 text-green-500" />
      )}
      {status === 'error' && (
        <XCircleIcon className="h-4 w-4 text-destructive" />
      )}
    </div>
  );
}
